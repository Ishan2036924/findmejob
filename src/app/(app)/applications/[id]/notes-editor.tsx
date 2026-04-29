'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateApplicationNotes } from '@/lib/applications/actions';
import { toast } from 'sonner';

export function NotesEditor({
  applicationId,
  initialNotes,
}: {
  applicationId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (notes === initialNotes) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      startTransition(async () => {
        const result = await updateApplicationNotes(applicationId, notes);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        setSavedAt(Date.now());
      });
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [notes, applicationId, initialNotes]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-muted-foreground">
          Notes
        </Label>
        <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground/70">
          {pending ? (
            <>
              <Loader2 className="size-3 animate-spin" /> saving…
            </>
          ) : savedAt ? (
            <>
              <Check className="size-3 text-emerald-400/70" strokeWidth={2} /> saved
            </>
          ) : null}
        </span>
      </div>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Recruiter contact, interview dates, follow-up reminders, why this role appeals…"
        className="min-h-32 resize-y text-sm leading-relaxed"
      />
    </div>
  );
}
