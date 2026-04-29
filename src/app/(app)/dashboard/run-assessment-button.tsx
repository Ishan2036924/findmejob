'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { triggerAssessment } from '@/lib/assessment/actions';

const PHASES = [
  'Parsing your resume…',
  'Loading the role-family rubric…',
  'Reading your evidence…',
  'Drafting candid feedback…',
  'Compiling next steps…',
];

export function RunAssessmentButton({ existingAssessmentId }: { existingAssessmentId: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!pending) return;
    const id = setInterval(() => {
      setPhaseIndex((i) => Math.min(i + 1, PHASES.length - 1));
    }, 6000);
    return () => clearInterval(id);
  }, [pending]);

  if (existingAssessmentId && !pending) {
    return (
      <Button
        size="lg"
        onClick={() => router.push(`/assessment/${existingAssessmentId}`)}
        className="gap-2"
      >
        <Sparkles className="size-4" strokeWidth={1.5} />
        View your assessment
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        size="lg"
        disabled={pending}
        onClick={() => {
          setPhaseIndex(0);
          startTransition(async () => {
            const result = await triggerAssessment();
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            router.push(`/assessment/${result.assessmentId}`);
          });
        }}
        className="gap-2"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Running assessment
          </>
        ) : (
          <>
            <Sparkles className="size-4" strokeWidth={1.5} />
            Run my assessment
          </>
        )}
      </Button>

      <AnimatePresence mode="wait">
        {pending && (
          <motion.div
            key={phaseIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-xs text-muted-foreground"
          >
            {PHASES[phaseIndex]}{' '}
            <span className="font-mono opacity-60">~30s total</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
