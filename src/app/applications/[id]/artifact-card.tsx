import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ArtifactCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  comingIn: string; // e.g. "Step 6a" or "Slice 2"
  disabled?: boolean;
};

/** Dashboard artifact card — placeholder buttons for the on-demand generation
 * surface. Wired in Step 6a (resume) and Slice 2 (everything else). For now
 * each card shows what it'll do and which slice it lands in. */
export function ArtifactCard({
  icon: Icon,
  title,
  description,
  comingIn,
  disabled = true,
}: ArtifactCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur',
        disabled && 'opacity-70',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <Icon className="size-4 text-foreground/80" strokeWidth={1.5} />
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          {comingIn}
        </span>
      </div>
      <div>
        <h3 className="text-sm font-medium tracking-tight">{title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        className="mt-auto inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground/70 transition-colors disabled:cursor-not-allowed"
      >
        Generate
      </button>
    </div>
  );
}
