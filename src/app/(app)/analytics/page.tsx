import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, BarChart3, Clock } from 'lucide-react';
import {
  getApplicationsTimeSeries,
  getByCompanyType,
  getByMatchScoreBucket,
  getNoResponseApplications,
  getPipelineFunnel,
  getResponseRate,
  getTopCompanies,
} from '@/lib/applications/analytics';
import { COMPANY_TYPE_LABELS, type CompanyType } from '@/lib/ai/agents/company-classifier';
import { getCurrentUserProfile, isOnboardingComplete } from '@/lib/profile/queries';
import { FunnelChart } from './funnel-chart';
import { TimeSeriesChart } from './timeseries-chart';
import { BucketChart } from './bucket-chart';
import { CompanyTypeChart } from './company-type-chart';

export const metadata = { title: 'Analytics · findmejob' };

export default async function AnalyticsPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');
  if (!isOnboardingComplete(profile)) redirect('/onboarding');

  const [funnel, timeseries, response, byType, byBucket, topCompanies, noResponse] =
    await Promise.all([
      getPipelineFunnel(),
      getApplicationsTimeSeries({ days: 60 }),
      getResponseRate(),
      getByCompanyType(),
      getByMatchScoreBucket(),
      getTopCompanies(8),
      getNoResponseApplications(14),
    ]);

  const empty = funnel.total === 0;

  if (empty) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-10 sm:py-12">
        <PageHeader />
        <div className="rounded-2xl border border-dashed border-white/10 bg-card/30 p-10 text-center backdrop-blur">
          <BarChart3 className="mx-auto size-6 text-muted-foreground/60" strokeWidth={1.5} />
          <p className="mt-4 text-sm text-muted-foreground">
            No applications yet. Save jobs from the{' '}
            <Link href="/jobs" className="text-foreground underline-offset-4 hover:underline">
              feed
            </Link>{' '}
            or paste any job link to start tracking — analytics light up here automatically.
          </p>
        </div>
      </main>
    );
  }

  const companyTypeData = byType.map((row) => ({
    label: row.company_type
      ? COMPANY_TYPE_LABELS[row.company_type as CompanyType] ?? row.company_type
      : 'Unclassified',
    count: row.count,
    avg_score: row.avg_score,
  }));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-10 sm:py-12">
      <PageHeader />

      {/* Top stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={funnel.total} />
        <StatCard
          label="Applied"
          value={funnel.applied + funnel.interview + funnel.offer + funnel.rejected}
        />
        <StatCard label="Interview" value={funnel.interview + funnel.offer} />
        <StatCard label="Offer" value={funnel.offer} accent="emerald" />
      </div>

      {/* Pipeline funnel */}
      <Card>
        <CardHeader
          title="Pipeline"
          subtitle="Conversion through each stage of your job search."
        />
        <FunnelChart
          saved={funnel.saved + funnel.applied + funnel.interview + funnel.offer + funnel.rejected}
          applied={funnel.applied + funnel.interview + funnel.offer + funnel.rejected}
          interview={funnel.interview + funnel.offer}
          offer={funnel.offer}
        />
        <ResponseRateRow response={response} />
      </Card>

      {/* Applications over time */}
      <Card>
        <CardHeader title="Applications over time" subtitle="Last 60 days, weekly buckets." />
        <TimeSeriesChart data={timeseries} />
      </Card>

      {/* Match score buckets + company type */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Match score distribution"
            subtitle="How well-matched are the jobs you've engaged with?"
          />
          <BucketChart data={byBucket} />
        </Card>
        <Card>
          <CardHeader
            title="By company type"
            subtitle="Volume + avg match score across employer categories."
          />
          {companyTypeData.length === 0 ? (
            <EmptyHint text="Classifications populate within seconds of saving an application." />
          ) : (
            <CompanyTypeChart data={companyTypeData} />
          )}
        </Card>
      </div>

      {/* Top companies */}
      <Card>
        <CardHeader title="Top companies" subtitle="Where your applications cluster." />
        {topCompanies.length === 0 ? (
          <EmptyHint text="No companies tracked yet." />
        ) : (
          <ul className="flex flex-col divide-y divide-white/5">
            {topCompanies.map((c) => (
              <li
                key={c.company}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <span className="truncate font-medium text-foreground">{c.company}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <MiniPill label="Applied" count={c.statuses.applied} color="text-sky-300" />
                  <MiniPill
                    label="Interview"
                    count={c.statuses.interview}
                    color="text-amber-300"
                  />
                  <MiniPill label="Offer" count={c.statuses.offer} color="text-emerald-300" />
                  <MiniPill
                    label="Rejected"
                    count={c.statuses.rejected}
                    color="text-rose-300"
                  />
                  <span className="ml-2 font-mono tabular-nums text-foreground/70">
                    {c.count}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* No response yet */}
      <Card>
        <CardHeader
          title="No response yet"
          subtitle="Applications submitted >14 days ago without a status change."
        />
        {noResponse.length === 0 ? (
          <EmptyHint text="Nothing stale. You're caught up." />
        ) : (
          <ul className="flex flex-col divide-y divide-white/5">
            {noResponse.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/applications/${row.id}`}
                  className="group flex items-center justify-between gap-4 py-3 text-sm transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-medium text-foreground">{row.title}</span>
                    <span className="truncate text-xs text-muted-foreground">{row.company}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" strokeWidth={1.5} />
                      {row.days_since}d ago
                    </span>
                    <ArrowUpRight
                      className="size-4 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      strokeWidth={1.5}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}

// -----------------------------------------------------------------------
// Local UI helpers
// -----------------------------------------------------------------------

function PageHeader() {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        Application analytics
      </span>
      <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        Where the search stands
      </h1>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Pipeline conversion, match-score distribution, employer mix, and stale follow-ups —
        derived from your applications log.
      </p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-card/40 p-4 backdrop-blur sm:p-6">
      {children}
    </section>
  );
}

function CardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex flex-col gap-1">
      <h2 className="text-base font-medium tracking-tight">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: 'emerald';
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card/40 p-4 backdrop-blur sm:p-5">
      <div
        className={
          accent === 'emerald'
            ? 'font-mono text-3xl font-semibold tracking-tight tabular-nums text-emerald-300'
            : 'font-mono text-3xl font-semibold tracking-tight tabular-nums text-foreground'
        }
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function ResponseRateRow({
  response,
}: {
  response: Awaited<ReturnType<typeof getResponseRate>>;
}) {
  if (response.applied === 0) return null;
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return (
    <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/5 pt-4 text-xs">
      <ResponseStat label="Response rate" value={pct(response.responseRate)} />
      <ResponseStat label="Interview rate" value={pct(response.interviewRate)} />
      <ResponseStat label="Offer rate" value={pct(response.offerRate)} />
    </div>
  );
}

function ResponseStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-lg tabular-nums text-foreground">{value}</span>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

function MiniPill({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`font-mono tabular-nums ${color}`}>{count}</span>
      <span className="opacity-60">{label}</span>
    </span>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="py-6 text-center text-xs text-muted-foreground">{text}</p>;
}
