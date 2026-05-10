import { ReactNode } from 'react';
import Link from 'next/link';

export const metadata = { title: 'Admin · findmejob' };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-12 items-center gap-4 border-b border-white/5 px-6">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          findmejob admin
        </span>
        <nav className="ml-4 flex gap-3 text-xs">
          <Link
            href="/admin/feedback"
            className="text-muted-foreground hover:text-foreground"
          >
            Feedback
          </Link>
        </nav>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
