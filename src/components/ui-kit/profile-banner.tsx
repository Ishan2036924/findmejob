import { cn } from '@/lib/utils';
import { MatchBadge } from './match-badge';

export type ProfileBannerProps = {
  email: string;
  displayName?: string | null;
  roleLabel?: string | null;
  seniorityLabel?: string | null;
  location?: string | null;
  /** 0-100 — when set, shows a match-style pill at the right of the header row. */
  assessmentScore?: number | null;
  rubricVersion?: string | null;
  className?: string;
};

function initialsFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  const cleaned = local.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  if (!cleaned) return email.slice(0, 2).toUpperCase();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * LinkedIn-style profile banner: gradient cover strip + overlapping avatar +
 * name + targeting line. Optional assessment score on the right.
 *
 * Width: full inside its container (caller controls max-width). Height ~200px.
 */
export function ProfileBanner({
  email,
  displayName,
  roleLabel,
  seniorityLabel,
  location,
  assessmentScore,
  rubricVersion,
  className,
}: ProfileBannerProps) {
  const initials = initialsFromEmail(email);
  const name = displayName?.trim() || nameFromEmail(email);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10 bg-card/40 backdrop-blur',
        className,
      )}
    >
      {/* Cover strip — gradient + dot pattern */}
      <div
        aria-hidden
        className="relative h-24 w-full bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-fuchsia-500/15 sm:h-28"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60"
        />
      </div>

      {/* Body */}
      <div className="relative px-5 pb-6 pt-0 sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
          {/* Avatar — overlaps cover */}
          <div className="-mt-12 flex shrink-0 sm:-mt-14">
            <div
              aria-hidden
              className="flex size-20 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-indigo-500/40 to-purple-500/30 font-mono text-xl font-semibold tracking-tight text-foreground shadow-lg shadow-indigo-500/10 sm:size-24 sm:text-2xl"
            >
              {initials}
            </div>
          </div>

          {/* Name + targeting */}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1 sm:pt-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                {name}
              </h1>
              <span className="truncate text-xs text-muted-foreground sm:text-sm">{email}</span>
            </div>
            {(roleLabel || seniorityLabel || location) && (
              <p className="text-sm text-muted-foreground">
                Targeting{' '}
                {roleLabel ? <span className="text-foreground">{roleLabel}</span> : '—'}
                {seniorityLabel ? <> · {seniorityLabel}</> : null}
                {location ? <> · {location}</> : null}
              </p>
            )}
          </div>

          {/* Assessment badge on the right */}
          {assessmentScore !== undefined && assessmentScore !== null ? (
            <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
              <MatchBadge score={assessmentScore} size="lg" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                Assessment
                {rubricVersion ? <> · {rubricVersion}</> : null}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
