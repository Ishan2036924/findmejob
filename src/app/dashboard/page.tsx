import { redirect } from 'next/navigation';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
import { signOut } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ROLE_FAMILIES, SENIORITY_OPTIONS } from '@/app/onboarding/options';
import { RunAssessmentButton } from './run-assessment-button';

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
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] [background:radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.10),transparent_70%)]"
      />

      <header className="flex h-16 items-center justify-between border-b border-white/5 px-6 sm:px-10">
        <span className="font-mono text-sm font-medium tracking-tight">findmejob</span>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" className="gap-2">
            <LogOut className="size-3.5" strokeWidth={1.5} />
            Sign out
          </Button>
        </form>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12 sm:px-10">
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
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Profile assessment
          </span>
          <h2 className="mt-3 text-balance text-xl font-semibold tracking-tight">
            {profile!.latest_assessment_id
              ? 'Your assessment is ready.'
              : 'Get a candid read on where you stand.'}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {profile!.latest_assessment_id
              ? 'Open it to see the rubric breakdown, gaps, strengths, and next steps.'
              : `We'll grade your resume against the ${roleLabel} rubric, surface specific gaps + strengths with evidence, and produce a prioritized action plan. ~30 seconds.`}
          </p>
          <div className="mt-5">
            <RunAssessmentButton existingAssessmentId={profile!.latest_assessment_id} />
          </div>
        </div>
      </main>
    </div>
  );
}
