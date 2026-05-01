import { redirect } from 'next/navigation';
import { getFeed } from '@/lib/jobs/queries';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
import { JobCard } from './job-card';

export const metadata = {
  title: 'Jobs · findmejob',
};

function formatLastRefresh(lastSeenAt: string | null): string {
  if (!lastSeenAt) return 'No refresh yet — first cron will populate.';
  const ms = Date.now() - new Date(lastSeenAt).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return 'Last refresh today.';
  if (hours < 24) return `Last refresh ${hours}h ago.`;
  const days = Math.floor(hours / 24);
  return `Last refresh ${days}d ago.`;
}

export default async function JobsPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');
  if (!isOnboardingComplete(profile)) redirect('/onboarding');

  const feed = await getFeed();
  const lastRefreshHint = formatLastRefresh(feed.lastSeenAt);

  return (
    <div className="flex flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12 sm:px-10">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Verified feed
          </span>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {feed.hasJobs ? `${feed.jobs.length} roles` : 'Your feed'}
          </h1>
          <p className="text-xs text-muted-foreground/70">
            Feed refreshes once daily at 06:00 IST. {lastRefreshHint}
          </p>
          {feed.hasJobs && (
            <p className="text-sm text-muted-foreground">
              Sorted by match. {feed.unscored > 0 && `${feed.unscored} unscored.`}
            </p>
          )}
        </div>

        {!feed.hasJobs && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-card/30 p-10 text-center backdrop-blur">
            <p className="text-sm text-muted-foreground">
              No jobs yet. The daily cron will pull and score the latest postings overnight.
            </p>
            <p className="mt-2 text-xs text-muted-foreground/60">
              In the meantime, paste any JD URL from <span className="text-foreground">Applications</span>{' '}
              to add and score it on demand.
            </p>
          </div>
        )}

        {feed.hasJobs && (
          <div className="flex flex-col gap-3">
            {feed.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
