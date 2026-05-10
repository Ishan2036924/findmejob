import { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/admin-nav';
import { getUnreadFeedbackCount } from '@/lib/admin/queries';

export const metadata = { title: 'Admin · findmejob' };

// Force dynamic so the unread badge reflects fresh count on every nav.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const unreadFeedback = await getUnreadFeedbackCount();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-12 items-center gap-4 border-b border-white/5 px-6">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          findmejob admin
        </span>
        <AdminNav unreadFeedback={unreadFeedback} />
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
