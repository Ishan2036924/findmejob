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
