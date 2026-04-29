'use client';

import { useTransition, useState } from 'react';
import { toast } from 'sonner';
import { updateApplicationStatus } from '@/lib/applications/actions';
import { cn } from '@/lib/utils';
import type { ApplicationStatus } from '@/lib/applications/queries';

const STATUSES: { value: ApplicationStatus; label: string; tone: string }[] = [
  { value: 'saved', label: 'Saved', tone: 'border-zinc-400/30 bg-zinc-400/5 text-zinc-300' },
  { value: 'applied', label: 'Applied', tone: 'border-sky-400/30 bg-sky-400/10 text-sky-300' },
  { value: 'interview', label: 'Interview', tone: 'border-amber-400/30 bg-amber-400/10 text-amber-300' },
  { value: 'offer', label: 'Offer', tone: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' },
  { value: 'rejected', label: 'Rejected', tone: 'border-rose-400/30 bg-rose-400/10 text-rose-300' },
  { value: 'withdrawn', label: 'Withdrawn', tone: 'border-zinc-400/30 bg-zinc-400/10 text-zinc-400' },
];

export function StatusPills({
  applicationId,
  initialStatus,
}: {
  applicationId: string;
  initialStatus: ApplicationStatus;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((s) => {
        const selected = status === s.value;
        return (
          <button
            key={s.value}
            type="button"
            disabled={pending}
            onClick={() => {
              if (selected) return;
              const previous = status;
              setStatus(s.value);
              startTransition(async () => {
                const result = await updateApplicationStatus(applicationId, s.value);
                if (!result.ok) {
                  setStatus(previous);
                  toast.error(result.error);
                }
              });
            }}
            className={cn(
              'rounded-full border px-3.5 py-1 text-xs font-medium uppercase tracking-wider transition-all duration-150',
              selected
                ? s.tone
                : 'border-white/10 bg-card/30 text-muted-foreground hover:border-white/20 hover:bg-card/50 hover:text-foreground',
              pending && 'opacity-60',
            )}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
