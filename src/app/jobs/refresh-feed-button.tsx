'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { refreshFeed } from '@/lib/jobs/actions';

const PHASES = [
  'Fetching the latest postings…',
  'Reading your profile…',
  'Scoring jobs against your rubric…',
  'Sorting by best fit…',
];

export function RefreshFeedButton({
  hasJobs,
  unscored,
}: {
  hasJobs: boolean;
  unscored: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!pending) return;
    const id = setInterval(() => {
      setPhaseIndex((i) => Math.min(i + 1, PHASES.length - 1));
    }, 4500);
    return () => clearInterval(id);
  }, [pending]);

  const label = !hasJobs
    ? 'Fetch the feed'
    : unscored > 0
      ? `Score ${unscored} new ${unscored === 1 ? 'job' : 'jobs'}`
      : 'Refresh feed';

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        size="lg"
        disabled={pending}
        onClick={() => {
          setPhaseIndex(0);
          startTransition(async () => {
            const result = await refreshFeed();
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            const parts: string[] = [];
            if (result.ingested > 0) parts.push(`${result.ingested} jobs fetched`);
            if (result.scored > 0) parts.push(`${result.scored} scored`);
            toast.success(parts.length ? parts.join(' · ') : 'Feed up to date');
            router.refresh();
          });
        }}
        className="gap-2"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Working
          </>
        ) : !hasJobs ? (
          <>
            <Sparkles className="size-4" strokeWidth={1.5} />
            {label}
          </>
        ) : (
          <>
            <RefreshCw className="size-4" strokeWidth={1.5} />
            {label}
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
            className="text-right text-xs text-muted-foreground"
          >
            {PHASES[phaseIndex]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
