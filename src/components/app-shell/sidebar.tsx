import { getCurrentUserProfile } from '@/lib/profile/queries';
import { SidebarNav } from './sidebar-nav';
import { UserMenu } from './user-menu';
import { FeedbackWidget } from '@/components/feedback-widget';

export async function Sidebar() {
  const { user } = await getCurrentUserProfile();
  const email = user?.email ?? '';

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/5 bg-background/60 backdrop-blur print:hidden lg:flex">
      <div className="flex h-16 items-center px-4">
        <span className="font-mono text-sm font-medium tracking-tight">
          findmejob
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-2 py-2 overflow-y-auto">
        <span className="px-2 pt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </span>
        <SidebarNav />
      </div>
      <div className="flex flex-col gap-1 border-t border-white/5 p-2">
        <FeedbackWidget />
        <UserMenu email={email} />
      </div>
    </aside>
  );
}
