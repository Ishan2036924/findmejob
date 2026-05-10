import { redirect } from 'next/navigation';
import { MessageSquare, Sparkles } from 'lucide-react';
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
    <div className="flex min-h-[calc(100dvh-3rem)] lg:h-screen lg:min-h-0">
      <ThreadList threads={threads} />

      <section className="hidden flex-1 flex-col items-center justify-center px-6 py-12 lg:flex">
        <div className="flex max-w-md flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-indigo-300 shadow-lg shadow-indigo-500/10">
            <Sparkles className="size-6" strokeWidth={1.5} />
          </span>
          <h1 className="mt-6 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Ask anything about your job search
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            I have full context of your applications, scores, gaps, and assessment.
            Tell me what you&apos;re trying to do — I can pull data, generate
            artifacts, or just talk it through.
          </p>
          <form action={createThread} className="mt-7">
            <Button
              type="submit"
              size="lg"
              className="gap-2 shadow-[0_0_0_0_rgba(99,102,241,0)] transition-shadow hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.55)]"
            >
              <MessageSquare className="size-4" strokeWidth={1.5} />
              Start a new conversation
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
