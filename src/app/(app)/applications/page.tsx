import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, Briefcase, MapPin } from 'lucide-react';
import { getApplications } from '@/lib/applications/queries';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
import { cn } from '@/lib/utils';
import { PasteJobButton } from './paste-job-button';

export const metadata = { title: 'Applications · findmejob' };

const STATUS_COLORS: Record<string, string> = {
  saved: 'border-zinc-400/30 bg-zinc-400/5 text-zinc-300',
  applied: 'border-sky-400/30 bg-sky-400/5 text-sky-300',
  interview: 'border-amber-400/30 bg-amber-400/5 text-amber-300',
  offer: 'border-emerald-400/30 bg-emerald-400/5 text-emerald-300',
  rejected: 'border-rose-400/30 bg-rose-400/5 text-rose-300',
  withdrawn: 'border-zinc-400/30 bg-zinc-400/5 text-zinc-400',
};

function relativeDate(iso: string | null): string {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400e3);
  if (days <= 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default async function ApplicationsPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');
  if (!isOnboardingComplete(profile)) redirect('/onboarding');

  const apps = await getApplications();

  return (
    <div className="flex flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12 sm:px-10">
        <div className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Your work board
            </span>
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Applications
            </h1>
            <p className="text-sm text-muted-foreground">
              {apps.length === 0
                ? 'Save jobs from the feed or paste any job link to start tracking.'
                : `${apps.length} ${apps.length === 1 ? 'application' : 'applications'}.`}
            </p>
          </div>
          <PasteJobButton />
        </div>

        {apps.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-card/30 p-10 text-center backdrop-blur">
            <Briefcase className="mx-auto size-6 text-muted-foreground/60" strokeWidth={1.5} />
            <p className="mt-4 text-sm text-muted-foreground">
              Empty for now. Use{' '}
              <Link href="/jobs" className="text-foreground underline-offset-4 hover:underline">
                Browse jobs
              </Link>{' '}
              and click <span className="text-foreground">Save</span> on any role, or paste a job
              link / JD with the button above.
            </p>
          </div>
        )}

        {apps.length > 0 && (
          <div className="flex flex-col gap-3">
            {apps.map((app) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="group relative flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-card/50 p-5 backdrop-blur transition-all duration-200 hover:border-white/20 hover:bg-card/70"
              >
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h3 className="truncate text-base font-medium tracking-tight">
                    {app.job.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{app.job.company}</span>
                    {app.job.location && (
                      <>
                        <span className="opacity-40">·</span>
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="size-3" strokeWidth={1.5} />
                          {app.job.location}
                        </span>
                      </>
                    )}
                    <span className="opacity-40">·</span>
                    <span className="font-mono text-[10px] opacity-60">
                      updated {relativeDate(app.updated_at)}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {app.match_score !== null && (
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-mono text-xl tabular-nums leading-none tracking-tight text-foreground/90">
                        {app.match_score}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        match
                      </span>
                    </div>
                  )}
                  <span
                    className={cn(
                      'rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-wider',
                      STATUS_COLORS[app.status],
                    )}
                  >
                    {app.status}
                  </span>
                </div>
                <ArrowUpRight
                  className="absolute right-5 bottom-5 size-4 text-muted-foreground/40 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                  strokeWidth={1.5}
                />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
