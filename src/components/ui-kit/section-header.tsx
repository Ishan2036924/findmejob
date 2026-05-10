import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/**
 * Page-level header. Eyebrow + h1 + optional description on the left,
 * actions slot on the right (refresh button, paste button, etc.).
 *
 * Stacks vertically on mobile, splits into rows at sm+.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-6',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-2">
        {eyebrow ? (
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <div className="text-sm text-muted-foreground">{description}</div>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">{actions}</div> : null}
    </div>
  );
}
