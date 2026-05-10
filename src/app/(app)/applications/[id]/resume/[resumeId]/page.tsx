import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getApplicationById } from '@/lib/applications/queries';
import { getResumeById } from '@/lib/resume/queries';
import { getCurrentUserProfile } from '@/lib/profile/queries';
import { ResumeDocument } from '@/components/resume-document';
import { PrintButton } from './print-button';

export const metadata = { title: 'Tailored resume · findmejob' };

export default async function TailoredResumePage({
  params,
}: {
  params: Promise<{ id: string; resumeId: string }>;
}) {
  const { id, resumeId } = await params;
  const { user } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');

  const [app, resume] = await Promise.all([
    getApplicationById(id),
    getResumeById(resumeId),
  ]);

  if (!app || !resume) notFound();
  if (resume.target_job_id !== app.job.id) notFound();

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950">
      {/* Top bar — hidden in print */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/5 bg-zinc-950/80 px-6 backdrop-blur sm:px-10 print:hidden">
        <Link
          href={`/applications/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to application
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
            tailored for {app.job.title} · {app.job.company}
          </span>
          <PrintButton />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-10 print:p-0">
        <p className="mb-4 max-w-[8.5in] self-center text-center text-xs text-muted-foreground/80 print:hidden">
          To save as PDF, click <span className="text-foreground">Download PDF</span> →
          set destination to <span className="text-foreground">Save as PDF</span>. Layout is
          ATS-friendly single-column.
        </p>
        {resume.source === 'ai_tailored' && (() => {
          const meta = resume.tailoring_meta;
          const verifier = meta?.verifier ?? null;
          const score = verifier?.score ?? null;
          const scoreColor =
            score == null
              ? 'text-muted-foreground'
              : score >= 80
              ? 'text-emerald-400'
              : score >= 70
              ? 'text-amber-400'
              : 'text-rose-400';
          const addressed = verifier?.must_haves_addressed ?? [];
          const missing = verifier?.must_haves_missing ?? [];
          const halluc = verifier?.hallucination_risks ?? [];

          return (
            <div className="mb-6 w-full max-w-[8.5in] space-y-3 rounded-2xl border border-white/10 bg-card/40 p-4 print:hidden">
              <div className="flex items-start justify-between gap-4">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Tailoring summary
                </span>
                {score != null && (
                  <div className="text-xs text-muted-foreground">
                    Tailor verifier score:{' '}
                    <span className={`font-mono text-sm font-semibold ${scoreColor}`}>
                      {score}
                    </span>
                    /100
                    {meta?.retried ? (
                      <span className="ml-2 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        retried
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              <p className="text-sm text-foreground">
                {meta?.meta_summary ?? 'No tailoring metadata available.'}
              </p>

              {meta?.applied != null && (
                <p className="text-xs text-muted-foreground">
                  {meta.applied} edit operations applied
                </p>
              )}

              {(addressed.length > 0 || missing.length > 0) && (
                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  {addressed.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Must-haves addressed
                      </p>
                      <ul className="mt-1 space-y-1 text-xs text-emerald-300/90">
                        {addressed.map((m, i) => (
                          <li key={i} className="flex gap-2">
                            <span aria-hidden>✓</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {missing.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Must-haves still missing
                      </p>
                      <ul className="mt-1 space-y-1 text-xs text-amber-300/90">
                        {missing.map((m, i) => (
                          <li key={i} className="flex gap-2">
                            <span aria-hidden>✗</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {halluc.length > 0 && (
                <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-rose-300">
                    Review claims — verifier flagged possible fabrication
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-rose-200/90">
                    {halluc.map((h, i) => (
                      <li key={i} className="flex gap-2">
                        <span aria-hidden>!</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })()}
        <ResumeDocument resume={resume.resume_json} />
        <p className="mt-4 max-w-[8.5in] self-center text-center font-mono text-[10px] text-muted-foreground/60 print:hidden">
          {resume.source} · generated {new Date(resume.created_at).toLocaleString()}
        </p>
      </main>

      {/* Print stylesheet — keep only the resume paper visible. */}
      <style>{`
        @media print {
          @page { size: letter; margin: 0; }
          html, body { background: white !important; }
          [data-resume-paper] { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
