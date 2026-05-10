import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { deriveChatLatencies } from './latency';
import type { RoleFamily, Seniority } from '@/lib/ai/schemas/profile';

const startOfTodayUtc = (): string => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
};

const startOfDaysAgoUtc = (n: number): string => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString();
};

type AdminClient = ReturnType<typeof createAdminClient>;

async function loadEmailMap(admin: AdminClient): Promise<Map<string, string | null>> {
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const map = new Map<string, string | null>();
  for (const u of data?.users ?? []) map.set(u.id, u.email ?? null);
  return map;
}

// ---------------------------------------------------------------------------
// Overview metrics
// ---------------------------------------------------------------------------

export type OverviewMetrics = {
  total_users: number;
  signups_today: number;
  signups_7d: number;
  fully_onboarded: number;
  active_users_today: number;
  applications_total: number;
  applications_by_status: Record<string, number>;
  artifacts_today: number;
  chat_turns_today: number;
  feedback_open: number;
  median_chat_latency_ms_today: number;
  p95_chat_latency_ms_today: number;
};

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  const admin = createAdminClient();
  const today = startOfTodayUtc();
  const last7d = startOfDaysAgoUtc(7);

  const [
    profilesAll,
    profilesToday,
    profiles7d,
    profilesOnboarded,
    appsAll,
    artifactsToday,
    chatTodayCount,
    chatLatencyToday,
    feedbackOpen,
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', today),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', last7d),
    admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .not('latest_assessment_id', 'is', null),
    admin.from('applications').select('status'),
    admin
      .from('generations')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today),
    admin
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'assistant')
      .gte('created_at', today),
    admin
      .from('chat_messages')
      .select('thread_id, profile_id, role, created_at')
      .gte('created_at', today),
    admin.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ]);

  const applications_by_status: Record<string, number> = {};
  for (const a of (appsAll.data ?? []) as { status: string }[]) {
    applications_by_status[a.status] = (applications_by_status[a.status] ?? 0) + 1;
  }

  const activeUserIds = new Set<string>();
  for (const m of (chatLatencyToday.data ?? []) as { profile_id: string }[]) {
    activeUserIds.add(m.profile_id);
  }

  const lat = deriveChatLatencies(
    (chatLatencyToday.data ?? []) as Parameters<typeof deriveChatLatencies>[0],
  );

  return {
    total_users: profilesAll.count ?? 0,
    signups_today: profilesToday.count ?? 0,
    signups_7d: profiles7d.count ?? 0,
    fully_onboarded: profilesOnboarded.count ?? 0,
    active_users_today: activeUserIds.size,
    applications_total: (appsAll.data ?? []).length,
    applications_by_status,
    artifacts_today: artifactsToday.count ?? 0,
    chat_turns_today: chatTodayCount.count ?? 0,
    feedback_open: feedbackOpen.count ?? 0,
    median_chat_latency_ms_today: lat.median_ms,
    p95_chat_latency_ms_today: lat.p95_ms,
  };
}

// ---------------------------------------------------------------------------
// User list
// ---------------------------------------------------------------------------

export type AdminUserRow = {
  profile_id: string;
  email: string | null;
  display_name: string | null;
  target_role_family: RoleFamily | null;
  target_seniority: Seniority | null;
  target_location: string | null;
  signup_at: string;
  last_active_at: string | null;
  applications_count: number;
  assessment_score: number | null;
  chat_turns_7d: number;
};

type ProfileSelectRow = {
  id: string;
  display_name: string | null;
  target_role_family: string | null;
  target_seniority: string | null;
  target_location: string | null;
  latest_assessment_id: string | null;
  created_at: string;
};

export async function getUserList(opts?: { limit?: number }): Promise<AdminUserRow[]> {
  const admin = createAdminClient();
  const last7d = startOfDaysAgoUtc(7);
  const limit = Math.max(1, Math.min(500, opts?.limit ?? 100));

  const [profilesRes, emails] = await Promise.all([
    admin
      .from('profiles')
      .select(
        'id, display_name, target_role_family, target_seniority, target_location, latest_assessment_id, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(limit),
    loadEmailMap(admin),
  ]);

  const profiles = (profilesRes.data ?? []) as ProfileSelectRow[];
  const ids = profiles.map((p) => p.id);
  if (ids.length === 0) return [];

  const assessmentIds = profiles
    .map((p) => p.latest_assessment_id)
    .filter((x): x is string => Boolean(x));

  const [appsRes, assessmentsRes, chatRecentRes] = await Promise.all([
    admin.from('applications').select('profile_id').in('profile_id', ids),
    assessmentIds.length > 0
      ? admin
          .from('assessments')
          .select('id, profile_id, overall_score')
          .in('id', assessmentIds)
      : Promise.resolve({ data: [] as { id: string; profile_id: string; overall_score: number }[] }),
    admin
      .from('chat_messages')
      .select('profile_id, created_at')
      .in('profile_id', ids)
      .gte('created_at', last7d),
  ]);

  const appsCountById = new Map<string, number>();
  for (const a of (appsRes.data ?? []) as { profile_id: string }[]) {
    appsCountById.set(a.profile_id, (appsCountById.get(a.profile_id) ?? 0) + 1);
  }

  // Map: assessment.id -> overall_score (because profiles.latest_assessment_id points at assessment row id)
  const scoreByAssessmentId = new Map<string, number>();
  for (const row of (assessmentsRes.data ?? []) as {
    id: string;
    profile_id: string;
    overall_score: number;
  }[]) {
    scoreByAssessmentId.set(row.id, row.overall_score);
  }

  const chatTurnsById = new Map<string, number>();
  const lastActiveById = new Map<string, string>();
  for (const m of (chatRecentRes.data ?? []) as { profile_id: string; created_at: string }[]) {
    chatTurnsById.set(m.profile_id, (chatTurnsById.get(m.profile_id) ?? 0) + 1);
    const prev = lastActiveById.get(m.profile_id);
    if (!prev || m.created_at > prev) lastActiveById.set(m.profile_id, m.created_at);
  }

  return profiles.map<AdminUserRow>((p) => ({
    profile_id: p.id,
    email: emails.get(p.id) ?? null,
    display_name: p.display_name,
    target_role_family: (p.target_role_family as RoleFamily | null) ?? null,
    target_seniority: (p.target_seniority as Seniority | null) ?? null,
    target_location: p.target_location,
    signup_at: p.created_at,
    last_active_at: lastActiveById.get(p.id) ?? null,
    applications_count: appsCountById.get(p.id) ?? 0,
    assessment_score: p.latest_assessment_id
      ? scoreByAssessmentId.get(p.latest_assessment_id) ?? null
      : null,
    chat_turns_7d: chatTurnsById.get(p.id) ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// Pipeline health
// ---------------------------------------------------------------------------

export type PipelineHealth = {
  cron_last_run_at: string | null;
  jobs_total: number;
  jobs_by_source: Record<string, number>;
  jobs_by_region: Record<string, number>;
  jobs_by_role_family: Array<{ role_family: string; count: number }>;
  classifier_coverage_pct: number;
  feedback_by_status: Record<string, number>;
};

export async function getPipelineHealth(): Promise<PipelineHealth> {
  const admin = createAdminClient();

  const [latestRes, jobsAllRes, feedbackAllRes] = await Promise.all([
    admin
      .from('jobs')
      .select('last_seen_at')
      .order('last_seen_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.from('jobs').select('source, region, role_family'),
    admin.from('feedback').select('status'),
  ]);

  type JobRow = { source: string; region: string | null; role_family: string | null };
  const jobs_by_source: Record<string, number> = {};
  const jobs_by_region: Record<string, number> = {};
  const rfCounts = new Map<string, number>();
  let classified = 0;
  let total = 0;
  for (const j of (jobsAllRes.data ?? []) as JobRow[]) {
    total += 1;
    jobs_by_source[j.source] = (jobs_by_source[j.source] ?? 0) + 1;
    jobs_by_region[j.region ?? 'unknown'] = (jobs_by_region[j.region ?? 'unknown'] ?? 0) + 1;
    if (j.role_family) {
      classified += 1;
      rfCounts.set(j.role_family, (rfCounts.get(j.role_family) ?? 0) + 1);
    }
  }
  const jobs_by_role_family = Array.from(rfCounts.entries())
    .map(([role_family, count]) => ({ role_family, count }))
    .sort((a, b) => b.count - a.count);

  const feedback_by_status: Record<string, number> = {};
  for (const f of (feedbackAllRes.data ?? []) as { status: string }[]) {
    feedback_by_status[f.status] = (feedback_by_status[f.status] ?? 0) + 1;
  }

  const latestData = latestRes.data as { last_seen_at: string | null } | null;

  return {
    cron_last_run_at: latestData?.last_seen_at ?? null,
    jobs_total: total,
    jobs_by_source,
    jobs_by_region,
    jobs_by_role_family,
    classifier_coverage_pct: total > 0 ? Math.round((classified / total) * 100) : 0,
    feedback_by_status,
  };
}

// ---------------------------------------------------------------------------
// Recent activity
// ---------------------------------------------------------------------------

export type RecentActivity = {
  recent_chat_prompts: Array<{
    profile_id: string;
    email: string | null;
    content: string;
    created_at: string;
  }>;
  recent_applications: Array<{
    profile_id: string;
    email: string | null;
    title: string;
    company: string;
    status: string;
    updated_at: string;
  }>;
  recent_generations: Array<{
    profile_id: string;
    email: string | null;
    kind: string;
    created_at: string;
  }>;
  recent_signups: Array<{
    profile_id: string;
    email: string | null;
    created_at: string;
  }>;
};

export async function getRecentActivity(): Promise<RecentActivity> {
  const admin = createAdminClient();

  const [promptsRes, appsRes, gensRes, signupsRes, emails] = await Promise.all([
    admin
      .from('chat_messages')
      .select('profile_id, content, created_at')
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(50),
    admin
      .from('applications')
      .select('profile_id, status, updated_at, jobs(title, company)')
      .order('updated_at', { ascending: false })
      .limit(50),
    admin
      .from('generations')
      .select('profile_id, kind, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    admin
      .from('profiles')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    loadEmailMap(admin),
  ]);

  type PromptRow = { profile_id: string; content: string; created_at: string };
  type AppRow = {
    profile_id: string;
    status: string;
    updated_at: string;
    jobs: { title: string | null; company: string | null } | { title: string | null; company: string | null }[] | null;
  };
  type GenRow = { profile_id: string; kind: string; created_at: string };
  type SignupRow = { id: string; created_at: string };

  return {
    recent_chat_prompts: ((promptsRes.data ?? []) as PromptRow[]).map((m) => ({
      profile_id: m.profile_id,
      email: emails.get(m.profile_id) ?? null,
      content: (m.content ?? '').slice(0, 200),
      created_at: m.created_at,
    })),
    recent_applications: ((appsRes.data ?? []) as AppRow[]).map((a) => {
      const j = Array.isArray(a.jobs) ? a.jobs[0] : a.jobs;
      return {
        profile_id: a.profile_id,
        email: emails.get(a.profile_id) ?? null,
        title: j?.title ?? '—',
        company: j?.company ?? '—',
        status: a.status,
        updated_at: a.updated_at,
      };
    }),
    recent_generations: ((gensRes.data ?? []) as GenRow[]).map((g) => ({
      profile_id: g.profile_id,
      email: emails.get(g.profile_id) ?? null,
      kind: g.kind,
      created_at: g.created_at,
    })),
    recent_signups: ((signupsRes.data ?? []) as SignupRow[]).map((p) => ({
      profile_id: p.id,
      email: emails.get(p.id) ?? null,
      created_at: p.created_at,
    })),
  };
}

/**
 * Cheap count of feedback rows with status = 'new'. Used by the admin layout
 * to render a red dot on the Feedback nav tab. Service-role; bypasses RLS.
 *
 * Failure mode: returns 0 on error. Never throws.
 */
export async function getUnreadFeedbackCount(): Promise<number> {
  try {
    const admin = createAdminClient();
    const { count } = await admin
      .from('feedback')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new');
    return count ?? 0;
  } catch (err) {
    console.error('[getUnreadFeedbackCount]', err);
    return 0;
  }
}
