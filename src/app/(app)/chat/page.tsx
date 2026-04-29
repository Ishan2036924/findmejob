import { redirect } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listThreads } from '@/lib/chat/queries';
import { createThread } from '@/lib/chat/actions';
import { getCurrentUserProfile } from '@/lib/profile/queries';
import { ThreadList } from './thread-list';

export const metadata = { title: 'Chat · findmejob' };

export default async function ChatIndexPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');

  const threads = await listThreads();

  return (
    <div className="flex h-screen">
      <ThreadList threads={threads} />

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="flex max-w-md flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-card/40 text-muted-foreground">
            <MessageSquare className="size-5" strokeWidth={1.5} />
          </span>
          <h1 className="mt-6 text-balance text-2xl font-semibold tracking-tight">
            Start a new conversation
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Start a new conversation. Ask anything about your job search — I
            have full context of your applications, scores, and assessment.
          </p>
          <form action={createThread} className="mt-6">
            <Button type="submit" size="lg" className="gap-2">
              <MessageSquare className="size-4" strokeWidth={1.5} />
              New chat
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
