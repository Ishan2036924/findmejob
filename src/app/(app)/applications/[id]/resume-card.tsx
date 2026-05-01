'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, FileText, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { generateTailoredResume } from '@/lib/resume/actions';
import { cn } from '@/lib/utils';

const PHASES = [
  'Reading your resume + the JD…',
  'Drafting edits to align with the role…',
  'Applying changes deterministically…',
  'Saving your tailored copy…',
];

type Props = {
  applicationId: string;
  initialResumeId: string | null;
};

export function ResumeCard({ applicationId, initialResumeId }: Props) {
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

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-card/40 p-5 backdrop-blur transition-all',
        resumeId
          ? 'border-emerald-400/20 bg-emerald-400/[0.03] hover:border-emerald-400/30'
          : 'border-white/10 hover:border-white/20',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <FileText className="size-4 text-foreground/80" strokeWidth={1.5} />
        </div>
        {resumeId ? (
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-300/90">
            Ready
          </span>
        ) : (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Step 6a
          </span>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium tracking-tight">Tailored resume</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Edit your resume to match this JD. Print-optimized HTML — Save as PDF in one click.
        </p>
      </div>

      {resumeId && !pending ? (
        <div className="mt-auto flex flex-col gap-2">
          <button
            type="button"
            onClick={() =>
              router.push(`/applications/${applicationId}/resume/${resumeId}`)
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-white/10"
          >
            <ExternalLink className="size-3.5" strokeWidth={1.5} />
            Open
          </button>
          <button
            type="button"
            onClick={fire}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <RefreshCw className="size-3" strokeWidth={1.5} />
            Regenerate
          </button>
        </div>
      ) : (
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
              <Loader2 className="size-3.5 animate-spin" />
              Working
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
