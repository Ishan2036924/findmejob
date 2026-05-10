import { redirect } from 'next/navigation';
import { Briefcase } from 'lucide-react';
import { getFeed } from '@/lib/jobs/queries';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
import { EmptyState, SectionHeader } from '@/components/ui-kit';
import { JobsFeed } from './jobs-feed';
import { RefreshFeedButton } from './refresh-feed-button';

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

  // Today's high matches (>= 70) — used as the "matches today" callout.
  const todayHigh = feed.jobs.filter((j) => j.match && j.match.score >= 70).length;

  return (
    <div className="flex flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-10 sm:py-12">
        <SectionHeader
          eyebrow="Verified feed"
          title={
            feed.hasJobs
              ? `${feed.jobs.length} ${feed.jobs.length === 1 ? 'role' : 'roles'}${
                  todayHigh > 0 ? ` · ${todayHigh} strong` : ''
                }`
              : 'Your feed'
          }
          description={
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground/70">
                Feed updates once every 24h — auto cron at 06:00 IST + you can pull manually once
                per day. {lastRefreshHint}
              </span>
              {feed.hasJobs && (
                <span>
                  Sorted by match.{' '}
                  {feed.unscored > 0 && (
                    <span className="text-foreground/80">{feed.unscored} unscored.</span>
                  )}
                </span>
              )}
            </div>
          }
          actions={<RefreshFeedButton hasJobs={feed.hasJobs} unscored={feed.unscored} />}
        />

        {!feed.hasJobs ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="The daily cron will pull and score the latest postings overnight. In the meantime, paste any JD URL from Applications to add and score it on demand."
          />
        ) : (
          <JobsFeed jobs={feed.jobs} />
        )}
      </main>
    </div>
  );
}
