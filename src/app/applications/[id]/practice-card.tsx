import Link from 'next/link';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  applicationId: string;
  hasInterviewQuestions: boolean;
  sessionCount: number;
};

export function PracticeCard({ applicationId, hasInterviewQuestions, sessionCount }: Props) {
  const ready = hasInterviewQuestions;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-card/40 p-5 backdrop-blur transition-all',
        sessionCount > 0
          ? 'border-emerald-400/20 bg-emerald-400/[0.03]'
          : 'border-white/10 hover:border-white/20',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <Mic className="size-4 text-foreground/80" strokeWidth={1.5} />
        </div>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider',
            sessionCount > 0
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300/90'
              : ready
                ? 'border-white/10 bg-white/5 text-muted-foreground'
                : 'border-white/5 bg-white/[0.02] text-muted-foreground/60',
          )}
        >
          {sessionCount > 0
            ? `${sessionCount} session${sessionCount === 1 ? '' : 's'}`
            : ready
              ? 'Ready'
              : 'Locked'}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-medium tracking-tight">Practice answers</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Type an answer to a generated question. Mini scores 0–10 with specific improvements.
        </p>
      </div>

      {ready ? (
        <Link
          href={`/applications/${applicationId}/practice`}
          className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-foreground/30 bg-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/20"
        >
          {sessionCount > 0 ? 'Continue practicing' : 'Start practice session'}
        </Link>
      ) : (
        <p className="mt-auto rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          Generate <span className="text-foreground">interview questions</span> first — practice
          uses them as your prompt set.
        </p>
      )}
    </div>
  );
}
