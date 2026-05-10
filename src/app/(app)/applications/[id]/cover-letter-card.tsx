'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ChevronDown,
  Copy,
  Loader2,
  PenLine,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
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
        toast.error(result.message ?? result.error);
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

  const ready = !!output;

  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-xl border bg-card/40 p-4 backdrop-blur transition-all',
        ready
          ? 'border-emerald-400/20 bg-emerald-400/[0.03]'
          : 'border-white/10 hover:border-white/20',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <PenLine className="size-3.5 text-foreground/80" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium tracking-tight">Cover letter</h3>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            200–400 words tied to this role.
          </p>
        </div>
      </div>

      {!ready && (
        <button
          type="button"
          disabled={pending}
          onClick={fire}
          className={cn(
            'mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            pending
              ? 'border-white/10 bg-white/5 text-muted-foreground'
              : 'border-foreground/30 bg-foreground/10 text-foreground hover:bg-foreground/20',
          )}
        >
          {pending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> Generating
            </>
          ) : (
            <>
              <Sparkles className="size-3.5" strokeWidth={1.5} /> Generate
            </>
          )}
        </button>
      )}

      {ready && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-background/40 px-2.5 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            aria-expanded={expanded}
          >
            <span className="line-clamp-1 italic">{output.meta_summary}</span>
            <ChevronDown
              className={cn('size-3.5 shrink-0 transition-transform', expanded && 'rotate-180')}
              strokeWidth={1.5}
            />
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
                <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-background/40 p-3 font-sans text-xs leading-relaxed text-foreground/90">
                  {output.letter}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-foreground transition-colors hover:bg-white/10"
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
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
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
        </>
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
