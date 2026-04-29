import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/actions';
import { getFeed } from '@/lib/jobs/queries';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
import { JobCard } from './job-card';
import { RefreshFeedButton } from './refresh-feed-button';

export const metadata = {
  title: 'Jobs · findmejob',
};

export default async function JobsPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');
  if (!isOnboardingComplete(profile)) redirect('/onboarding');

  const feed = await getFeed();

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] [background:radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.10),transparent_70%)]"
      />

      <header className="flex h-16 items-center justify-between border-b border-white/5 px-6 sm:px-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" className="gap-2">
            <LogOut className="size-3.5" strokeWidth={1.5} />
            Sign out
          </Button>
        </form>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 sm:px-10">
        <div className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Verified feed
            </span>
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {feed.hasJobs ? `${feed.jobs.length} roles` : 'Your feed'}
            </h1>
            {feed.hasJobs && (
              <p className="text-sm text-muted-foreground">
                Sorted by match. {feed.unscored > 0 && `${feed.unscored} unscored.`}
              </p>
            )}
          </div>
          <RefreshFeedButton hasJobs={feed.hasJobs} unscored={feed.unscored} />
        </div>

        {!feed.hasJobs && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-card/30 p-10 text-center backdrop-blur">
            <p className="text-sm text-muted-foreground">
              No jobs yet. Click <span className="text-foreground">Fetch the feed</span> to pull
              the latest postings for your role family and score them.
            </p>
            <p className="mt-2 text-xs text-muted-foreground/60">
              First refresh takes ~30–60s while we score everything.
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
