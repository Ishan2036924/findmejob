import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/profile/queries';
import { getMessages, getThread, listThreads } from '@/lib/chat/queries';
import { ThreadList } from '../thread-list';
import { ChatThread } from './chat-thread';

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

  const initialMessages = messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
  }));

  return (
    <div className="flex h-[calc(100dvh-3rem)] lg:h-screen">
      <div className="hidden lg:flex">
        <ThreadList threads={threads} activeId={thread.id} />
      </div>

      <section className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-col">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Conversation
            </span>
            <h1 className="truncate text-base font-medium tracking-tight">
              {thread.title}
            </h1>
          </div>
          <Link
            href="/chat"
            className="ml-3 shrink-0 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline lg:hidden"
          >
            All chats
          </Link>
        </header>

        <ChatThread threadId={thread.id} initialMessages={initialMessages} />
      </section>
    </div>
  );
}
