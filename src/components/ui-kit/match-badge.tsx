import { cn } from '@/lib/utils';

export type MatchBadgeProps = {
  score: number | null; // 0-100; null = unscored
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /**
   * When true, renders a thin "scoring…" pill instead of the dashed em-dash.
   * Useful for cards that just got refreshed and are waiting on the scorer.
   */
  loadingLabel?: boolean;
};

function tierClasses(score: number): string {
  if (score >= 85) return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
  if (score >= 70) return 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30';
  if (score >= 50) return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
  return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';
}

const SIZE_CLASSES = {
  sm: {
    pill: 'h-6 px-2 text-[11px]',
    score: 'font-mono tabular-nums text-[11px]',
    label: 'text-[9px]',
  },
  md: {
    pill: 'h-7 px-3 text-xs',
    score: 'font-mono tabular-nums text-xs',
    label: 'text-[10px]',
  },
  lg: {
    pill: 'h-9 px-4 text-sm gap-1.5',
    score: 'font-mono tabular-nums text-base font-semibold leading-none',
    label: 'text-[10px] uppercase tracking-wider',
  },
} as const;

/**
 * Reusable score badge for jobs / applications. Tiered color by score.
 * `lg` shows the score in a larger semibold mono font, with a small "match"
 * label — fits nicely in the right column of a job card.
 */
export function MatchBadge({ score, size = 'md', className, loadingLabel }: MatchBadgeProps) {
  const sz = SIZE_CLASSES[size];

  if (score === null) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full border border-dashed border-white/15 text-muted-foreground',
          sz.pill,
          className,
        )}
      >
        {loadingLabel ? 'scoring…' : '—'}
      </span>
    );
  }

  const tier = tierClasses(score);

  if (size === 'lg') {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full border',
          sz.pill,
          tier,
          className,
        )}
      >
        <span className={sz.score}>{score}</span>
        <span className={cn('opacity-70', sz.label)}>match</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-medium',
        sz.pill,
        tier,
        className,
      )}
    >
      <span className={sz.score}>{score}</span>
    </span>
  );
}
