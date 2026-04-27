'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Loader2, Lock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ROLE_FAMILIES, SENIORITY_OPTIONS } from './options';
import { saveOnboarding } from '@/lib/profile/actions';
import type { RoleFamily, Seniority } from '@/lib/ai/schemas/profile';

type Step = 'goal' | 'resume' | 'context';

const STEPS: Step[] = ['goal', 'resume', 'context'];

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

  const stepIndex = STEPS.indexOf(step);

  const canAdvance =
    step === 'goal'
      ? !!form.target_role_family && !!form.target_seniority && form.target_location.trim().length > 0
      : step === 'resume'
        ? form.raw_resume_text.trim().length >= 100
        : true;

  function next() {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  }

  function back() {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
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
      router.push('/dashboard');
    });
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i <= stepIndex ? 'bg-foreground' : 'bg-white/10',
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 'goal' && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
            className="flex flex-col gap-8"
          >
            <Header
              eyebrow="Your goal"
              title="What are you targeting?"
              subtitle="We tune the assessment rubric to your role family and seniority."
            />

            <div className="flex flex-col gap-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Role family
              </Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
                        'group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200',
                        opt.available
                          ? selected
                            ? 'border-white/30 bg-white/[0.06]'
                            : 'border-white/10 bg-card/40 hover:border-white/20 hover:bg-card/70'
                          : 'cursor-not-allowed border-white/5 bg-card/20 opacity-50',
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex size-7 items-center justify-center rounded-md border border-white/10 bg-white/5">
                          <Icon className="size-3.5" strokeWidth={1.5} />
                        </div>
                        {!opt.available && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                            <Lock className="size-2.5" /> Soon
                          </span>
                        )}
                        {selected && (
                          <Check className="size-4 text-foreground" strokeWidth={2} />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium tracking-tight">
                          {opt.label}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {opt.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
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
                        'rounded-full border px-4 py-2 text-sm transition-all duration-200',
                        selected
                          ? 'border-white/30 bg-white/[0.08] text-foreground'
                          : 'border-white/10 bg-card/40 text-muted-foreground hover:border-white/20 hover:bg-card/70 hover:text-foreground',
                      )}
                      title={opt.hint}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="location" className="text-xs uppercase tracking-wider text-muted-foreground">
                Target location
              </Label>
              <Input
                id="location"
                value={form.target_location}
                onChange={(e) => setForm((f) => ({ ...f, target_location: e.target.value }))}
                placeholder="e.g., Delhi NCR, Bengaluru, remote"
              />
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
              eyebrow="Your resume"
              title="Paste your resume."
              subtitle="Plain text works best. PDF upload lands in the next release — for now, copy-paste keeps the parser unambiguous."
            />

            <div className="flex flex-col gap-2">
              <Textarea
                value={form.raw_resume_text}
                onChange={(e) => setForm((f) => ({ ...f, raw_resume_text: e.target.value }))}
                placeholder="Paste your full resume text here — name, email, experience, education, skills, projects."
                className="min-h-[360px] resize-y font-mono text-xs leading-relaxed"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {form.raw_resume_text.length} chars
                  {form.raw_resume_text.length > 0 && form.raw_resume_text.length < 100 && (
                    <span className="ml-2 text-amber-400/80">need at least 100</span>
                  )}
                </span>
                <span className="font-mono opacity-60">private to your account</span>
              </div>
            </div>
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
              eyebrow="Optional context"
              title="Anything else?"
              subtitle="Skip if you want — these only sharpen the assessment."
            />

            <div className="flex flex-col gap-3">
              <Label htmlFor="linkedin" className="text-xs uppercase tracking-wider text-muted-foreground">
                LinkedIn paste
              </Label>
              <Textarea
                id="linkedin"
                value={form.linkedin_paste}
                onChange={(e) => setForm((f) => ({ ...f, linkedin_paste: e.target.value }))}
                placeholder="Paste 'About', 'Experience', and 'Skills' sections from your LinkedIn profile."
                className="min-h-32 font-mono text-xs leading-relaxed"
              />
              <p className="text-xs text-muted-foreground">
                We don&apos;t fetch from LinkedIn — paste-in only.
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

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-white/5 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          disabled={stepIndex === 0 || pending}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {step !== 'context' ? (
          <Button
            type="button"
            onClick={next}
            disabled={!canAdvance || pending}
            size="lg"
            className="gap-2"
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={submit}
            disabled={pending}
            size="lg"
            className="gap-2"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Sparkles className="size-4" strokeWidth={1.5} />
                Save and continue
              </>
            )}
          </Button>
        )}
      </div>
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
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{eyebrow}</span>
      <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
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
              ×
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
          + Add another
        </Button>
      )}
    </div>
  );
}
