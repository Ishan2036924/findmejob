import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  HelpCircle,
  LogOut,
  MapPin,
  Mic,
  PenLine,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/actions';
import { getApplicationById } from '@/lib/applications/queries';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
import { ScoreRing } from '@/components/score-ring';
import { StatusPills } from './status-pills';
import { NotesEditor } from './notes-editor';
import { ArtifactCard } from './artifact-card';
import { ResumeCard } from './resume-card';
import { getLatestTailoredResumeForJob } from '@/lib/resume/queries';

export const metadata = { title: 'Application · findmejob' };

function relativeDate(iso: string | null): string {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400e3);
  if (days <= 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');
  if (!isOnboardingComplete(profile)) redirect('/onboarding');

  const app = await getApplicationById(id);
  if (!app) notFound();

  const tailoredResume = await getLatestTailoredResumeForJob(app.job.id);

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] [background:radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.10),transparent_70%)]"
      />

      <header className="flex h-16 items-center justify-between border-b border-white/5 px-6 sm:px-10">
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Applications
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" className="gap-2">
            <LogOut className="size-3.5" strokeWidth={1.5} />
            Sign out
          </Button>
        </form>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-6 py-12 sm:px-10">
        {/* Job header */}
        <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-1 flex-col gap-3">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {app.job.source === 'user_pasted' ? 'You pasted this' : `Source · ${app.job.source}`}
            </span>
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {app.job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="text-foreground">{app.job.company}</span>
              {app.job.location && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" strokeWidth={1.5} />
                    {app.job.location}
                  </span>
                </>
              )}
              {app.job.posted_at && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="font-mono text-xs opacity-60">
                    posted {relativeDate(app.job.posted_at)}
                  </span>
                </>
              )}
              {app.job.source_url && (
                <>
                  <span className="opacity-40">·</span>
                  <a
                    href={app.job.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-foreground hover:underline"
                  >
                    Open posting
                    <ExternalLink className="size-3" strokeWidth={1.5} />
                  </a>
                </>
              )}
            </div>
          </div>

          {app.match && (
            <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-card/40 p-4 backdrop-blur">
              <ScoreRing score={app.match.score} size={88} />
              <div className="hidden max-w-xs sm:block">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Match
                </span>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {app.match.reasoning}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Status + notes */}
        <section className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Status</span>
            <StatusPills applicationId={app.id} initialStatus={app.status} />
          </div>
          <NotesEditor applicationId={app.id} initialNotes={app.notes} />
        </section>

        {/* Artifacts */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Generate per request
            </span>
            <h2 className="text-balance text-xl font-semibold tracking-tight">
              Application artifacts
            </h2>
            <p className="text-sm text-muted-foreground">
              Each artifact is generated only when you click. No tokens spent on things you don&apos;t ask for.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ResumeCard
              applicationId={app.id}
              initialResumeId={tailoredResume?.id ?? null}
            />
            <ArtifactCard
              icon={PenLine}
              title="Cover letter"
              description="Personal cover letter tied to this role and your experience."
              comingIn="Slice 2"
            />
            <ArtifactCard
              icon={Building2}
              title="About the company"
              description="Recent news, funding, culture signals — context before applying."
              comingIn="Slice 2"
            />
            <ArtifactCard
              icon={HelpCircle}
              title="Interview questions"
              description="Likely questions for this JD with STAR scaffolding for behavioral."
              comingIn="Slice 2"
            />
            <ArtifactCard
              icon={Send}
              title="Outreach drafts"
              description="DM templates for recruiter, hiring manager, or referral."
              comingIn="Slice 2"
            />
            <ArtifactCard
              icon={Mic}
              title="Practice answers"
              description="Type your answer to a generated question, get scored feedback."
              comingIn="Slice 2"
            />
          </div>
        </section>

        {/* Full JD */}
        <section className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Job description
          </span>
          <div className="rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
              {app.job.description}
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}
