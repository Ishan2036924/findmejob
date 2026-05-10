import { redirect } from 'next/navigation';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
import { signOut } from '@/lib/auth/actions';
import { OnboardingFlow } from './onboarding-flow';

export const metadata = {
  title: 'Get started · findmejob',
};

export default async function OnboardingPage() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) redirect('/sign-in');
  if (isOnboardingComplete(profile)) redirect('/dashboard');

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Backdrop: two-layer gradient + faint dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[44rem] [background:radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.12),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] [background:radial-gradient(40%_40%_at_80%_0%,rgba(168,85,247,0.08),transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      <header className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-10">
        <span className="font-mono text-sm font-medium tracking-tight">findmejob</span>
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-24 pt-2 sm:px-6 sm:pt-8">
        <div className="w-full max-w-2xl">
          <OnboardingFlow
            initialProfile={{
              target_role_family: profile?.target_role_family ?? null,
              target_seniority: profile?.target_seniority ?? null,
              target_location: profile?.target_location ?? '',
              raw_resume_text: profile?.raw_resume_text ?? '',
              linkedin_paste: profile?.linkedin_paste ?? '',
              portfolio_urls: profile?.portfolio_urls ?? [],
            }}
          />
        </div>
      </main>
    </div>
  );
}
