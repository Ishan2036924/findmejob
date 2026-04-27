import { cn } from '@/lib/utils';

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({
  score,
  size = 144,
  className,
}: {
  score: number; // 0-100
  size?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const dashOffset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          className="stroke-white/8"
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          className="stroke-foreground transition-[stroke-dashoffset] duration-700"
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold tabular-nums tracking-tight">{clamped}</span>
        <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          out of 100
        </span>
      </div>
    </div>
  );
}
