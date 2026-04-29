import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/actions';
import { getApplicationById } from '@/lib/applications/queries';
import { getLatestGenerationsByKind } from '@/lib/applications/generations';
import { getPracticeSessions } from '@/lib/practice/queries';
import { getCurrentUserProfile } from '@/lib/profile/queries';
import { PracticeSession } from './practice-session';
import type { InterviewQuestionsOutput } from '@/lib/ai/schemas/interview-questions';

export const metadata = { title: 'Practice · findmejob' };

export default async function PracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');

  const [app, generations, sessions] = await Promise.all([
    getApplicationById(id),
    getLatestGenerationsByKind(id),
    getPracticeSessions(id),
  ]);

  if (!app) notFound();

  const interviewQ = generations.get('interview_questions');
  if (!interviewQ) {
    redirect(`/applications/${id}`);
  }

  const questions = interviewQ.output as InterviewQuestionsOutput;
  const flat: { id: string; question: string; type: 'technical' | 'behavioral' | 'situational' }[] = [
    ...questions.technical.map((q, i) => ({ id: `t-${i}`, question: q.question, type: 'technical' as const })),
    ...questions.behavioral.map((q, i) => ({ id: `b-${i}`, question: q.question, type: 'behavioral' as const })),
    ...questions.situational.map((q, i) => ({ id: `s-${i}`, question: q.question, type: 'situational' as const })),
  ];

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] [background:radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.10),transparent_70%)]"
      />

      <header className="flex h-16 items-center justify-between border-b border-white/5 px-6 sm:px-10">
        <Link
          href={`/applications/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to application
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" className="gap-2">
            <LogOut className="size-3.5" strokeWidth={1.5} />
            Sign out
          </Button>
        </form>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 sm:px-10">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Practice mode · {app.job.title} at {app.job.company}
          </span>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Pick a question. Type your answer. Get scored.
          </h1>
          <p className="text-sm text-muted-foreground">
            {sessions.length === 0
              ? 'No practice sessions yet — pick any question below to start.'
              : `${sessions.length} previous ${sessions.length === 1 ? 'session' : 'sessions'} on this application.`}
          </p>
        </div>

        <PracticeSession applicationId={id} questions={flat} pastSessions={sessions} />
      </main>
    </div>
  );
}
