import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ExternalLink, MapPin, MessageSquare } from 'lucide-react';
import { getApplicationById } from '@/lib/applications/queries';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
import { CompanyAvatar, MatchBadge, StickyRail } from '@/components/ui-kit';
import { StatusPills } from './status-pills';
import { NotesEditor } from './notes-editor';
import { ResumeCard } from './resume-card';
import { CoverLetterCard } from './cover-letter-card';
import { CompanyBriefCard } from './company-brief-card';
import { InterviewQuestionsCard } from './interview-questions-card';
import { OutreachCard } from './outreach-card';
import { JobDescription } from './job-description';
import {
  getLatestTailoredResumeForJob,
  getResumeById,
} from '@/lib/resume/queries';
import { getLatestGenerationsByKind } from '@/lib/applications/generations';
import { getPracticeSessions } from '@/lib/practice/queries';
import type { CoverLetterOutput } from '@/lib/ai/schemas/cover-letter';
import type { CompanyBriefOutput } from '@/lib/ai/schemas/company-brief';
import type { InterviewQuestionsOutput } from '@/lib/ai/schemas/interview-questions';
import type { OutreachOutput } from '@/lib/ai/schemas/outreach';

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

  const [tailoredResume, generations, practiceSessions] = await Promise.all([
    getLatestTailoredResumeForJob(app.job.id),
    getLatestGenerationsByKind(app.id),
    getPracticeSessions(app.id),
  ]);

  // Pull verifier metadata for the resume (if any) — uses the same query the
  // resume detail page does, so no new lib code.
  const tailoredResumeFull = tailoredResume?.id
    ? await getResumeById(tailoredResume.id)
    : null;
  const verifier = tailoredResumeFull?.tailoring_meta?.verifier ?? null;
  const verifierMeta = verifier
    ? {
        score: verifier.score,
        mustHavesAddressed: verifier.must_haves_addressed.length,
        mustHavesTotal:
          verifier.must_haves_addressed.length + verifier.must_haves_missing.length,
      }
    : null;

  const coverLetter = generations.get('cover_letter')?.output as CoverLetterOutput | undefined;
  const companyBrief = generations.get('company_brief')?.output as CompanyBriefOutput | undefined;
  const interviewQs = generations.get('interview_questions')?.output as
    | InterviewQuestionsOutput
    | undefined;
  const outreach = generations.get('outreach_drafts')?.output as OutreachOutput | undefined;

  return (
    <div className="flex flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-8 sm:py-10">
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to applications
        </Link>

        {/* Header card */}
        <section className="rounded-3xl border border-white/10 bg-card/40 p-6 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-5">
            {/* Row 1: avatar + title + meta */}
            <div className="flex items-start gap-4">
              <CompanyAvatar name={app.job.company} size="lg" className="size-14" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  {app.job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/90">{app.job.company}</span>
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
                </div>
              </div>

              {/* Match badge top-right (desktop) */}
              <div className="hidden shrink-0 sm:flex">
                <MatchBadge score={app.match?.score ?? null} size="lg" />
              </div>
            </div>

            {/* Row 2: mobile match badge */}
            <div className="flex items-center gap-2 sm:hidden">
              <MatchBadge score={app.match?.score ?? null} size="md" />
            </div>

            {/* Row 3: actions */}
            <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
              {app.job.source_url && (
                <a
                  href={app.job.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-foreground/30 bg-foreground/10 px-3 text-xs font-medium text-foreground transition-colors hover:bg-foreground/20"
                >
                  <ExternalLink className="size-3.5" strokeWidth={1.5} />
                  Open posting
                </a>
              )}
            </div>

            {/* Row 4: status pills */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Status
              </span>
              <StatusPills applicationId={app.id} initialStatus={app.status} />
            </div>
          </div>
        </section>

        {/* Two-column: left main + right sticky rail */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left main */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {/* Match breakdown */}
            {app.match && (
              <section className="rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-medium tracking-tight">Why this match</h2>
                  <MatchBadge score={app.match.score} size="sm" />
                </div>
                {app.match.reasoning && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {app.match.reasoning}
                  </p>
                )}
                {(app.match.strengths.length > 0 || app.match.gaps.length > 0) && (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {app.match.strengths.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] uppercase tracking-wider text-emerald-300/80">
                          Strengths
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {app.match.strengths.slice(0, 3).map((s, i) => (
                            <span
                              key={i}
                              className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2 py-0.5 text-[11px] text-emerald-300/90"
                            >
                              + {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {app.match.gaps.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] uppercase tracking-wider text-amber-300/80">
                          Gaps
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {app.match.gaps.slice(0, 3).map((g, i) => (
                            <span
                              key={i}
                              className="rounded-full border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 text-[11px] text-amber-300/90"
                            >
                              − {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* JD body */}
            <JobDescription
              description={app.job.description}
              isPasted={app.job.source === 'user_pasted'}
            />

            {/* Notes (kept here — still important on detail page) */}
            <section className="rounded-2xl border border-white/10 bg-card/30 p-5 backdrop-blur sm:p-6">
              <NotesEditor applicationId={app.id} initialNotes={app.notes} />
            </section>
          </div>

          {/* Right sticky rail */}
          <StickyRail className="lg:col-span-5">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                On-demand artifacts
              </span>
              <ResumeCard
                applicationId={app.id}
                initialResumeId={tailoredResume?.id ?? null}
                initialVerifier={verifierMeta}
              />
              <CoverLetterCard
                applicationId={app.id}
                initialOutput={coverLetter ?? null}
              />
              <CompanyBriefCard
                applicationId={app.id}
                initialOutput={companyBrief ?? null}
              />
              <InterviewQuestionsCard
                applicationId={app.id}
                initialOutput={interviewQs ?? null}
              />
              <OutreachCard applicationId={app.id} initialOutput={outreach ?? null} />
            </div>

            {/* Practice link */}
            <Link
              href={`/applications/${app.id}/practice`}
              className={
                'group flex items-center gap-3 rounded-xl border border-indigo-400/20 bg-indigo-400/[0.06] p-4 transition-all hover:border-indigo-400/40 hover:bg-indigo-400/[0.12]'
              }
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-indigo-400/30 bg-indigo-400/10">
                <MessageSquare className="size-4 text-indigo-300" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Practice mode</p>
                <p className="text-[11px] text-muted-foreground">
                  {practiceSessions.length > 0
                    ? `${practiceSessions.length} session${practiceSessions.length === 1 ? '' : 's'} · continue`
                    : interviewQs
                      ? 'Type answers, get scored 0–10'
                      : 'Generate questions first'}
                </p>
              </div>
              <span className="text-xs text-muted-foreground transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </StickyRail>
        </div>
      </main>
    </div>
  );
}
