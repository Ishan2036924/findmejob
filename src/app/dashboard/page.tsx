import { redirect } from 'next/navigation';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
import { signOut } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ROLE_FAMILIES, SENIORITY_OPTIONS } from '@/app/onboarding/options';

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
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Next: run your assessment
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your profile is set up. The assessment engine is wired but the trigger UI lands in the next step. We&apos;ll grade your resume against the {roleLabel} rubric and surface specific gaps + strengths with evidence.
          </p>
          <Button disabled className="mt-5 gap-2">
            Run assessment
            <span className="text-xs text-muted-foreground/80">— coming next step</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
