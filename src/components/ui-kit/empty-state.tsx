import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
};

/**
 * Consistent empty state primitive. Centered icon-in-circle, title,
 * optional description, optional CTA. Dashed-border container matches the
 * existing pattern used across the app.
 *
 * Note: when `action.onClick` is supplied this component must be rendered
 * inside a client component — the onClick will be a no-op in RSCs.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-card/30 p-10 text-center backdrop-blur',
        className,
      )}
    >
      {Icon ? (
        <div className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-background/40">
          <Icon className="size-5 text-muted-foreground/70" strokeWidth={1.5} />
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-medium tracking-tight">{title}</h3>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        action.href ? (
          <Link href={action.href} className={cn(buttonVariants({ size: 'lg' }), 'mt-2')}>
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className={cn(buttonVariants({ size: 'lg' }), 'mt-2')}
          >
            {action.label}
          </button>
        )
      ) : null}
    </div>
  );
}
