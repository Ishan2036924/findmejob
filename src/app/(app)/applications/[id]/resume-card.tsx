'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, FileText, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { generateTailoredResume } from '@/lib/resume/actions';
import { MatchBadge } from '@/components/ui-kit';
import { cn } from '@/lib/utils';

const PHASES = [
  'Reading your resume + the JD…',
  'Drafting edits to align with the role…',
  'Applying changes deterministically…',
  'Saving your tailored copy…',
];

type VerifierMeta = {
  score: number;
  mustHavesAddressed: number;
  mustHavesTotal: number;
} | null;

type Props = {
  applicationId: string;
  initialResumeId: string | null;
  initialVerifier?: VerifierMeta;
};

export function ResumeCard({ applicationId, initialResumeId, initialVerifier }: Props) {
  const router = useRouter();
  const [resumeId, setResumeId] = useState(initialResumeId);
  const [pending, startTransition] = useTransition();
  const [phaseIndex, setPhaseIndex] = useState(0);

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
      const result = await generateTailoredResume(applicationId);
      if (!result.ok) {
        toast.error(result.message ?? result.error);
        return;
      }
      setResumeId(result.resumeId);
      const skip = result.skippedOps > 0 ? ` · ${result.skippedOps} skipped` : '';
      toast.success(`Tailored resume ready · ${result.appliedOps} edits applied${skip}`);
      router.push(`/applications/${applicationId}/resume/${result.resumeId}`);
    });
  }

  const ready = !!resumeId;

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
          <FileText className="size-3.5 text-foreground/80" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium tracking-tight">Tailored resume</h3>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            ATS-aligned edits — print-optimized HTML.
          </p>
        </div>
      </div>

      {/* Verifier badge row when we have one */}
      {ready && initialVerifier && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-background/40 px-2.5 py-1.5">
          <MatchBadge score={initialVerifier.score} size="sm" />
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
            {initialVerifier.mustHavesAddressed}/{initialVerifier.mustHavesTotal} must-haves
          </span>
        </div>
      )}

      {ready && !pending ? (
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              router.push(`/applications/${applicationId}/resume/${resumeId}`)
            }
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-foreground/30 bg-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/20"
          >
            View resume
            <ArrowRight className="size-3.5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={fire}
            aria-label="Regenerate"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <RefreshCw className="size-3.5" strokeWidth={1.5} />
          </button>
        </div>
      ) : (
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
              <Loader2 className="size-3.5 animate-spin" />
              Generating
            </>
          ) : (
            <>
              <Sparkles className="size-3.5" strokeWidth={1.5} />
              Generate
            </>
          )}
        </button>
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
            {PHASES[phaseIndex]} <span className="font-mono opacity-60">~25s</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
