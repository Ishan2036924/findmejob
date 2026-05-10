import { cn } from '@/lib/utils';

// Deterministic palette per company so the same logo placeholder shows the
// same color on every render. Tailwind classes — keep them as full strings
// so the JIT picks them up.
const PALETTE = [
  'from-indigo-500/30 to-purple-500/20 text-indigo-200',
  'from-emerald-500/30 to-teal-500/20 text-emerald-200',
  'from-rose-500/30 to-pink-500/20 text-rose-200',
  'from-amber-500/30 to-orange-500/20 text-amber-200',
  'from-sky-500/30 to-blue-500/20 text-sky-200',
  'from-fuchsia-500/30 to-purple-500/20 text-fuchsia-200',
  'from-cyan-500/30 to-teal-500/20 text-cyan-200',
  'from-lime-500/30 to-emerald-500/20 text-lime-200',
] as const;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const SIZE_CLASSES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
} as const;

/**
 * Letter-avatar fallback for a company logo. Deterministic gradient color per
 * company name — same name always renders the same swatch. Use until we wire
 * up real Clearbit / favicon resolution.
 */
export function CompanyAvatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const palette = PALETTE[hash(name) % PALETTE.length];
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br font-semibold tracking-tight',
        palette,
        SIZE_CLASSES[size],
        className,
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}
