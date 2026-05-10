import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/app-shell/sidebar';
import { MobileSidebar } from '@/components/app-shell/mobile-sidebar';
import {
  getCurrentUserProfile,
  isOnboardingComplete,
} from '@/lib/profile/queries';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');
  if (!isOnboardingComplete(profile)) redirect('/onboarding');

  return (
    <div className="relative min-h-screen lg:flex">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[40rem] [background:radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.10),transparent_70%)]"
      />
      <Sidebar />
      <MobileSidebar email={user.email ?? ''} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
