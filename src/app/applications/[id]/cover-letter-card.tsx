'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Loader2, PenLine, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { generateCoverLetter } from '@/lib/artifacts/actions';
import type { CoverLetterOutput } from '@/lib/ai/schemas/cover-letter';
import { cn } from '@/lib/utils';

const PHASES = [
  'Reading your resume + the JD…',
  'Drafting an opening tied to your strongest match…',
  'Tightening the body…',
  'Finalizing tone and close…',
];

type Props = {
  applicationId: string;
  initialOutput: CoverLetterOutput | null;
};

export function CoverLetterCard({ applicationId, initialOutput }: Props) {
  const router = useRouter();
  const output = initialOutput;
  const [pending, startTransition] = useTransition();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!pending) return;
    const id = setInterval(
      () => setPhaseIndex((i) => Math.min(i + 1, PHASES.length - 1)),
      4500,
    );
    return () => clearInterval(id);
  }, [pending]);

  function fire() {
    setPhaseIndex(0);
    startTransition(async () => {
      const result = await generateCoverLetter(applicationId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      toast.success('Cover letter ready');
      setExpanded(true);
    });
  }

  async function copy() {
    if (!output) return;
    await navigator.clipboard.writeText(output.letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

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
          <PenLine className="size-4 text-foreground/80" strokeWidth={1.5} />
        </div>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider',
            output
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300/90'
              : 'border-white/10 bg-white/5 text-muted-foreground',
          )}
        >
          {output ? 'Ready' : 'On demand'}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-medium tracking-tight">Cover letter</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Personal cover letter tied to this role and your experience. 200–400 words.
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
            {expanded ? '— hide letter —' : `— ${output.meta_summary} (click to expand)`}
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
                <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-background/40 p-4 text-xs leading-relaxed font-sans text-foreground/90">
                  {output.letter}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-foreground transition-colors hover:bg-white/10"
            >
              {copied ? (
                <>
                  <Check className="size-3" strokeWidth={2} /> Copied
                </>
              ) : (
                <>
                  <Copy className="size-3" strokeWidth={1.5} /> Copy
                </>
              )}
            </button>
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

      <AnimatePresence mode="wait">
        {pending && (
          <motion.div
            key={phaseIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-[11px] text-muted-foreground"
          >
            {PHASES[phaseIndex]} <span className="font-mono opacity-60">~10s</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
