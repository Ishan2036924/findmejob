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

        <ChatThread threadId={thread.id} initialMessages={initialMessages} />
      </section>
    </div>
  );
}
