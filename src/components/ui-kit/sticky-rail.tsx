import { cn } from '@/lib/utils';

export type StickyRailProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Right-side sticky container for two-column detail pages. Width is
 * controlled by the parent grid; this component only owns sticky behavior.
 *
 * On mobile, contents stack normally. On `lg+`, the container sticks under
 * the header with its own scroll if its inner height exceeds the viewport.
 */
export function StickyRail({ children, className }: StickyRailProps) {
  return (
    <aside
      className={cn(
        'flex flex-col gap-4',
        'lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto',
        // hide scrollbar visually on lg
        'lg:[scrollbar-width:thin] lg:[&::-webkit-scrollbar]:w-1 lg:[&::-webkit-scrollbar-thumb]:bg-white/10',
        className,
      )}
    >
      {children}
    </aside>
  );
}
