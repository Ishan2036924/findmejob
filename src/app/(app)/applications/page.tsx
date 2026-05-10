import { redirect } from 'next/navigation';
import { getApplications } from '@/lib/applications/queries';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
import { SectionHeader } from '@/components/ui-kit';
import { PasteJobButton } from './paste-job-button';
import { ApplicationsList } from './applications-list';

export const metadata = { title: 'Applications · findmejob' };

export default async function ApplicationsPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');
  if (!isOnboardingComplete(profile)) redirect('/onboarding');

  const apps = await getApplications();

  return (
    <div className="flex flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-10 sm:py-12">
        <SectionHeader
          eyebrow="Your work board"
          title={apps.length === 0 ? 'Applications' : `${apps.length} application${apps.length === 1 ? '' : 's'}`}
          description="Track where each one stands."
          actions={<PasteJobButton />}
        />

        <ApplicationsList apps={apps} />
      </main>
    </div>
  );
}
