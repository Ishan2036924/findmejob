'use client';

import { cn } from '@/lib/utils';

export type FilterPill = {
  key: string;
  label: string;
  count?: number;
};

export type FilterPillsProps = {
  options: FilterPill[];
  value: string | null; // selected key, null = all
  onChange: (key: string | null) => void;
  allLabel?: string;
  className?: string;
};

/**
 * Horizontal scrollable row of toggleable pill chips.
 *
 * The "All" pill is always rendered first and represents `value === null`.
 * Pills overflow horizontally on mobile (no clipping at viewport edges —
 * `-mx-2 px-2` for edge bleed).
 */
export function FilterPills({
  options,
  value,
  onChange,
  allLabel = 'All',
  className,
}: FilterPillsProps) {
  return (
    <div
      className={cn(
        '-mx-2 flex items-center gap-2 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      <PillButton
        active={value === null}
        onClick={() => onChange(null)}
        label={allLabel}
      />
      {options.map((opt) => (
        <PillButton
          key={opt.key}
          active={value === opt.key}
          onClick={() => onChange(opt.key)}
          label={opt.label}
          count={opt.count}
        />
      ))}
    </div>
  );
}

function PillButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-all',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-white/10 bg-card/30 text-muted-foreground hover:border-white/20 hover:text-foreground',
      )}
    >
      {label}
      {typeof count === 'number' ? (
        <span
          className={cn(
            'rounded-full px-1.5 text-[10px] font-mono tabular-nums',
            active ? 'bg-background/15 text-background' : 'bg-white/5 text-muted-foreground',
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
