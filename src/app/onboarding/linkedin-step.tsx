'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  SkipForward,
  UploadCloud,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  commitLinkedinMerge,
  commitLinkedinText,
  uploadLinkedinPdf,
} from '@/lib/profile/actions';
import type { ResumeJson } from '@/lib/ai/schemas/profile';

type Mode = 'upload' | 'paste' | 'skip';

export function LinkedinStep({
  onAdvance,
  onMerged,
}: {
  onAdvance: () => void;
  onMerged?: (rawText: string) => void;
}) {
  const [mode, setMode] = useState<Mode>('upload');

  return (
    <div className="flex flex-col gap-6">
      <Header
        eyebrow="Your LinkedIn"
        title="Add LinkedIn context."
        subtitle="LinkedIn doesn't allow apps to fetch profiles directly — pick one of the two quick options below, or skip."
      />

      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 text-xs leading-relaxed text-amber-200/80">
        <Lock className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
        <span>
          LinkedIn&apos;s Terms of Service prohibit third-party apps from
          fetching profiles. Both options below stay private to your account
          and feed the same parser as your resume.
        </span>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode((v as Mode) ?? 'upload')}>
        <TabsList>
          <TabsTrigger value="upload">Upload PDF export</TabsTrigger>
          <TabsTrigger value="paste">Paste text</TabsTrigger>
          <TabsTrigger value="skip">Skip for now</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <UploadTab onDone={onAdvance} onMerged={onMerged} />
        </TabsContent>

        <TabsContent value="paste" className="mt-4">
          <PasteTab onDone={onAdvance} onMerged={onMerged} />
        </TabsContent>

        <TabsContent value="skip" className="mt-4">
          <SkipTab onAdvance={onAdvance} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UploadTab({
  onDone,
  onMerged,
}: {
  onDone: () => void;
  onMerged?: (rawText: string) => void;
}) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<{ resumeJson: ResumeJson; rawText: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsing, startParse] = useTransition();
  const [saving, startSave] = useTransition();

  const handleFile = useCallback((file: File) => {
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
      const res = await uploadLinkedinPdf(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setParsed({ resumeJson: res.resumeJson, rawText: res.rawText });
    });
  }, []);

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

  function save() {
    if (!parsed) {
      toast.error('Upload a PDF first.');
      return;
    }
    startSave(async () => {
      const res = await commitLinkedinMerge(parsed);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      onMerged?.(parsed.rawText);
      toast.success('LinkedIn merged into your profile.');
      onDone();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-white/10 bg-card/40 p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          How to export your LinkedIn profile
        </div>
        <ol className="mt-3 flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground">
          <li>
            <span className="text-foreground">1.</span> Open LinkedIn → click your photo →
            Settings &amp; Privacy.
          </li>
          <li>
            <span className="text-foreground">2.</span> Data Privacy → Get a copy of your data.
          </li>
          <li>
            <span className="text-foreground">3.</span> Pick &ldquo;Want something in
            particular?&rdquo; → check &ldquo;Profile&rdquo; → Request archive.
          </li>
          <li>
            <span className="text-foreground">4.</span> LinkedIn emails the file in ~10 minutes.
            Drop the PDF below.
          </li>
        </ol>
      </div>

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
                ? 'Parsed. Ready to merge.'
                : 'Drop the LinkedIn PDF here or click to choose'}
          </span>
          <span className="text-xs text-muted-foreground">
            {pdfFile && !parsing
              ? `${pdfFile.name} · ${(pdfFile.size / 1024).toFixed(0)} KB`
              : 'PDF only · max 5MB'}
          </span>
        </div>
      </label>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/[0.06] p-3 text-xs text-red-300">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.5} />
          <span>{error}</span>
        </div>
      )}

      {parsed && (
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} size="sm" className="gap-2">
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Merging…
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3.5" strokeWidth={1.5} />
                Merge &amp; continue
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function PasteTab({
  onDone,
  onMerged,
}: {
  onDone: () => void;
  onMerged?: (rawText: string) => void;
}) {
  const [text, setText] = useState('');
  const [saving, startSave] = useTransition();

  function save() {
    if (text.trim().length < 200) {
      toast.error('Paste at least 200 characters.');
      return;
    }
    startSave(async () => {
      const res = await commitLinkedinText(text);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      onMerged?.(text.trim());
      toast.success('LinkedIn merged into your profile.');
      onDone();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-relaxed text-muted-foreground">
        On LinkedIn, copy the &ldquo;About&rdquo;, &ldquo;Experience&rdquo;, and
        &ldquo;Skills&rdquo; sections of your profile and paste below. We extract structure
        from this just like the resume.
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your LinkedIn About + Experience + Skills sections here."
        className="min-h-[280px] resize-y font-mono text-xs leading-relaxed"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {text.length} chars
          {text.length > 0 && text.length < 200 && (
            <span className="ml-2 text-amber-400/80">need at least 200</span>
          )}
        </span>
        <span className="font-mono opacity-60">private to your account</span>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={save}
          disabled={saving || text.trim().length < 200}
          size="sm"
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Parsing &amp; merging…
            </>
          ) : (
            <>
              <CheckCircle2 className="size-3.5" strokeWidth={1.5} />
              Merge &amp; continue
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SkipTab({ onAdvance }: { onAdvance: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-card/40 p-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        You can add LinkedIn later from your dashboard. Without it, the assessment
        will rely only on your resume — fine, but you may miss credit for projects or
        roles you only describe on LinkedIn.
      </p>
      <div className="flex justify-end">
        <Button onClick={onAdvance} variant="outline" size="sm" className="gap-2">
          <SkipForward className="size-3.5" strokeWidth={1.5} />
          Skip for now
        </Button>
      </div>
    </div>
  );
}

function Header({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{eyebrow}</span>
      <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}
