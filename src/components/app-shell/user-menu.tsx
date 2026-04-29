'use client';

import { ChevronUp, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/auth/actions';

export function UserMenu({ email }: { email: string }) {
  const initial = email?.[0]?.toUpperCase() ?? '?';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
          />
        }
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-foreground">
          {initial}
        </span>
        <span className="min-w-0 flex-1 truncate text-left text-xs">{email}</span>
        <ChevronUp className="size-3.5 shrink-0" strokeWidth={1.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={8}
        className="w-56"
      >
        <DropdownMenuItem
          render={
            <Link href="/settings/memory" className="cursor-pointer">
              <Settings className="size-4" strokeWidth={1.5} />
              <span>Settings</span>
            </Link>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <form action={signOut} className="w-full">
              <button
                type="submit"
                className="flex w-full items-center gap-1.5 text-left"
              >
                <LogOut className="size-4" strokeWidth={1.5} />
                <span>Sign out</span>
              </button>
            </form>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
