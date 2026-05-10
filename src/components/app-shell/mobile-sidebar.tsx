'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { SidebarNav } from './sidebar-nav';
import { UserMenu } from './user-menu';

/**
 * Mobile-only top header with hamburger drawer. Hidden at ≥lg (1024px).
 * The desktop <Sidebar /> takes over at that breakpoint.
 */
export function MobileSidebar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-white/5 bg-background/95 px-3 backdrop-blur lg:hidden print:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <button
              type="button"
              aria-label="Open navigation"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
            />
          }
        >
          <Menu className="size-4" strokeWidth={1.5} />
        </SheetTrigger>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="flex w-64 flex-col gap-0 border-r border-white/5 bg-background/95 p-0"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-12 items-center px-4 border-b border-white/5">
            <span className="font-mono text-sm font-medium tracking-tight">
              findmejob
            </span>
          </div>
          <div
            className="flex flex-1 flex-col gap-2 px-2 py-2 overflow-y-auto"
            onClick={() => setOpen(false)}
          >
            <span className="px-2 pt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Workspace
            </span>
            <SidebarNav />
          </div>
          <div
            className="border-t border-white/5 p-2"
            onClick={() => setOpen(false)}
          >
            <UserMenu email={email} />
          </div>
        </SheetContent>
      </Sheet>
      <span className="font-mono text-sm font-medium tracking-tight">
        findmejob
      </span>
    </header>
  );
}
