'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/pipeline', label: 'Pipeline' },
  { href: '/admin/activity', label: 'Activity' },
  { href: '/admin/feedback', label: 'Feedback' },
] as const;

export type AdminNavProps = {
  /** Count of feedback rows with status='new'. >0 renders a red badge on the Feedback tab. */
  unreadFeedback?: number;
};

export function AdminNav({ unreadFeedback = 0 }: AdminNavProps) {
  const pathname = usePathname();
  return (
    <nav className="ml-4 flex gap-3 text-xs">
      {TABS.map((t) => {
        const active = pathname === t.href;
        const showBadge = t.href === '/admin/feedback' && unreadFeedback > 0;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'relative rounded px-2 py-1 transition-colors',
              active
                ? 'bg-foreground/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {t.label}
              {showBadge && (
                <span
                  aria-label={`${unreadFeedback} unread feedback`}
                  className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold leading-none text-white shadow-[0_0_0_2px_var(--color-background)]"
                >
                  {unreadFeedback > 99 ? '99+' : unreadFeedback}
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
