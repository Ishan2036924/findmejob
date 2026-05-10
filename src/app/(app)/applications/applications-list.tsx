'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Briefcase, MapPin } from 'lucide-react';
import {
  CompanyAvatar,
  EmptyState,
  FilterPills,
  MatchBadge,
  StatusBadge,
  type FilterPill,
} from '@/components/ui-kit';
import type { ApplicationListItem, ApplicationStatus } from '@/lib/applications/queries';

const STATUS_ORDER: ApplicationStatus[] = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
];

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
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

export function ApplicationsList({ apps }: { apps: ApplicationListItem[] }) {
  const [filter, setFilter] = useState<ApplicationStatus | null>(null);

  const counts = useMemo(() => {
    const c: Record<ApplicationStatus, number> = {
      saved: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
    };
    for (const a of apps) c[a.status] += 1;
    return c;
  }, [apps]);

  const options: FilterPill[] = useMemo(() => {
    return STATUS_ORDER.filter((s) => counts[s] > 0).map((s) => ({
      key: s,
      label: STATUS_LABEL[s],
      count: counts[s],
    }));
  }, [counts]);

  const filtered = useMemo(() => {
    if (!filter) return apps;
    return apps.filter((a) => a.status === filter);
  }, [apps, filter]);

  if (apps.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No applications yet"
        description="Save jobs from the feed or paste any job link to start tracking them here."
        action={{ label: 'Browse jobs', href: '/jobs' }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {options.length > 1 && (
        <FilterPills
          options={options}
          value={filter}
          onChange={(k) => setFilter((k as ApplicationStatus | null) ?? null)}
        />
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-card/30 p-8 text-center text-sm text-muted-foreground backdrop-blur">
          No applications in this status.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((app) => (
            <Link
              key={app.id}
              href={`/applications/${app.id}`}
              className="group relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-card/50 p-4 backdrop-blur transition-all duration-200 hover:-translate-y-px hover:border-white/20 hover:bg-card/70 sm:flex-row sm:items-start sm:gap-4 sm:p-5"
            >
              <CompanyAvatar name={app.job.company} size="md" />

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="truncate font-medium text-foreground/90">
                    {app.job.company}
                  </span>
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
                <h3 className="truncate text-base font-semibold tracking-tight sm:text-lg">
                  {app.job.title}
                </h3>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
                <MatchBadge score={app.match_score} size="md" />
                <StatusBadge status={app.status} size="md" />
              </div>

              <ArrowUpRight
                className="absolute right-4 bottom-4 size-4 text-muted-foreground/40 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 sm:right-5 sm:bottom-5"
                strokeWidth={1.5}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
