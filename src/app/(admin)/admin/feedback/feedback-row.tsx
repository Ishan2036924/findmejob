'use client';

import { useState, useTransition } from 'react';
import { ChevronDown, ExternalLink, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { updateFeedback } from '@/lib/feedback/actions';

type Status = 'new' | 'triaged' | 'resolved' | 'wontfix';

const STATUSES: Status[] = ['new', 'triaged', 'resolved', 'wontfix'];

export function FeedbackRow({
  id,
  createdAt,
  email,
  body,
  pageUrl,
  status,
  adminNotes,
  attachmentUrl,
  attachmentName,
}: {
  id: string;
  createdAt: string;
  email: string | null;
  body: string;
  pageUrl: string | null;
  status: Status;
  adminNotes: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status>(status);
  const [notes, setNotes] = useState<string>(adminNotes ?? '');
  const [pending, startTransition] = useTransition();

  const dirty =
    currentStatus !== status || (notes ?? '') !== (adminNotes ?? '');
  const created = new Date(createdAt);
  const preview = body.length > 80 ? `${body.slice(0, 80).trim()}…` : body;

  function save() {
    startTransition(async () => {
      const res = await updateFeedback(id, {
        status: currentStatus,
        admin_notes: notes.trim() || null,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success('Updated.');
    });
  }

  return (
    <li className="flex flex-col">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className={cn(
          'grid grid-cols-[160px_minmax(0,1fr)_minmax(0,2fr)_120px] items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-white/[0.02]',
          expanded && 'bg-white/[0.02]',
        )}
      >
        <span className="font-mono text-[11px] text-muted-foreground">
          {created.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <span className="truncate text-xs">
          {email ?? <span className="text-muted-foreground">unknown</span>}
        </span>
        <span className="truncate text-xs text-muted-foreground">{preview}</span>
        <div className="flex items-center justify-end gap-2">
          <StatusBadge status={currentStatus} />
          <ChevronDown
            className={cn(
              'size-3.5 text-muted-foreground transition-transform',
              expanded && 'rotate-180',
            )}
            strokeWidth={1.5}
          />
        </div>
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-white/5 bg-black/20 px-4 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Body
            </span>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {body}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Page">
              {pageUrl ? (
                <span className="font-mono text-xs">{pageUrl}</span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </Field>
            <Field label="Attachment">
              {attachmentUrl ? (
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-foreground underline-offset-4 hover:underline"
                >
                  {attachmentName ?? 'open'}
                  <ExternalLink className="size-3" strokeWidth={1.5} />
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Status">
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value as Status)}
                className="rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-popover text-popover-foreground">
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Feedback ID">
              <span className="font-mono text-[11px] text-muted-foreground">{id}</span>
            </Field>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Admin notes
            </span>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal triage notes (not shown to user)."
              className="min-h-[80px] text-xs"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={save}
              disabled={!dirty || pending}
              className="gap-2"
            >
              {pending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="size-3.5" strokeWidth={1.5} />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const tones: Record<Status, string> = {
    new: 'border-amber-500/30 bg-amber-500/[0.08] text-amber-200/90',
    triaged: 'border-sky-500/30 bg-sky-500/[0.08] text-sky-200/90',
    resolved: 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-200/90',
    wontfix: 'border-white/10 bg-white/[0.04] text-muted-foreground',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px]',
        tones[status],
      )}
    >
      {status}
    </span>
  );
}
