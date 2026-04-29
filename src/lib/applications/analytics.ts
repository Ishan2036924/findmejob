import 'server-only';
import { createClient } from '@/lib/supabase/server';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type PipelineFunnel = {
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  withdrawn: number;
  total: number;
};

export type TimeSeriesPoint = { date: string; count: number };

export type ResponseRate = {
  applied: number;
  responded: number;
  interviews: number;
  offers: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
};

export type CompanyTypeBucket = {
  company_type: string | null;
  count: number;
  avg_score: number | null;
};

export type MatchScoreBucket = { bucket: string; count: number };

export type TopCompany = {
  company: string;
  count: number;
  statuses: {
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  };
};

export type NoResponseApplication = {
  id: string;
  title: string;
  company: string;
  applied_at: string;
  days_since: number;
};

// -----------------------------------------------------------------------
// Internal helpers
// -----------------------------------------------------------------------

type StatusKey =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

async function authedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

function dayKey(iso: string): string {
  // YYYY-MM-DD in UTC. Good enough for last-60-days bucketing.
  return iso.slice(0, 10);
}

// -----------------------------------------------------------------------
// 1. Pipeline funnel
// -----------------------------------------------------------------------

export async function getPipelineFunnel(): Promise<PipelineFunnel> {
  const empty: PipelineFunnel = {
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0,
    total: 0,
  };

  const { supabase, userId } = await authedClient();
  if (!userId) return empty;

  const { data } = await supabase
    .from('applications')
    .select('status')
    .eq('profile_id', userId);

  if (!data) return empty;

  const counts = { ...empty };
  for (const row of data) {
    const s = row.status as StatusKey;
    if (s in counts) counts[s] += 1;
  }
  counts.total = data.length;
  return counts;
}

// -----------------------------------------------------------------------
// 2. Applications time series (last N days, default 60)
// -----------------------------------------------------------------------

export async function getApplicationsTimeSeries(
  opts?: { days?: number },
): Promise<TimeSeriesPoint[]> {
  const days = opts?.days ?? 60;
  const { supabase, userId } = await authedClient();
  if (!userId) return [];

  const since = new Date(Date.now() - days * 86400_000);

  const { data } = await supabase
    .from('applications')
    .select('created_at')
    .eq('profile_id', userId)
    .gte('created_at', since.toISOString());

  const byDay = new Map<string, number>();
  // Seed every day in range with 0 so the chart is contiguous.
  for (let i = 0; i < days; i += 1) {
    const d = new Date(Date.now() - i * 86400_000);
    byDay.set(dayKey(d.toISOString()), 0);
  }
  for (const row of data ?? []) {
    const k = dayKey(row.created_at as string);
    if (byDay.has(k)) byDay.set(k, (byDay.get(k) ?? 0) + 1);
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, count]) => ({ date, count }));
}

// -----------------------------------------------------------------------
// 3. Response rate
// -----------------------------------------------------------------------

export async function getResponseRate(): Promise<ResponseRate> {
  const empty: ResponseRate = {
    applied: 0,
    responded: 0,
    interviews: 0,
    offers: 0,
    responseRate: 0,
    interviewRate: 0,
    offerRate: 0,
  };

  const { supabase, userId } = await authedClient();
  if (!userId) return empty;

  // "applied" denominator = anyone who got past saved.
  const { data } = await supabase
    .from('applications')
    .select('status')
    .eq('profile_id', userId)
    .neq('status', 'saved');

  if (!data || data.length === 0) return empty;

  let applied = 0;
  let interviews = 0;
  let offers = 0;
  let rejected = 0;
  for (const row of data) {
    applied += 1;
    if (row.status === 'interview') interviews += 1;
    else if (row.status === 'offer') offers += 1;
    else if (row.status === 'rejected') rejected += 1;
  }

  const responded = interviews + offers + rejected;
  return {
    applied,
    responded,
    interviews,
    offers,
    responseRate: applied === 0 ? 0 : responded / applied,
    interviewRate: applied === 0 ? 0 : interviews / applied,
    offerRate: applied === 0 ? 0 : offers / applied,
  };
}

// -----------------------------------------------------------------------
// 4. By company type (count + avg match score)
// -----------------------------------------------------------------------

export async function getByCompanyType(): Promise<CompanyTypeBucket[]> {
  const { supabase, userId } = await authedClient();
  if (!userId) return [];

  const { data: apps } = await supabase
    .from('applications')
    .select('company_type, job_id')
    .eq('profile_id', userId);

  if (!apps || apps.length === 0) return [];

  const jobIds = apps.map((a) => a.job_id as string);
  const { data: scores } = await supabase
    .from('match_scores')
    .select('job_id, score')
    .eq('profile_id', userId)
    .in('job_id', jobIds);

  const scoreByJob = new Map<string, number>();
  for (const s of scores ?? []) {
    scoreByJob.set(s.job_id as string, s.score as number);
  }

  type Bucket = { count: number; sum: number; scored: number };
  const byType = new Map<string | null, Bucket>();

  for (const row of apps) {
    const key = (row.company_type as string | null) ?? null;
    const bucket = byType.get(key) ?? { count: 0, sum: 0, scored: 0 };
    bucket.count += 1;
    const score = scoreByJob.get(row.job_id as string);
    if (typeof score === 'number') {
      bucket.sum += score;
      bucket.scored += 1;
    }
    byType.set(key, bucket);
  }

  return Array.from(byType.entries())
    .map(([company_type, b]) => ({
      company_type,
      count: b.count,
      avg_score: b.scored === 0 ? null : Math.round(b.sum / b.scored),
    }))
    .sort((a, z) => z.count - a.count);
}

// -----------------------------------------------------------------------
// 5. Match score buckets
// -----------------------------------------------------------------------

export async function getByMatchScoreBucket(): Promise<MatchScoreBucket[]> {
  const buckets = [
    { bucket: '<50', count: 0 },
    { bucket: '50-69', count: 0 },
    { bucket: '70-84', count: 0 },
    { bucket: '85+', count: 0 },
  ];

  const { supabase, userId } = await authedClient();
  if (!userId) return buckets;

  const { data: apps } = await supabase
    .from('applications')
    .select('job_id')
    .eq('profile_id', userId);

  if (!apps || apps.length === 0) return buckets;

  const jobIds = apps.map((a) => a.job_id as string);
  const { data: scores } = await supabase
    .from('match_scores')
    .select('job_id, score')
    .eq('profile_id', userId)
    .in('job_id', jobIds);

  for (const s of scores ?? []) {
    const score = s.score as number;
    if (score < 50) buckets[0].count += 1;
    else if (score < 70) buckets[1].count += 1;
    else if (score < 85) buckets[2].count += 1;
    else buckets[3].count += 1;
  }

  return buckets;
}

// -----------------------------------------------------------------------
// 6. Top companies
// -----------------------------------------------------------------------

export async function getTopCompanies(limit?: number): Promise<TopCompany[]> {
  const cap = limit ?? 8;
  const { supabase, userId } = await authedClient();
  if (!userId) return [];

  const { data } = await supabase
    .from('applications')
    .select('status, job:jobs (company)')
    .eq('profile_id', userId);

  if (!data || data.length === 0) return [];

  const byCompany = new Map<string, TopCompany>();
  for (const row of data) {
    const job = row.job as unknown as { company: string } | null;
    if (!job?.company) continue;
    const entry =
      byCompany.get(job.company) ??
      ({
        company: job.company,
        count: 0,
        statuses: { applied: 0, interview: 0, offer: 0, rejected: 0 },
      } satisfies TopCompany);
    entry.count += 1;
    const s = row.status as StatusKey;
    if (s === 'applied' || s === 'interview' || s === 'offer' || s === 'rejected') {
      entry.statuses[s] += 1;
    }
    byCompany.set(job.company, entry);
  }

  return Array.from(byCompany.values())
    .sort((a, z) => z.count - a.count)
    .slice(0, cap);
}

// -----------------------------------------------------------------------
// 7. No-response applications (stale "applied")
// -----------------------------------------------------------------------

export async function getNoResponseApplications(
  daysSinceApplied?: number,
): Promise<NoResponseApplication[]> {
  const threshold = daysSinceApplied ?? 14;
  const { supabase, userId } = await authedClient();
  if (!userId) return [];

  const cutoff = new Date(Date.now() - threshold * 86400_000).toISOString();

  const { data } = await supabase
    .from('applications')
    .select('id, applied_at, job:jobs (title, company)')
    .eq('profile_id', userId)
    .eq('status', 'applied')
    .not('applied_at', 'is', null)
    .lt('applied_at', cutoff)
    .order('applied_at', { ascending: true });

  if (!data) return [];

  const now = Date.now();
  return data
    .map((row) => {
      const job = row.job as unknown as { title: string; company: string } | null;
      const appliedAt = row.applied_at as string | null;
      if (!job || !appliedAt) return null;
      const days = Math.floor((now - new Date(appliedAt).getTime()) / 86400_000);
      return {
        id: row.id as string,
        title: job.title,
        company: job.company,
        applied_at: appliedAt,
        days_since: days,
      } satisfies NoResponseApplication;
    })
    .filter((row): row is NoResponseApplication => row !== null);
}
