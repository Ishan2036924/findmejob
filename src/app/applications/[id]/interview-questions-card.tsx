'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { generateInterviewQuestions } from '@/lib/artifacts/actions';
import type { InterviewQuestionsOutput } from '@/lib/ai/schemas/interview-questions';
import { cn } from '@/lib/utils';

type Props = {
  applicationId: string;
  initialOutput: InterviewQuestionsOutput | null;
};

export function InterviewQuestionsCard({ applicationId, initialOutput }: Props) {
  const router = useRouter();
  const output = initialOutput;
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  function fire() {
    startTransition(async () => {
      const result = await generateInterviewQuestions(applicationId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      toast.success('Interview questions ready');
      setExpanded(true);
    });
  }

  const total = output
    ? output.technical.length + output.behavioral.length + output.situational.length
    : 0;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-card/40 p-5 backdrop-blur transition-all',
        output
          ? 'border-emerald-400/20 bg-emerald-400/[0.03]'
          : 'border-white/10 hover:border-white/20',
        expanded && 'sm:col-span-2 lg:col-span-3',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <HelpCircle className="size-4 text-foreground/80" strokeWidth={1.5} />
        </div>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider',
            output
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300/90'
              : 'border-white/10 bg-white/5 text-muted-foreground',
          )}
        >
          {output ? `${total} ready` : 'On demand'}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-medium tracking-tight">Interview questions</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          5 technical · 4 behavioral (with STAR scaffolding) · 3 situational. Tied to the JD.
        </p>
      </div>

      {!output && (
        <button
          type="button"
          disabled={pending}
          onClick={fire}
          className={cn(
            'mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            pending
              ? 'border-white/10 bg-white/5 text-muted-foreground'
              : 'border-foreground/30 bg-foreground/10 text-foreground hover:bg-foreground/20',
          )}
        >
          {pending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> Working
            </>
          ) : (
            <>
              <Sparkles className="size-3.5" strokeWidth={1.5} /> Generate
            </>
          )}
        </button>
      )}

      {output && (
        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-left text-xs italic text-muted-foreground hover:text-foreground"
          >
            {expanded ? '— hide questions —' : `— ${output.meta_summary} (click to expand)`}
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-5 rounded-lg border border-white/10 bg-background/40 p-4 text-xs leading-relaxed">
                  <CategoryBlock title="Technical" tone="sky">
                    <ul className="space-y-3">
                      {output.technical.map((q, i) => (
                        <li key={i}>
                          <p className="font-medium text-foreground/90">{q.question}</p>
                          <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                            why likely: {q.why_likely}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CategoryBlock>

                  <CategoryBlock title="Behavioral (STAR)" tone="violet">
                    <ul className="space-y-3">
                      {output.behavioral.map((q, i) => (
                        <li key={i}>
                          <p className="font-medium text-foreground/90">{q.question}</p>
                          <div className="mt-1 grid grid-cols-1 gap-1 text-[11px] sm:grid-cols-2">
                            <p>
                              <span className="font-mono text-muted-foreground">S:</span>{' '}
                              {q.star_scaffold.situation}
                            </p>
                            <p>
                              <span className="font-mono text-muted-foreground">T:</span>{' '}
                              {q.star_scaffold.task}
                            </p>
                            <p>
                              <span className="font-mono text-muted-foreground">A:</span>{' '}
                              {q.star_scaffold.action_hint}
                            </p>
                            <p>
                              <span className="font-mono text-muted-foreground">R:</span>{' '}
                              {q.star_scaffold.result_hint}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CategoryBlock>

                  <CategoryBlock title="Situational" tone="amber">
                    <ul className="space-y-3">
                      {output.situational.map((q, i) => (
                        <li key={i}>
                          <p className="font-medium text-foreground/90">{q.question}</p>
                          <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                            why likely: {q.why_likely}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CategoryBlock>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/applications/${applicationId}/practice`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-foreground transition-colors hover:bg-white/10"
            >
              Practice answers →
            </Link>
            <button
              type="button"
              disabled={pending}
              onClick={fire}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {pending ? (
                <>
                  <Loader2 className="size-3 animate-spin" /> Regenerating
                </>
              ) : (
                <>
                  <RefreshCw className="size-3" strokeWidth={1.5} /> Regenerate
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryBlock({
  title,
  tone,
  children,
}: {
  title: string;
  tone: 'sky' | 'violet' | 'amber';
  children: React.ReactNode;
}) {
  const toneClass = {
    sky: 'text-sky-300/80',
    violet: 'text-violet-300/80',
    amber: 'text-amber-300/80',
  }[tone];
  return (
    <div className="flex flex-col gap-2">
      <p className={cn('text-[10px] uppercase tracking-wider', toneClass)}>{title}</p>
      <div className="text-foreground/90">{children}</div>
    </div>
  );
}
