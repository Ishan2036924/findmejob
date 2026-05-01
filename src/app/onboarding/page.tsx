import { redirect } from 'next/navigation';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] [background:radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.10),transparent_70%)]"
      />
      <header className="flex h-16 items-center justify-between px-6 sm:px-10">
        <span className="font-mono text-sm font-medium tracking-tight">findmejob</span>
        <span className="text-xs text-muted-foreground">Step 1 of 4</span>
      </header>
      <main className="flex flex-1 items-start justify-center px-6 pb-20 pt-4 sm:pt-12">
        <div className="w-full max-w-2xl">
          <OnboardingFlow
            initialProfile={{
              target_role_family: profile?.target_role_family ?? null,
              target_seniority: profile?.target_seniority ?? null,
              target_location: profile?.target_location ?? 'Delhi NCR',
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
