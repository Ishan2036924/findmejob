import { cn } from '@/lib/utils';

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type StatusBadgeProps = {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
  className?: string;
};

const TONE: Record<ApplicationStatus, string> = {
  saved: 'border-zinc-400/30 bg-zinc-400/10 text-zinc-300',
  applied: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  interview: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  offer: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  rejected: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  withdrawn: 'border-zinc-400/30 bg-zinc-400/5 text-zinc-400',
};

const SIZE: Record<NonNullable<StatusBadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-[11px]',
};

const LABEL: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

/**
 * Pill matching the visual feel of `<MatchBadge />` — used for application
 * statuses across the list + detail surfaces.
 */
export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium uppercase tracking-wider',
        TONE[status],
        SIZE[size],
        className,
      )}
    >
      {LABEL[status]}
    </span>
  );
}
