import { notFound, redirect } from 'next/navigation';
import { Send } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getCurrentUserProfile } from '@/lib/profile/queries';
import { getMessages, getThread, listThreads } from '@/lib/chat/queries';
import { cn } from '@/lib/utils';
import { ThreadList } from '../thread-list';

export const metadata = { title: 'Chat · findmejob' };

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const { user } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');

  const thread = await getThread(threadId);
  if (!thread) notFound();

  const [threads, messages] = await Promise.all([
    listThreads(),
    getMessages(threadId),
  ]);

  return (
    <div className="flex h-screen">
      <ThreadList threads={threads} activeId={thread.id} />

      <section className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-3">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Conversation
            </span>
            <h1 className="text-base font-medium tracking-tight">
              {thread.title}
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {messages.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-card/30 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No messages yet. Career agent ships next turn — once it does,
                  this thread starts working.
                </p>
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'rounded p-4 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'ml-auto max-w-[80%] bg-primary/10 text-foreground'
                    : 'bg-muted/40 text-foreground',
                )}
              >
                <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                  {m.role}
                </span>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="border-t border-white/5 px-6 py-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="flex flex-1 items-end gap-2 rounded-xl border border-white/10 bg-card/40 p-2">
                    <textarea
                      disabled
                      placeholder="Career agent ships next turn"
                      rows={2}
                      className="min-h-[44px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled
                      aria-label="Send"
                      className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/40 text-primary-foreground opacity-60"
                    >
                      <Send className="size-4" strokeWidth={1.5} />
                    </button>
                  </div>
                }
              />
              <TooltipContent>Career agent ships next turn</TooltipContent>
            </Tooltip>
          </div>
        </footer>
      </section>
    </div>
  );
}
