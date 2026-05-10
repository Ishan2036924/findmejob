import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MessageSquare, Plus } from 'lucide-react';
import { createThread } from '@/lib/chat/actions';
import type { ChatThreadRow } from '@/lib/chat/queries';

export function ThreadList({
  threads,
  activeId,
}: {
  threads: ChatThreadRow[];
  activeId?: string;
}) {
  return (
    <aside className="flex w-full flex-col border-r border-white/5 lg:w-72 lg:shrink-0">
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-4 py-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Conversations
        </span>
        <form action={createThread}>
          <button
            type="submit"
            className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="New chat"
          >
            <Plus className="size-3.5" strokeWidth={1.5} />
          </button>
        </form>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {threads.length === 0 && (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            No conversations yet.
          </p>
        )}
        <ul className="flex flex-col gap-0.5">
          {threads.map((thread) => {
            const isActive = thread.id === activeId;
            return (
              <li key={thread.id}>
                <Link
                  href={`/chat/${thread.id}`}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <MessageSquare
                    className="size-3.5 shrink-0"
                    strokeWidth={1.5}
                  />
                  <span className="truncate">{thread.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
