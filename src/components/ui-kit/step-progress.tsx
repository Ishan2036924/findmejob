import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StepProgressStep = {
  key: string;
  label: string;
};

export type StepProgressProps = {
  steps: StepProgressStep[];
  currentKey: string;
  className?: string;
};

/**
 * Onboarding-style step indicator. Numbered circles connected by a line,
 * with labels below. Mobile (<sm): labels hide for non-current steps; the
 * current step's label is shown in a single-line caption beneath the row
 * to save horizontal space.
 *
 * - upcoming: empty circle + muted label
 * - current : filled indigo circle + bold label
 * - done    : emerald check circle + softened label
 * Connector line: emerald between done steps, white/10 otherwise.
 */
export function StepProgress({ steps, currentKey, className }: StepProgressProps) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === currentKey),
  );
  const current = steps[currentIndex];

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <ol className="flex w-full items-center" aria-label="Onboarding progress">
        {steps.map((step, i) => {
          const state: 'done' | 'current' | 'upcoming' =
            i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming';
          const isLast = i === steps.length - 1;

          return (
            <li
              key={step.key}
              className={cn('flex items-center', isLast ? 'shrink-0' : 'flex-1')}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-colors',
                    state === 'done' &&
                      'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
                    state === 'current' &&
                      'border-indigo-400/60 bg-indigo-500/20 text-indigo-100 shadow-[0_0_0_4px_rgba(99,102,241,0.10)]',
                    state === 'upcoming' &&
                      'border-white/10 bg-card/40 text-muted-foreground',
                  )}
                >
                  {state === 'done' ? (
                    <Check className="size-3.5" strokeWidth={2.25} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={cn(
                    'hidden text-[11px] font-medium leading-none tracking-tight sm:block',
                    state === 'current' && 'text-foreground',
                    state === 'done' && 'text-foreground/70',
                    state === 'upcoming' && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast ? (
                <span
                  aria-hidden
                  className={cn(
                    'mx-2 h-px flex-1 transition-colors sm:mx-3',
                    i < currentIndex ? 'bg-emerald-500/40' : 'bg-white/10',
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      {current ? (
        <p className="text-center text-[11px] font-medium tracking-tight text-foreground sm:hidden">
          Step {currentIndex + 1} of {steps.length} · {current.label}
        </p>
      ) : null}
    </div>
  );
}
