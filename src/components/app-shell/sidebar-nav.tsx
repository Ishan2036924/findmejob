'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  soon?: boolean;
};

export function SidebarNav({ items }: { items: SidebarNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== '/' && pathname?.startsWith(item.href + '/'));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4" strokeWidth={1.5} />
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
