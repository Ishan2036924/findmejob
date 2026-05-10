import { ArrowUpRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedJob } from '@/lib/jobs/queries';
import { SaveJobButton } from './save-job-button';

function scoreClass(score: number): string {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 55) return 'text-amber-300';
  return 'text-zinc-400';
}

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

export function JobCard({ job }: { job: FeedJob }) {
  const score = job.match?.score ?? null;

  return (
    <a
      href={job.source_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-card/50 p-5 backdrop-blur transition-all duration-200 hover:border-white/20 hover:bg-card/70"
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <h3 className="truncate text-base font-medium tracking-tight">{job.title}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="truncate">{job.company}</span>
            {job.location && (
              <>
                <span className="opacity-40">·</span>
                <span className="inline-flex items-center gap-1 truncate">
                  <MapPin className="size-3" strokeWidth={1.5} />
                  {job.location}
                </span>
              </>
            )}
            <span className="opacity-40">·</span>
            <span className="font-mono text-[10px] opacity-60">{relativeDate(job.posted_at)}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {score !== null ? (
            <div className="flex flex-col items-end gap-0.5">
              <span className={cn('font-mono text-2xl tabular-nums leading-none tracking-tight', scoreClass(score))}>
                {score}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">match</span>
            </div>
          ) : (
            <span className="font-mono text-xs text-muted-foreground/60">—</span>
          )}
          <SaveJobButton jobId={job.id} initialApplicationId={job.application_id} />
        </div>
      </div>

      {job.match && (
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {job.match.reasoning}
        </p>
      )}

      {job.match && (job.match.strengths.length > 0 || job.match.gaps.length > 0) && (
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

      <ArrowUpRight
        className="absolute right-5 bottom-5 size-4 text-muted-foreground/40 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
        strokeWidth={1.5}
      />
    </a>
  );
}
