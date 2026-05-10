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
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="ml-4 flex gap-3 text-xs">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'rounded px-2 py-1 transition-colors',
              active
                ? 'bg-foreground/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
