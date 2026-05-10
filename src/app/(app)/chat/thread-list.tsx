import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MessageSquare, Plus } from 'lucide-react';
import { createThread } from '@/lib/chat/actions';
import type { ChatThreadRow } from '@/lib/chat/queries';

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
}

export function ThreadList({
  threads,
  activeId,
}: {
  threads: ChatThreadRow[];
  activeId?: string;
}) {
  return (
    <aside className="flex w-full flex-col border-r border-white/5 lg:w-64 lg:shrink-0">
      <div className="flex flex-col gap-2 border-b border-white/5 p-3">
        <span className="px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Conversations
        </span>
        <form action={createThread}>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/20"
          >
            <Plus className="size-3.5" strokeWidth={1.5} />
            New chat
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
                    'group flex items-start gap-2 rounded-lg border-l-2 px-2 py-2 text-sm transition-colors',
                    isActive
                      ? 'border-l-indigo-400 bg-muted text-foreground'
                      : 'border-l-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  <MessageSquare
                    className="mt-0.5 size-3.5 shrink-0 opacity-70"
                    strokeWidth={1.5}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[13px] font-medium">
                        {thread.title}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] opacity-60">
                        {relativeTime(thread.last_message_at ?? thread.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
