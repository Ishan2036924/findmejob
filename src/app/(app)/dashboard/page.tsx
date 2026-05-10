import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRight, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLE_FAMILIES, SENIORITY_OPTIONS } from '@/app/onboarding/options';
import { RunAssessmentButton } from './run-assessment-button';
import { UpdateResumeDialog } from '@/components/profile/update-resume-dialog';

export const metadata = {
  title: 'Dashboard · findmejob',
};

export default async function DashboardPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');
  if (!isOnboardingComplete(profile)) redirect('/onboarding');

  const roleLabel = ROLE_FAMILIES.find((r) => r.value === profile!.target_role_family)?.label;
  const seniorityLabel = SENIORITY_OPTIONS.find((s) => s.value === profile!.target_seniority)?.label;

  return (
    <div className="flex flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-10 sm:py-12">
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Welcome back
          </span>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {user.email}
          </h1>
          <p className="text-sm text-muted-foreground">
            Targeting <span className="text-foreground">{roleLabel}</span> · {seniorityLabel} ·{' '}
            {profile!.target_location}
          </p>
          <div className="mt-2">
            <UpdateResumeDialog />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Profile assessment
            </span>
            <h2 className="mt-3 text-balance text-lg font-semibold tracking-tight">
              {profile!.latest_assessment_id
                ? 'Your assessment is ready.'
                : 'Get a candid read on where you stand.'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {profile!.latest_assessment_id
                ? 'Open it to see the rubric breakdown, gaps, strengths, and next steps.'
                : `We'll grade your resume against the ${roleLabel} rubric, surface gaps + strengths with evidence. ~30 seconds.`}
            </p>
            <div className="mt-5">
              <RunAssessmentButton existingAssessmentId={profile!.latest_assessment_id} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Verified feed
            </span>
            <h2 className="mt-3 text-balance text-lg font-semibold tracking-tight">
              See roles matched to your profile.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We pull live {roleLabel} postings, score every one against your rubric, and sort by best fit. Click through to apply.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/jobs"
                className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}
              >
                <Briefcase className="size-4" strokeWidth={1.5} />
                Browse jobs
              </Link>
              <Link
                href="/applications"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'gap-2',
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
