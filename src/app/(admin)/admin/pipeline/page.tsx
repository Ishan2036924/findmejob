import { requireAdmin } from '@/lib/admin/auth';
import { getPipelineHealth } from '@/lib/admin/queries';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const metadata = {
  title: 'Pipeline · admin · findmejob',
};

export const dynamic = 'force-dynamic';

function relativeTime(iso: string | null): string {
  if (!iso) return 'never';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return 'in the future';
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function fmtAbs(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

function isStale(iso: string | null): boolean {
  if (!iso) return true;
  return Date.now() - new Date(iso).getTime() > 36 * 60 * 60 * 1000;
}

export default async function AdminPipelinePage() {
  await requireAdmin();
  const p = await getPipelineHealth();

  const sourceRows = Object.entries(p.jobs_by_source).sort((a, b) => b[1] - a[1]);
  const regionRows = Object.entries(p.jobs_by_region).sort((a, b) => b[1] - a[1]);
  const topRoleFamilies = p.jobs_by_role_family.slice(0, 10);
  const feedbackRows = Object.entries(p.feedback_by_status).sort((a, b) => b[1] - a[1]);

  const cronStale = isStale(p.cron_last_run_at);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Admin</span>
        <h1 className="text-3xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Cron + ingest health. Daily ingest runs at 06:00 IST.
        </p>
      </div>

      {/* Cron status */}
      <Card className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Cron · last job seen
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-mono text-2xl font-semibold tabular-nums">
            {relativeTime(p.cron_last_run_at)}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {fmtAbs(p.cron_last_run_at)}
          </span>
          {cronStale ? (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/[0.08] px-2 py-0.5 font-mono text-[10px] uppercase text-amber-200/90">
              stale
            </span>
          ) : (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-200/90">
              fresh
            </span>
          )}
        </div>
      </Card>

      {/* Classifier coverage */}
      <Card className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Classifier coverage
          </span>
          <span className="text-xs text-muted-foreground">
            % of jobs with a non-null `role_family`. Backfill + per-ingest classifier should
            keep this near 100%.
          </span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-3xl font-semibold tabular-nums">
            {p.classifier_coverage_pct}%
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {p.jobs_total} total jobs
          </span>
        </div>
      </Card>

      {/* Jobs by source */}
      <Card className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Jobs by source
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sourceRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No jobs ingested.
                </TableCell>
              </TableRow>
            ) : (
              sourceRows.map(([source, count]) => (
                <TableRow key={source}>
                  <TableCell className="font-mono text-xs">{source}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Jobs by region */}
      <Card className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Jobs by region
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regionRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No regions tagged yet.
                </TableCell>
              </TableRow>
            ) : (
              regionRows.map(([region, count]) => (
                <TableRow key={region}>
                  <TableCell className="font-mono text-xs">{region}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Jobs by role family — top 10 */}
      <Card className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Jobs by role family · top 10
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role family</TableHead>
              <TableHead className="text-right">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topRoleFamilies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No classified jobs yet.
                </TableCell>
              </TableRow>
            ) : (
              topRoleFamilies.map((rf) => (
                <TableRow key={rf.role_family}>
                  <TableCell className="font-mono text-xs">{rf.role_family}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{rf.count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Feedback by status */}
      <Card className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Feedback by status
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbackRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No feedback yet.
                </TableCell>
              </TableRow>
            ) : (
              feedbackRows.map(([status, count]) => (
                <TableRow key={status}>
                  <TableCell className="font-mono text-xs uppercase">{status}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
