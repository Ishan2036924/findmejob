'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StepProgress } from '@/components/ui-kit/step-progress';
import { cn } from '@/lib/utils';
import { ROLE_FAMILIES, SENIORITY_OPTIONS } from './options';
import { saveOnboarding } from '@/lib/profile/actions';
import type { RoleFamily, Seniority } from '@/lib/ai/schemas/profile';
import { ResumeUpload } from '@/components/profile/resume-upload';
import { LinkedinStep } from './linkedin-step';

type Step = 'goal' | 'resume' | 'linkedin' | 'context';

const STEPS: { key: Step; label: string }[] = [
  { key: 'goal', label: 'Targets' },
  { key: 'resume', label: 'Resume' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'context', label: 'Context' },
];

const LOCATION_SUGGESTIONS = [
  'Delhi NCR',
  'Bengaluru',
  'Mumbai',
  'San Francisco',
  'New York',
  'Remote',
];

type FormState = {
  target_role_family: RoleFamily | null;
  target_seniority: Seniority | null;
  target_location: string;
  raw_resume_text: string;
  linkedin_paste: string;
  portfolio_urls: string[];
};

const transition = { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const };

export function OnboardingFlow({
  initialProfile,
}: {
  initialProfile: FormState;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('goal');
  const [form, setForm] = useState<FormState>(initialProfile);
  const [pending, startTransition] = useTransition();
  const [isCompleting, setIsCompleting] = useState(false);
  const [triedAdvance, setTriedAdvance] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const canAdvance =
    step === 'goal'
      ? !!form.target_role_family && !!form.target_seniority && form.target_location.trim().length > 0
      : step === 'resume'
        ? form.raw_resume_text.trim().length >= 100
        : true;

  function next() {
    if (!canAdvance) {
      setTriedAdvance(true);
      return;
    }
    setTriedAdvance(false);
    const i = STEPS.findIndex((s) => s.key === step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1].key);
  }

  function back() {
    const i = STEPS.findIndex((s) => s.key === step);
    if (i > 0) setStep(STEPS[i - 1].key);
  }

  function submit() {
    if (!form.target_role_family || !form.target_seniority) return;
    startTransition(async () => {
      const result = await saveOnboarding({
        target_role_family: form.target_role_family!,
        target_seniority: form.target_seniority!,
        target_location: form.target_location.trim(),
        raw_resume_text: form.raw_resume_text.trim(),
        linkedin_paste: form.linkedin_paste.trim() || null,
        portfolio_urls: form.portfolio_urls.filter((u) => u.trim().length > 0),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      // Show completion overlay briefly before redirect — gives the moment a
      // sense of weight ("we're building your assessment now") instead of
      // popping straight to dashboard.
      setIsCompleting(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    });
  }

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <StepProgress
        steps={STEPS.map((s) => ({ key: s.key, label: s.label }))}
        currentKey={step}
      />

      <AnimatePresence mode="wait" initial={false}>
        {step === 'goal' && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
            className="flex flex-col gap-7"
          >
            <Header
              eyebrow="Step 1 · Targets"
              title="What are you targeting?"
              subtitle="We tune assessments, match scoring, and tailored resumes around this."
            />

            <div className="flex flex-col gap-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Role family
              </Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {ROLE_FAMILIES.map((opt) => {
                  const selected = form.target_role_family === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={!opt.available}
                      onClick={() =>
                        setForm((f) => ({ ...f, target_role_family: opt.value }))
                      }
                      className={cn(
                        'group relative flex min-h-[92px] flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-200',
                        opt.available
                          ? selected
                            ? 'border-indigo-400/60 bg-indigo-500/[0.08] shadow-[0_0_0_1px_rgba(99,102,241,0.20),0_8px_24px_-12px_rgba(99,102,241,0.45)]'
                            : 'border-white/10 bg-card/40 hover:border-white/25 hover:bg-card/70'
                          : 'cursor-not-allowed border-white/5 bg-card/20 opacity-50',
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div
                          className={cn(
                            'flex size-7 items-center justify-center rounded-md border transition-colors',
                            selected
                              ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-200'
                              : 'border-white/10 bg-white/5',
                          )}
                        >
                          <Icon className="size-3.5" strokeWidth={1.5} />
                        </div>
                        {!opt.available && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                            <Lock className="size-2.5" /> Soon
                          </span>
                        )}
                        {selected && opt.available && (
                          <Check
                            className="size-3.5 text-indigo-300"
                            strokeWidth={2.25}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium tracking-tight">
                          {opt.label}
                        </div>
                        <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                          {opt.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {triedAdvance && !form.target_role_family && (
                <p
                  role="alert"
                  className="text-[11px] text-rose-300/90"
                >
                  Pick a role family to continue.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Seniority
              </Label>
              <div className="flex flex-wrap gap-2">
                {SENIORITY_OPTIONS.map((opt) => {
                  const selected = form.target_seniority === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, target_seniority: opt.value }))
                      }
                      className={cn(
                        'flex flex-col items-start gap-0.5 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200 sm:px-4',
                        selected
                          ? 'border-indigo-400/60 bg-indigo-500/[0.10] text-foreground shadow-[0_0_0_1px_rgba(99,102,241,0.20)]'
                          : 'border-white/10 bg-card/40 text-muted-foreground hover:border-white/25 hover:bg-card/70 hover:text-foreground',
                      )}
                    >
                      <span
                        className={cn(
                          'text-sm font-medium leading-tight',
                          selected ? 'text-foreground' : '',
                        )}
                      >
                        {opt.label}
                      </span>
                      <span className="text-[10px] leading-tight text-muted-foreground">
                        {opt.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
              {triedAdvance && !form.target_seniority && (
                <p role="alert" className="text-[11px] text-rose-300/90">
                  Pick a seniority level.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <Label
                htmlFor="location"
                className="text-xs uppercase tracking-wider text-muted-foreground"
              >
                Target location
              </Label>
              <Input
                id="location"
                value={form.target_location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, target_location: e.target.value }))
                }
                placeholder="Delhi NCR / Bengaluru / San Francisco / Remote"
              />
              <div className="flex flex-wrap gap-1.5">
                {LOCATION_SUGGESTIONS.map((loc) => {
                  const active =
                    form.target_location.trim().toLowerCase() === loc.toLowerCase();
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, target_location: loc }))
                      }
                      className={cn(
                        'inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] transition-colors',
                        active
                          ? 'border-indigo-400/60 bg-indigo-500/[0.12] text-indigo-100'
                          : 'border-white/10 bg-card/30 text-muted-foreground hover:border-white/25 hover:text-foreground',
                      )}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
              {triedAdvance && form.target_location.trim().length === 0 && (
                <p role="alert" className="text-[11px] text-rose-300/90">
                  Tell us where you want to work.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {step === 'resume' && (
          <motion.div
            key="resume"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
            className="flex flex-col gap-6"
          >
            <Header
              eyebrow="Step 2 · Resume"
              title="Add your resume"
              subtitle="PDF (text-based, not a scan) or paste raw text. Takes about 30 seconds."
            />

            <ResumeUpload
              initialText={form.raw_resume_text}
              onTextChange={(text) =>
                setForm((f) => ({ ...f, raw_resume_text: text }))
              }
            />

            <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-card/30 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
              <ShieldCheck
                className="mt-0.5 size-3.5 shrink-0 text-emerald-400/80"
                strokeWidth={1.5}
              />
              <span>
                We don&apos;t share this. Storage is row-level-security scoped
                to your account only.
              </span>
            </div>

            {form.raw_resume_text.trim().length > 0 &&
              form.raw_resume_text.trim().length < 100 && (
                <p className="text-[11px] text-amber-300/80">
                  Need 100+ characters of resume text to continue.
                </p>
              )}
          </motion.div>
        )}

        {step === 'linkedin' && (
          <motion.div
            key="linkedin"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
          >
            <LinkedinStep
              onAdvance={next}
              onMerged={(rawText) =>
                setForm((f) => ({
                  ...f,
                  linkedin_paste: f.linkedin_paste
                    ? `${f.linkedin_paste}\n\n---\n\n${rawText}`
                    : rawText,
                }))
              }
            />
          </motion.div>
        )}

        {step === 'context' && (
          <motion.div
            key="context"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
            className="flex flex-col gap-6"
          >
            <Header
              eyebrow="Step 4 · Context"
              title="Almost done"
              subtitle="Anything else we should know about your career or what you're looking for? Optional — skip if not."
            />

            <div className="flex flex-col gap-3">
              <Label
                htmlFor="linkedin"
                className="text-xs uppercase tracking-wider text-muted-foreground"
              >
                Extra notes
              </Label>
              <Textarea
                id="linkedin"
                value={form.linkedin_paste}
                onChange={(e) =>
                  setForm((f) => ({ ...f, linkedin_paste: e.target.value }))
                }
                placeholder="e.g., looking for hybrid Bangalore roles, open to AI/ML research scientist tracks, prefer mid-stage startups."
                className="min-h-32 text-sm leading-relaxed"
              />
              <p className="text-xs text-muted-foreground">
                Free-form. Anything from compensation expectations to company
                preferences feeds the agent.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Portfolio links
              </Label>
              <PortfolioUrls
                urls={form.portfolio_urls}
                onChange={(urls) => setForm((f) => ({ ...f, portfolio_urls: urls }))}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          disabled={stepIndex === 0 || pending || isCompleting}
        >
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back
        </Button>

        {step !== 'context' ? (
          <Button
            type="button"
            onClick={next}
            disabled={pending || isCompleting}
            aria-disabled={!canAdvance}
            size="lg"
            className={cn(
              'min-w-[140px] flex-1 sm:flex-none',
              !canAdvance && 'opacity-60',
            )}
          >
            Continue
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={submit}
            disabled={pending || isCompleting}
            size="lg"
            className="min-w-[180px] flex-1 sm:flex-none"
          >
            {pending || isCompleting ? (
              <>
                <Loader2
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
                Saving…
              </>
            ) : (
              <>
                <Sparkles
                  className="size-4"
                  strokeWidth={1.5}
                  data-icon="inline-start"
                />
                Save and continue
              </>
            )}
          </Button>
        )}
      </div>

      {isCompleting ? <CompletionOverlay /> : null}
    </div>
  );
}

function Header({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wider text-indigo-300/80">
        {eyebrow}
      </span>
      <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}

function PortfolioUrls({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const list = urls.length === 0 ? [''] : urls;

  return (
    <div className="flex flex-col gap-2">
      {list.map((url, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={url}
            onChange={(e) => {
              const next = [...list];
              next[i] = e.target.value;
              onChange(next.filter((_, idx) => idx <= i || next[idx]?.length > 0));
            }}
            placeholder="https://github.com/yourhandle"
            type="url"
          />
          {list.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onChange(list.filter((_, idx) => idx !== i))}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Remove URL"
            >
              <X className="size-3.5" strokeWidth={1.5} />
            </Button>
          )}
        </div>
      ))}
      {list[list.length - 1]?.length > 0 && list.length < 5 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([...list, ''])}
          className="self-start text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3" data-icon="inline-start" />
          Add another
        </Button>
      )}
    </div>
  );
}

function CompletionOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md"
    >
      <div className="flex flex-col items-center gap-5 px-6 text-center">
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -m-4 rounded-full bg-indigo-500/20 blur-2xl"
          />
          <div className="relative flex size-14 items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-500/15">
            <Sparkles
              className="size-6 animate-pulse text-indigo-200"
              strokeWidth={1.5}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold tracking-tight">
            Setting up your assessment…
          </h2>
          <p className="max-w-xs text-pretty text-xs leading-relaxed text-muted-foreground">
            Building your candid, rubric-grounded assessment. This takes a
            moment.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Dot delay={0} />
          <Dot delay={0.15} />
          <Dot delay={0.3} />
        </div>
      </div>
    </motion.div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.2, repeat: Infinity, delay, ease: 'easeInOut' }}
      className="size-1.5 rounded-full bg-indigo-300"
    />
  );
}
