import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROLE_FAMILIES, SENIORITY_OPTIONS } from '@/app/onboarding/options';
import { createClient } from '@/lib/supabase/server';
import { ProfileBanner, MetricStat } from '@/components/ui-kit';
import { RunAssessmentButton } from './run-assessment-button';
import { UpdateResumeDialog } from '@/components/profile/update-resume-dialog';

export const metadata = {
  title: 'Dashboard · findmejob',
};

type DashboardStats = {
  assessmentScore: number | null;
  rubricVersion: string | null;
  applicationsCount: number;
  matchAverage: number | null;
  highMatchesToday: number;
};

async function loadDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();

  // Latest assessment (score + rubric version for the banner badge)
  const { data: assessment } = await supabase
    .from('assessments')
    .select('overall_score, rubric_version')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Applications count + match scores join (for "match avg")
  const { data: apps } = await supabase
    .from('applications')
    .select('id, job_id')
    .eq('profile_id', userId);

  const applicationsCount = apps?.length ?? 0;

  let matchAverage: number | null = null;
  if (apps && apps.length > 0) {
    const jobIds = apps.map((a) => a.job_id as string);
    const { data: scores } = await supabase
      .from('match_scores')
      .select('score')
      .eq('profile_id', userId)
      .in('job_id', jobIds);
    if (scores && scores.length > 0) {
      const sum = scores.reduce((acc, s) => acc + (s.score as number), 0);
      matchAverage = Math.round(sum / scores.length);
    }
  }

  // Today's high matches (>= 70, scored today)
  const sinceMidnight = new Date();
  sinceMidnight.setUTCHours(0, 0, 0, 0);
  const { count: highMatchesToday } = await supabase
    .from('match_scores')
    .select('job_id', { count: 'exact', head: true })
    .eq('profile_id', userId)
    .gte('score', 70)
    .gte('created_at', sinceMidnight.toISOString());

  return {
    assessmentScore: assessment?.overall_score ?? null,
    rubricVersion: assessment?.rubric_version ?? null,
    applicationsCount,
    matchAverage,
    highMatchesToday: highMatchesToday ?? 0,
  };
}

export default async function DashboardPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');
  if (!isOnboardingComplete(profile)) redirect('/onboarding');

  const roleLabel = ROLE_FAMILIES.find((r) => r.value === profile!.target_role_family)?.label;
  const seniorityLabel = SENIORITY_OPTIONS.find((s) => s.value === profile!.target_seniority)?.label;

  const stats = await loadDashboardStats(user.id);

  const hasAssessment = !!profile!.latest_assessment_id;
  const hasMatchAvg = stats.matchAverage !== null;

  return (
    <div className="flex flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-6 sm:gap-10 sm:px-10 sm:py-12">
        {/* Profile banner — LinkedIn-style header */}
        <ProfileBanner
          email={user.email ?? ''}
          displayName={profile!.display_name}
          roleLabel={roleLabel ?? null}
          seniorityLabel={seniorityLabel ?? null}
          location={profile!.target_location}
          assessmentScore={stats.assessmentScore}
          rubricVersion={stats.rubricVersion}
        />

        {/* Quick action: update resume */}
        <div className="-mt-2 flex flex-wrap items-center gap-2">
          <UpdateResumeDialog />
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <MetricStat
            label="Assessment"
            value={stats.assessmentScore ?? '—'}
            hint={hasAssessment ? 'Latest score · open to review' : 'Run your first assessment'}
            href={
              profile!.latest_assessment_id
                ? `/assessment/${profile!.latest_assessment_id}`
                : '/dashboard'
            }
            accent={
              stats.assessmentScore === null
                ? 'default'
                : stats.assessmentScore >= 70
                  ? 'emerald'
                  : stats.assessmentScore >= 50
                    ? 'amber'
                    : 'rose'
            }
            icon={Target}
          />
          <MetricStat
            label="Applications"
            value={stats.applicationsCount}
            hint={
              stats.applicationsCount === 0
                ? 'Save jobs to start tracking'
                : `${stats.applicationsCount === 1 ? 'role' : 'roles'} in your pipeline`
            }
            href="/applications"
            icon={ClipboardList}
          />
          <MetricStat
            label="Match avg"
            value={hasMatchAvg ? stats.matchAverage! : '—'}
            hint={hasMatchAvg ? 'Across saved roles' : 'Save jobs first'}
            href="/applications"
            accent={
              !hasMatchAvg
                ? 'default'
                : stats.matchAverage! >= 70
                  ? 'indigo'
                  : 'amber'
            }
            icon={TrendingUp}
          />
          <MetricStat
            label="Today"
            value={stats.highMatchesToday}
            hint={
              stats.highMatchesToday === 0
                ? 'No 70+ matches yet today'
                : `${stats.highMatchesToday === 1 ? 'role' : 'roles'} ≥ 70 scored today`
            }
            href="/jobs"
            accent={stats.highMatchesToday > 0 ? 'emerald' : 'default'}
            icon={Sparkles}
          />
        </div>

        {/* Two large cards: assessment + feed */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="group/card relative overflow-hidden rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur transition-all duration-200 hover:border-white/20 hover:bg-card/60">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-gradient-to-br from-indigo-500/15 to-transparent blur-3xl"
            />
            <span className="relative text-xs uppercase tracking-wider text-muted-foreground">
              Profile assessment
            </span>
            <h2 className="relative mt-3 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
              {hasAssessment
                ? 'Your assessment is ready.'
                : 'Get a candid read on where you stand.'}
            </h2>
            <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
              {hasAssessment
                ? 'Open it to see the rubric breakdown, gaps, strengths, and next steps.'
                : `We'll grade your resume against the ${roleLabel} rubric, surface gaps + strengths with evidence. ~30 seconds.`}
            </p>
            <div className="relative mt-5">
              <RunAssessmentButton existingAssessmentId={profile!.latest_assessment_id} />
            </div>
          </div>

          <div className="group/card relative overflow-hidden rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur transition-all duration-200 hover:border-white/20 hover:bg-card/60">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br from-purple-500/15 to-transparent blur-3xl"
            />
            <span className="relative text-xs uppercase tracking-wider text-muted-foreground">
              Verified feed
            </span>
            <h2 className="relative mt-3 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
              See roles matched to your profile.
            </h2>
            <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
              We pull live {roleLabel} postings, score every one against your rubric, and sort by best fit. Click through to apply.
            </p>
            <div className="relative mt-5 flex flex-wrap gap-2">
              <Link
                href="/jobs"
                className={cn(buttonVariants({ size: 'lg' }), 'w-full gap-2 sm:w-auto')}
              >
                <Briefcase className="size-4" strokeWidth={1.5} />
                Browse jobs
              </Link>
              <Link
                href="/applications"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'w-full gap-2 sm:w-auto',
                )}
              >
                Applications
                <ArrowRight className="size-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
