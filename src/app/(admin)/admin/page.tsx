import { requireAdmin } from '@/lib/admin/auth';
import { getOverviewMetrics } from '@/lib/admin/queries';
import { MetricStat } from '@/components/ui-kit';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  ClipboardList,
  Inbox,
  MessageCircle,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';

export const metadata = {
  title: 'Overview · admin · findmejob',
};

export const dynamic = 'force-dynamic';

const STATUS_ORDER = ['saved', 'applied', 'interview', 'offer', 'rejected', 'withdrawn'];

function formatMs(ms: number): string {
  if (ms <= 0) return '—';
  if (ms >= 10_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export default async function AdminOverviewPage() {
  await requireAdmin();
  const m = await getOverviewMetrics();

  const allStatuses = Array.from(
    new Set([...STATUS_ORDER, ...Object.keys(m.applications_by_status)]),
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Admin</span>
        <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Live snapshot. Counts reset at UTC midnight; chat latency derives from today&apos;s
          assistant turns.
        </p>
      </div>

      {/* Top row — top-of-funnel + activity */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricStat
          label="Total users"
          value={m.total_users}
          icon={Users}
          hint={`${m.fully_onboarded} onboarded`}
        />
        <MetricStat
          label="Signups · today"
          value={m.signups_today}
          icon={UserPlus}
          accent="indigo"
          hint={`${m.signups_7d} in last 7d`}
        />
        <MetricStat
          label="Active today"
          value={m.active_users_today}
          icon={Activity}
          accent="emerald"
          hint="users w/ chat msg today"
        />
        <MetricStat
          label="Open feedback"
          value={m.feedback_open}
          icon={Inbox}
          accent={m.feedback_open > 0 ? 'amber' : 'default'}
          href="/admin/feedback"
        />
      </section>

      {/* Second row — usage volume */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricStat
          label="Chat turns · today"
          value={m.chat_turns_today}
          icon={MessageCircle}
          hint="assistant messages"
        />
        <MetricStat
          label="Artifacts · today"
          value={m.artifacts_today}
          icon={Sparkles}
          hint="generations created"
        />
        <MetricStat
          label="Applications · total"
          value={m.applications_total}
          icon={ClipboardList}
        />
      </section>

      {/* Chat latency card */}
      <Card className="px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Chat latency · today
            </span>
            <span className="text-xs text-muted-foreground">
              Time between consecutive user → assistant message in the same thread.
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="median" value={formatMs(m.median_chat_latency_ms_today)} />
          <Stat label="p95" value={formatMs(m.p95_chat_latency_ms_today)} />
          <Stat label="turns measured" value={String(m.chat_turns_today)} />
        </div>
      </Card>

      {/* Applications funnel */}
      <Card className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Applications funnel
          </span>
          <span className="text-xs text-muted-foreground">All-time, all users.</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Count</TableHead>
              <TableHead className="text-right">% of total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allStatuses.map((s) => {
              const count = m.applications_by_status[s] ?? 0;
              const pct =
                m.applications_total > 0
                  ? Math.round((count / m.applications_total) * 100)
                  : 0;
              return (
                <TableRow key={s}>
                  <TableCell className="font-mono text-xs uppercase">{s}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{count}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                    {pct}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-2xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}
