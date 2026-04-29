'use client';

import { useState, useTransition, useRef, useCallback } from 'react';
import { Loader2, FileText, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { uploadResumePdf, parseResumeText, commitResume } from '@/lib/profile/actions';
import type { ResumeJson } from '@/lib/ai/schemas/profile';

type Mode = 'pdf' | 'paste';

export type ResumeUploadProps = {
  /** Initial textarea value (existing raw_resume_text). */
  initialText?: string;
  /**
   * Called when the user wants to use a textarea-only flow (onboarding).
   * If provided, the paste tab calls this on every change instead of saving
   * itself, and the PDF tab calls it after a successful parse with the raw
   * extracted text. Disables the inline "Save resume" button.
   */
  onTextChange?: (text: string) => void;
  /**
   * Show the inline "Save resume" button that calls commitResume directly.
   * Used by the dashboard "replace resume" flow. Defaults to false.
   */
  enableInlineSave?: boolean;
  /** Called after a successful inline save. */
  onSaved?: () => void;
};

export function ResumeUpload({
  initialText = '',
  onTextChange,
  enableInlineSave = false,
  onSaved,
}: ResumeUploadProps) {
  const [mode, setMode] = useState<Mode>('pdf');
  const [pasteText, setPasteText] = useState(initialText);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<{ resumeJson: ResumeJson; rawText: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsing, startParse] = useTransition();
  const [saving, startSave] = useTransition();

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      setParsed(null);
      setPdfFile(file);

      if (file.type !== 'application/pdf') {
        setError('Only PDF files are accepted.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('PDF must be 5MB or smaller.');
        return;
      }

      startParse(async () => {
        const fd = new FormData();
        fd.append('file', file);
        const res = await uploadResumePdf(fd);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setParsed({ resumeJson: res.resumeJson, rawText: res.rawText });
        onTextChange?.(res.rawText);
      });
    },
    [onTextChange],
  );

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handlePasteChange(value: string) {
    setPasteText(value);
    onTextChange?.(value);
  }

  function saveInline() {
    if (mode === 'pdf') {
      if (!parsed) {
        toast.error('Upload a PDF first.');
        return;
      }
      startSave(async () => {
        const res = await commitResume(parsed);
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        toast.success('Resume saved.');
        onSaved?.();
      });
      return;
    }

    // Paste mode inline save: parse via server, then commit.
    if (pasteText.trim().length < 200) {
      toast.error('Paste at least 200 characters.');
      return;
    }
    startSave(async () => {
      const parseRes = await parseResumeText(pasteText);
      if (!parseRes.ok) {
        toast.error(parseRes.error);
        return;
      }
      const commitRes = await commitResume({
        resumeJson: parseRes.resumeJson,
        rawText: parseRes.rawText,
      });
      if (!commitRes.ok) {
        toast.error(commitRes.error);
        return;
      }
      toast.success('Resume saved.');
      onSaved?.();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Tabs value={mode} onValueChange={(v) => setMode((v as Mode) ?? 'pdf')}>
        <TabsList>
          <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
          <TabsTrigger value="paste">Paste text</TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="mt-4">
          <div className="flex flex-col gap-3">
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cn(
                'group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/40 px-6 py-10 text-center transition-all',
                dragOver
                  ? 'border-white/40 bg-white/[0.06]'
                  : 'border-white/15 hover:border-white/25 hover:bg-card/60',
                parsing && 'pointer-events-none opacity-70',
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={onPick}
              />
              <div className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                {parsing ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                ) : parsed ? (
                  <CheckCircle2 className="size-4 text-emerald-400" strokeWidth={1.5} />
                ) : (
                  <UploadCloud className="size-4" strokeWidth={1.5} />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium tracking-tight">
                  {parsing
                    ? 'Extracting and parsing…'
                    : parsed
                      ? 'Parsed. Review below.'
                      : 'Drop a PDF here or click to choose'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {pdfFile && !parsing
                    ? `${pdfFile.name} · ${(pdfFile.size / 1024).toFixed(0)} KB`
                    : 'PDF only · max 5MB · text-based PDFs only (not scans)'}
                </span>
              </div>
            </label>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/[0.06] p-3 text-xs text-red-300">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.5} />
                <span>{error}</span>
              </div>
            )}

            {parsed && <ParsedPreview resume={parsed.resumeJson} />}

            {enableInlineSave && parsed && (
              <div className="flex justify-end">
                <Button onClick={saveInline} disabled={saving} size="sm" className="gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5" strokeWidth={1.5} />
                      Save resume
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="paste" className="mt-4">
          <div className="flex flex-col gap-2">
            <Textarea
              value={pasteText}
              onChange={(e) => handlePasteChange(e.target.value)}
              placeholder="Paste your full resume text here — name, email, experience, education, skills, projects."
              className="min-h-[320px] resize-y font-mono text-xs leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {pasteText.length} chars
                {pasteText.length > 0 && pasteText.length < 100 && (
                  <span className="ml-2 text-amber-400/80">need at least 100</span>
                )}
              </span>
              <span className="font-mono opacity-60">private to your account</span>
            </div>
            {enableInlineSave && (
              <div className="flex justify-end">
                <Button
                  onClick={saveInline}
                  disabled={saving || pasteText.trim().length < 200}
                  size="sm"
                  className="gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Parsing & saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5" strokeWidth={1.5} />
                      Save resume
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ParsedPreview({ resume }: { resume: ResumeJson }) {
  const expCount = resume.experience.length;
  const eduCount = resume.education.length;
  const projCount = resume.projects.length;
  const skillCount = resume.skills.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="rounded-xl border border-white/10 bg-card/40 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <FileText className="size-3.5" strokeWidth={1.5} />
        Parsed preview
      </div>
      <div className="mt-3 flex flex-col gap-1.5 text-sm">
        <div>
          <span className="font-medium tracking-tight">{resume.contact.name || 'Unnamed'}</span>
          {resume.contact.email && (
            <span className="ml-2 text-xs text-muted-foreground">{resume.contact.email}</span>
          )}
        </div>
        {resume.summary && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {resume.summary}
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Pill label={`${expCount} role${expCount === 1 ? '' : 's'}`} />
        <Pill label={`${eduCount} education`} />
        <Pill label={`${projCount} project${projCount === 1 ? '' : 's'}`} />
        <Pill label={`${skillCount} skills`} />
      </div>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-muted-foreground">
      {label}
    </span>
  );
}
