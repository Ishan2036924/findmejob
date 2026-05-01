'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { submitPracticeAnswer } from '@/lib/practice/actions';
import type { PracticeFeedback, PracticeQuestionType } from '@/lib/ai/schemas/practice';
import type { PracticeSessionRow } from '@/lib/practice/queries';
import { cn } from '@/lib/utils';

type Question = {
  id: string;
  question: string;
  type: PracticeQuestionType;
};

type Props = {
  applicationId: string;
  questions: Question[];
  pastSessions: PracticeSessionRow[];
};

const TYPE_TONE: Record<PracticeQuestionType, string> = {
  technical: 'border-sky-400/30 bg-sky-400/5 text-sky-300',
  behavioral: 'border-violet-400/30 bg-violet-400/5 text-violet-300',
  situational: 'border-amber-400/30 bg-amber-400/5 text-amber-300',
};

function scoreColor(score: number): string {
  if (score >= 8) return 'text-emerald-400';
  if (score >= 5) return 'text-amber-300';
  return 'text-rose-400';
}

export function PracticeSession({ applicationId, questions, pastSessions }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);

  const selectedQ = questions.find((q) => q.id === selectedId) ?? null;

  function reset() {
    setSelectedId(null);
    setAnswer('');
    setFeedback(null);
  }

  function submit() {
    if (!selectedQ) return;
    if (answer.trim().length < 30) {
      toast.error('Answer is too short. At least 30 characters.');
      return;
    }
    startTransition(async () => {
      const result = await submitPracticeAnswer({
        applicationId,
        question: selectedQ.question,
        questionType: selectedQ.type,
        userAnswer: answer,
      });
      if (!result.ok) {
        toast.error(result.message ?? result.error);
        return;
      }
      setFeedback(result.feedback);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Question picker */}
      {!selectedQ && (
        <div className="flex flex-col gap-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Pick a question
          </Label>
          <div className="flex flex-col gap-2">
            {questions.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedId(q.id)}
                className="group flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-card/40 p-4 text-left text-sm transition-all hover:border-white/20 hover:bg-card/70"
              >
                <p className="leading-relaxed text-foreground/90">{q.question}</p>
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider',
                    TYPE_TONE[q.type],
                  )}
                >
                  {q.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active session */}
      {selectedQ && (
        <div className="flex flex-col gap-5">
          <button
            type="button"
            onClick={reset}
            className="self-start text-xs text-muted-foreground hover:text-foreground"
          >
            ← pick a different question
          </button>

          <div className="rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium leading-relaxed text-foreground">
                {selectedQ.question}
              </p>
              <span
                className={cn(
                  'shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider',
                  TYPE_TONE[selectedQ.type],
                )}
              >
                {selectedQ.type}
              </span>
            </div>
          </div>

          {!feedback && (
            <div className="flex flex-col gap-3">
              <Label htmlFor="answer" className="text-xs uppercase tracking-wider text-muted-foreground">
                Your answer
              </Label>
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type as if you're saying it out loud in the interview…"
                disabled={pending}
                className="min-h-48 resize-y text-sm leading-relaxed"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {answer.length} chars
                  {answer.length > 0 && answer.length < 30 && (
                    <span className="ml-2 text-amber-400/80">need at least 30</span>
                  )}
                </span>
                <Button
                  type="button"
                  size="sm"
                  disabled={pending || answer.trim().length < 30}
                  onClick={submit}
                  className="gap-2"
                >
                  {pending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Scoring…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" strokeWidth={1.5} />
                      Score my answer
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      Feedback
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feedback.meta_summary}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span
                      className={cn(
                        'font-mono text-4xl tabular-nums leading-none tracking-tight',
                        scoreColor(feedback.score),
                      )}
                    >
                      {feedback.score}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      out of 10
                    </span>
                  </div>
                </div>

                {feedback.strengths.length > 0 && (
                  <FeedbackBlock title="Strengths" tone="emerald">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-400/80" strokeWidth={1.5} />
                        <span>{s}</span>
                      </li>
                    ))}
                  </FeedbackBlock>
                )}

                {feedback.improvements.length > 0 && (
                  <FeedbackBlock title="Improvements" tone="amber">
                    {feedback.improvements.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <XCircle className="mt-0.5 size-3.5 shrink-0 text-amber-400/80" strokeWidth={1.5} />
                        <span>{s}</span>
                      </li>
                    ))}
                  </FeedbackBlock>
                )}

                <div className="flex flex-col gap-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Ideal answer outline
                  </p>
                  <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-background/40 p-3 font-sans text-xs leading-relaxed text-foreground/90">
                    {feedback.ideal_answer_outline}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={reset} className="gap-2">
                    <RotateCcw className="size-3.5" strokeWidth={1.5} />
                    Try another question
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Past sessions */}
      {!selectedQ && pastSessions.length > 0 && (
        <div className="flex flex-col gap-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Past sessions
          </Label>
          <div className="flex flex-col gap-2">
            {pastSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-card/30 p-4"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="truncate text-sm text-foreground/90">{s.question}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {s.feedback?.meta_summary ?? '(no feedback recorded)'}
                  </p>
                </div>
                {s.feedback && (
                  <span
                    className={cn(
                      'font-mono text-lg tabular-nums leading-none',
                      scoreColor(s.feedback.score),
                    )}
                  >
                    {s.feedback.score}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackBlock({
  title,
  tone,
  children,
}: {
  title: string;
  tone: 'emerald' | 'amber';
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p
        className={cn(
          'text-[10px] uppercase tracking-wider',
          tone === 'emerald' ? 'text-emerald-300/80' : 'text-amber-300/80',
        )}
      >
        {title}
      </p>
      <ul className="flex flex-col gap-1.5 text-xs leading-relaxed text-foreground/90">
        {children}
      </ul>
    </div>
  );
}
