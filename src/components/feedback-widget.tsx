'use client';

import { useRef, useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';
import {
  Loader2,
  MessageSquareWarning,
  Paperclip,
  Send,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  submitFeedback,
  uploadFeedbackAttachment,
} from '@/lib/feedback/actions';

export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [pageUrl, setPageUrl] = useState(pathname ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [uploadedId, setUploadedId] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();
  const [submitting, startSubmit] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setBody('');
    setPageUrl(pathname ?? '');
    setFile(null);
    setUploadedId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setUploadedId(null);
    startUpload(async () => {
      const fd = new FormData();
      fd.append('file', picked);
      const res = await uploadFeedbackAttachment(fd);
      if (!res.ok) {
        toast.error(res.message ?? 'Upload failed.');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setUploadedId(res.id);
    });
  }

  function clearFile() {
    setFile(null);
    setUploadedId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function submit() {
    if (body.trim().length < 5) {
      toast.error('Please write at least a sentence.');
      return;
    }
    if (uploading) {
      toast.error('Wait for the upload to finish.');
      return;
    }
    startSubmit(async () => {
      const fd = new FormData();
      fd.append('body', body.trim());
      fd.append('page_url', pageUrl.trim());
      if (uploadedId) fd.append('attachment_id', uploadedId);

      const res = await submitFeedback(fd);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Thanks — we'll review this.");
      reset();
      setOpen(false);
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // When opening, refresh the auto-filled page URL.
        if (next) setPageUrl(pathname ?? '');
      }}
    >
      <SheetTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
          />
        }
      >
        <MessageSquareWarning className="size-4" strokeWidth={1.5} />
        <span>Report a problem</span>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-0 p-0">
        <SheetHeader className="border-b border-white/5 px-5 py-4">
          <SheetTitle>Report a problem</SheetTitle>
          <SheetDescription>
            Bug, weird AI output, missing feature — anything. The more
            specific, the better.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="feedback-body"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              What happened?
            </Label>
            <Textarea
              id="feedback-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's broken? What's confusing? What did you expect?"
              maxLength={4000}
              className="min-h-[160px] resize-y text-sm leading-relaxed"
            />
            <span className="self-end text-[11px] text-muted-foreground">
              {body.length}/4000
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="feedback-page"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              Page
            </Label>
            <Input
              id="feedback-page"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              placeholder="/dashboard"
              className="font-mono text-xs"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Screenshot (optional)
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Paperclip className="size-3.5" strokeWidth={1.5} />
                )}
                {file ? 'Replace' : 'Attach'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                hidden
                onChange={pickFile}
              />
              {file && (
                <div className="flex flex-1 items-center gap-2 truncate text-xs text-muted-foreground">
                  <span className="truncate">
                    {file.name} · {(file.size / 1024).toFixed(0)} KB
                    {uploadedId && ' · ready'}
                  </span>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Remove attachment"
                  >
                    <X className="size-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/5 px-5 py-4">
          <SheetClose
            render={
              <Button type="button" variant="ghost" size="sm" disabled={submitting}>
                Cancel
              </Button>
            }
          />
          <Button
            type="button"
            onClick={submit}
            disabled={submitting || uploading || body.trim().length < 5}
            size="sm"
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="size-3.5" strokeWidth={1.5} />
                Send
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
