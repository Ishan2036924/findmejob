import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MetricStatProps = {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  accent?: 'default' | 'emerald' | 'amber' | 'rose' | 'indigo';
  icon?: LucideIcon;
  className?: string;
};

const ACCENT_CLASSES: Record<NonNullable<MetricStatProps['accent']>, string> = {
  default: 'text-foreground',
  emerald: 'text-emerald-300',
  amber: 'text-amber-300',
  rose: 'text-rose-300',
  indigo: 'text-indigo-300',
};

const ACCENT_GLOW: Record<NonNullable<MetricStatProps['accent']>, string> = {
  default: 'from-white/5',
  emerald: 'from-emerald-500/10',
  amber: 'from-amber-500/10',
  rose: 'from-rose-500/10',
  indigo: 'from-indigo-500/10',
};

/**
 * Big-number stat card. Top-left muted label, center large mono value,
 * optional bottom-right hint, optional top-right icon. Whole card hover-lifts
 * if `href` is set.
 */
export function MetricStat({
  label,
  value,
  hint,
  href,
  accent = 'default',
  icon: Icon,
  className,
}: MetricStatProps) {
  const valueClass = ACCENT_CLASSES[accent];
  const glowClass = ACCENT_GLOW[accent];

  const inner = (
    <div
      className={cn(
        'group/metric relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur transition-all duration-200',
        href && 'hover:border-white/20 hover:bg-card/60 hover:-translate-y-px',
        className,
      )}
    >
      {/* subtle accent glow top-left */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-gradient-to-br to-transparent opacity-50 blur-2xl',
          glowClass,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon ? (
          <Icon
            className="size-4 text-muted-foreground/70 transition-colors group-hover/metric:text-foreground/80"
            strokeWidth={1.5}
          />
        ) : null}
      </div>
      <div className={cn('relative mt-3 font-mono text-3xl font-semibold tabular-nums tracking-tight', valueClass)}>
        {value}
      </div>
      {hint ? (
        <div className="relative mt-auto pt-3 text-xs text-muted-foreground/80">{hint}</div>
      ) : null}
    </div>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-2xl">
      {inner}
    </Link>
  );
}
