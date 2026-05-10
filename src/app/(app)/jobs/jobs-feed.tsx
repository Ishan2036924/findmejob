'use client';

import { useMemo, useState } from 'react';
import type { FeedJob } from '@/lib/jobs/queries';
import { FilterPills, type FilterPill } from '@/components/ui-kit';
import { JobCard } from './job-card';

type JobsFeedProps = {
  jobs: FeedJob[];
};

type FilterKey =
  | 'high_match'
  | 'top'
  | 'remote'
  | 'india'
  | 'us'
  | 'unscored';

function inferRegion(loc: string | null): 'remote' | 'india' | 'us' | 'other' {
  const t = (loc ?? '').toLowerCase();
  if (!t) return 'other';
  if (/\bremote\b|\banywhere\b/.test(t)) return 'remote';
  if (
    /\bindia\b|\bdelhi\b|\bncr\b|\bgurgaon\b|\bgurugram\b|\bnoida\b|\bmumbai\b|\bbombay\b|\bpune\b|\bbengaluru\b|\bbangalore\b|\bhyderabad\b|\bchennai\b|\bkolkata\b|\bahmedabad\b/.test(
      t,
    )
  ) {
    return 'india';
  }
  if (
    /\bunited states\b|, us\b|, usa\b|\bnew york\b|\bsan francisco\b|\bbay area\b|\bseattle\b|\bboston\b|\baustin\b|\bchicago\b|\blos angeles\b/.test(
      t,
    )
  ) {
    return 'us';
  }
  return 'other';
}

/**
 * Client-side filter shell over the already-loaded feed. Pills toggle without
 * re-querying — keeps the UI responsive and avoids hammering Supabase.
 */
export function JobsFeed({ jobs }: JobsFeedProps) {
  const [filter, setFilter] = useState<FilterKey | null>(null);

  const counts = useMemo(() => {
    let high = 0;
    let unscored = 0;
    let remote = 0;
    let india = 0;
    let us = 0;
    for (const j of jobs) {
      if (!j.match) unscored += 1;
      if (j.match && j.match.score >= 85) high += 1;
      const r = inferRegion(j.location);
      if (r === 'remote') remote += 1;
      else if (r === 'india') india += 1;
      else if (r === 'us') us += 1;
    }
    return { high, unscored, remote, india, us };
  }, [jobs]);

  const options: FilterPill[] = useMemo(() => {
    const opts: FilterPill[] = [];
    if (counts.high > 0) opts.push({ key: 'high_match', label: '85+', count: counts.high });
    opts.push({ key: 'top', label: 'Top match' });
    if (counts.remote > 0) opts.push({ key: 'remote', label: 'Remote', count: counts.remote });
    if (counts.india > 0) opts.push({ key: 'india', label: 'India', count: counts.india });
    if (counts.us > 0) opts.push({ key: 'us', label: 'US', count: counts.us });
    if (counts.unscored > 0)
      opts.push({ key: 'unscored', label: 'Unscored', count: counts.unscored });
    return opts;
  }, [counts]);

  const filtered = useMemo(() => {
    if (!filter) return jobs;
    if (filter === 'high_match') return jobs.filter((j) => j.match && j.match.score >= 85);
    if (filter === 'top') {
      // Top 10 by score (already sorted server-side, but be defensive)
      return [...jobs]
        .filter((j) => j.match)
        .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))
        .slice(0, 10);
    }
    if (filter === 'unscored') return jobs.filter((j) => !j.match);
    if (filter === 'remote' || filter === 'india' || filter === 'us') {
      return jobs.filter((j) => inferRegion(j.location) === filter);
    }
    return jobs;
  }, [jobs, filter]);

  return (
    <div className="flex flex-col gap-5">
      <FilterPills
        options={options}
        value={filter}
        onChange={(k) => setFilter((k as FilterKey | null) ?? null)}
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-card/30 p-8 text-center text-sm text-muted-foreground backdrop-blur">
          No matches in this filter.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
