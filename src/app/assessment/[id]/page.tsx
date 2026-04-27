import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ScoreRing } from '@/components/score-ring';
import { ROLE_FAMILIES, SENIORITY_OPTIONS } from '@/app/onboarding/options';
import type {
  DimensionAssessment,
  NextStep,
} from '@/lib/ai/schemas/assessment';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Your assessment · findmejob',
};

type AssessmentRow = {
  id: string;
  profile_id: string;
  rubric_version: string;
  model: string;
  overall_score: number;
  dimensions: Record<string, DimensionAssessment>;
  candid_summary: string;
  next_steps: NextStep[];
  created_at: string;
};

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', id)
    .single<AssessmentRow>();

  if (!assessment || assessment.profile_id !== user.id) notFound();

  const { data: profile } = await supabase
    .from('profiles')
    .select('target_role_family, target_seniority, target_location')
    .eq('id', user.id)
    .single();

  const roleLabel = ROLE_FAMILIES.find((r) => r.value === profile?.target_role_family)?.label;
  const seniorityLabel = SENIORITY_OPTIONS.find(
    (s) => s.value === profile?.target_seniority,
  )?.label;

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] [background:radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.10),transparent_70%)]"
      />

      <header className="flex h-16 items-center justify-between border-b border-white/5 px-6 sm:px-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" className="gap-2">
            <LogOut className="size-3.5" strokeWidth={1.5} />
            Sign out
          </Button>
        </form>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-16 px-6 py-12 sm:px-10">
        {/* Hero: score + summary */}
        <section className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
          <ScoreRing score={assessment.overall_score} size={160} />
          <div className="flex flex-1 flex-col gap-3">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Candid assessment · {roleLabel} · {seniorityLabel}
            </span>
            <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {assessment.candid_summary}
            </h1>
            <p className="font-mono text-[11px] text-muted-foreground/70">
              {assessment.rubric_version} · {assessment.model.split('/')[1]} ·{' '}
              {new Date(assessment.created_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </section>

        {/* Dimensions */}
        <section className="flex flex-col gap-6">
          <header className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Dimensions
            </span>
            <h2 className="text-xl font-semibold tracking-tight">How you score against the rubric</h2>
          </header>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Object.entries(assessment.dimensions).map(([name, dim]) => (
              <DimensionCard key={name} name={name} dim={dim} />
            ))}
          </div>
        </section>

        {/* Next steps */}
        <section className="flex flex-col gap-6">
          <header className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Next steps
            </span>
            <h2 className="text-xl font-semibold tracking-tight">Concrete moves to make</h2>
          </header>
          <ol className="flex flex-col gap-3">
            {assessment.next_steps.map((step, i) => (
              <NextStepRow key={i} index={i + 1} step={step} />
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}

function DimensionCard({ name, dim }: { name: string; dim: DimensionAssessment }) {
  const score = dim.score;
  return (
    <div className="rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur transition-colors duration-300 hover:border-white/20">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-medium tracking-tight capitalize">
          {name.replace(/_/g, ' ')}
        </h3>
        <span className="font-mono text-2xl tabular-nums tracking-tight">
          {score === null ? '—' : score}
        </span>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-foreground transition-[width] duration-700"
          style={{
            width: `${score ?? 0}%`,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
      {dim.evidence && (
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground italic">
          &ldquo;{dim.evidence}&rdquo;
        </p>
      )}
      {dim.strengths.length > 0 && (
        <div className="mt-4">
          <span className="text-[10px] uppercase tracking-wider text-emerald-400/80">
            Strengths
          </span>
          <ul className="mt-1.5 flex flex-col gap-1.5 text-xs text-foreground/90">
            {dim.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-400/80" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {dim.gaps.length > 0 && (
        <div className="mt-3">
          <span className="text-[10px] uppercase tracking-wider text-amber-400/80">
            Gaps
          </span>
          <ul className="mt-1.5 flex flex-col gap-1.5 text-xs text-foreground/90">
            {dim.gaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-amber-400/80" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function NextStepRow({ index, step }: { index: number; step: NextStep }) {
  const priorityClass =
    step.priority === 'high'
      ? 'border-rose-400/30 bg-rose-400/5 text-rose-400'
      : step.priority === 'medium'
        ? 'border-amber-400/30 bg-amber-400/5 text-amber-400'
        : 'border-zinc-400/30 bg-zinc-400/5 text-zinc-400';

  return (
    <li className="flex gap-4 rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur">
      <div className="font-mono text-xs text-muted-foreground/70 tabular-nums pt-0.5">
        {String(index).padStart(2, '0')}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider',
              priorityClass,
            )}
          >
            {step.priority}
          </span>
          <h3 className="text-sm font-medium tracking-tight">{step.action}</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{step.why}</p>
        <span className="self-start font-mono text-[11px] text-muted-foreground/70">
          ~ {step.time_estimate}
        </span>
      </div>
    </li>
  );
}
