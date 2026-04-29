'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type Item = { href: string; label: string; soon?: boolean };

const ITEMS: Item[] = [
  { href: '/settings/memory', label: 'Memory' },
  { href: '#', label: 'Account', soon: true },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {ITEMS.map((item) => {
        const isActive = item.href !== '#' && pathname?.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              item.href === '#' && 'pointer-events-none opacity-60',
            )}
          >
            <span>{item.label}</span>
            {item.soon && (
              <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                soon
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
