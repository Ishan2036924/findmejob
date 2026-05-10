'use client';

import { useState } from 'react';
import {
  Building2,
  Calendar,
  ChevronDown,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedJob } from '@/lib/jobs/queries';
import { CompanyAvatar, MatchBadge } from '@/components/ui-kit';
import { SaveJobButton } from './save-job-button';

function relativeDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400e3);
  if (days <= 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function truncate(s: string, n: number): string {
  if (!s) return '';
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + '…';
}

/**
 * LinkedIn-style job card. Single-column at lg, but with a card-grid feel —
 * company logo (deterministic letter avatar), title, JD preview, large match
 * badge on md+, action buttons + expand toggle for gaps/strengths.
 */
export function JobCard({ job }: { job: FeedJob }) {
  const [expanded, setExpanded] = useState(false);
  const score = job.match?.score ?? null;
  const hasInsight =
    !!job.match &&
    (job.match.reasoning.length > 0 ||
      job.match.strengths.length > 0 ||
      job.match.gaps.length > 0);

  return (
    <article
      className={cn(
        'group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-card/50 p-4 backdrop-blur transition-all duration-200 sm:p-5',
        'hover:border-white/20 hover:bg-card/70 hover:-translate-y-px',
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <CompanyAvatar name={job.company} size="md" />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Company + meta row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-foreground/90">
              <Building2 className="size-3 opacity-70" strokeWidth={1.5} />
              <span className="truncate">{job.company}</span>
            </span>
            {job.location && (
              <>
                <span className="opacity-40">·</span>
                <span className="inline-flex items-center gap-1 truncate">
                  <MapPin className="size-3" strokeWidth={1.5} />
                  {job.location}
                </span>
              </>
            )}
            {job.posted_at && (
              <>
                <span className="opacity-40">·</span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] opacity-70">
                  <Calendar className="size-3" strokeWidth={1.5} />
                  {relativeDate(job.posted_at)}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="truncate text-base font-semibold tracking-tight sm:text-lg">
            {job.title}
          </h3>

          {/* JD preview */}
          {job.description ? (
            <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {truncate(job.description, 220)}
            </p>
          ) : null}
        </div>

        {/* Match badge — desktop only in the right column */}
        <div className="hidden shrink-0 md:flex md:flex-col md:items-end md:gap-2">
          <MatchBadge score={score} size="lg" />
        </div>
      </div>

      {/* Mobile match badge */}
      <div className="flex items-center gap-2 md:hidden">
        <MatchBadge score={score} size="md" />
      </div>

      {/* Expanded: reasoning + chips */}
      {expanded && hasInsight && job.match && (
        <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-background/40 p-3.5">
          {job.match.reasoning && (
            <p className="text-sm leading-relaxed text-muted-foreground">{job.match.reasoning}</p>
          )}
          {(job.match.strengths.length > 0 || job.match.gaps.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {job.match.strengths.slice(0, 3).map((s, i) => (
                <span
                  key={`s-${i}`}
                  className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2 py-0.5 text-[10px] text-emerald-300/90"
                >
                  + {s}
                </span>
              ))}
              {job.match.gaps.slice(0, 3).map((g, i) => (
                <span
                  key={`g-${i}`}
                  className="rounded-full border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 text-[10px] text-amber-300/90"
                >
                  − {g}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom action row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <SaveJobButton jobId={job.id} initialApplicationId={job.application_id} />
          {job.source_url && (
            <a
              href={job.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-white/10 bg-card/30 px-2.5 text-[0.8rem] text-muted-foreground transition-colors hover:border-white/20 hover:bg-card/60 hover:text-foreground"
            >
              <ExternalLink className="size-3.5" strokeWidth={1.5} />
              Open
            </a>
          )}
        </div>
        {hasInsight && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-expanded={expanded}
          >
            {expanded ? 'Hide' : 'Why this match'}
            <ChevronDown
              className={cn(
                'size-3.5 transition-transform',
                expanded && 'rotate-180',
              )}
              strokeWidth={1.5}
            />
          </button>
        )}
      </div>
    </article>
  );
}
