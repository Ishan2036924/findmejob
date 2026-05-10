import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { ResumeJson, RoleFamily } from '@/lib/ai/schemas/profile';
import { userRegion } from './region';
import { familiesForUser } from './role-adjacency';

export type FeedJob = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string;
  posted_at: string | null;
  source: string;
  source_url: string;
  match: {
    score: number;
    reasoning: string;
    gaps: string[];
    strengths: string[];
  } | null;
  application_id: string | null; // non-null = already saved by current user
};

export type FeedResult = {
  jobs: FeedJob[];
  unscored: number;
  hasJobs: boolean;
  profileReady: boolean;
  lastSeenAt: string | null;
};

export async function getFeed(): Promise<FeedResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { jobs: [], unscored: 0, hasJobs: false, profileReady: false, lastSeenAt: null };

  // Profile readiness check — match scoring needs target_role_family + resume_json
  const { data: profile } = await supabase
    .from('profiles')
    .select('target_role_family, target_seniority, target_location, resume_json')
    .eq('id', user.id)
    .single();

  const profileReady =
    !!profile?.target_role_family && !!profile?.target_seniority && !!profile?.resume_json;

  // Region filter: a Delhi NCR user shouldn't see California-only roles.
  // 'other' = no filter (e.g. user typed "Remote" or left it blank).
  // Otherwise show region ∪ 'remote' (truly remote postings are universal).
  const region = userRegion(profile?.target_location);

  // Role-family filter: an AI/ML engineer shouldn't see Sales / Marketing
  // jobs even if they live in the same region. familiesForUser includes the
  // user's family + a small adjacency map + 'other' (unclassified, surface anyway).
  const families = familiesForUser(profile?.target_role_family as RoleFamily | null);

  // Overfetch when filtering — the dedup pass below will collapse cross-source
  // duplicates, and we want enough candidates left after collapse for a full
  // page. 50 → 80 keeps the upper bound bounded.
  const FETCH_LIMIT = 80;

  let jobsQuery = supabase
    .from('jobs')
    .select(
      'id, title, company, location, description, posted_at, source, source_url, region, role_family',
    )
    .order('posted_at', { ascending: false, nullsFirst: false })
    .limit(FETCH_LIMIT);
  if (region !== 'other') {
    jobsQuery = jobsQuery.in('region', [region, 'remote']);
  }
  if (families.length > 0) {
    jobsQuery = jobsQuery.in('role_family', families);
  }
  const { data: jobsRawAll } = await jobsQuery;

  // Cross-source dedup: same Razorpay SWE role might come from JSearch AND
  // Greenhouse. Collapse by (lower(company) | lower(title prefix)). Keep the
  // best (highest match → most recent → first) per group.
  const dedupKey = (j: { company: string; title: string }) =>
    `${j.company.trim().toLowerCase()}|${j.title.trim().toLowerCase().substring(0, 60)}`;

  // We need scores BEFORE dedup so we can prefer the higher-scored variant.
  // Cheap because we still have the bounded fetch from above; prescore lookup.
  const { data: prescores } = jobsRawAll && jobsRawAll.length > 0
    ? await supabase
        .from('match_scores')
        .select('job_id, score')
        .eq('profile_id', user.id)
        .in('job_id', jobsRawAll.map((j) => j.id))
    : { data: null };
  const prescoreMap = new Map(prescores?.map((s) => [s.job_id, s.score as number]) ?? []);

  const groupBest = new Map<string, NonNullable<typeof jobsRawAll>[number]>();
  for (const j of jobsRawAll ?? []) {
    const k = dedupKey(j);
    const existing = groupBest.get(k);
    if (!existing) {
      groupBest.set(k, j);
      continue;
    }
    const newScore = prescoreMap.get(j.id) ?? -1;
    const existingScore = prescoreMap.get(existing.id) ?? -1;
    if (newScore !== existingScore) {
      if (newScore > existingScore) groupBest.set(k, j);
      continue;
    }
    // Tie on scores → most recent posted_at wins.
    const newDate = j.posted_at ? new Date(j.posted_at).getTime() : 0;
    const exDate = existing.posted_at ? new Date(existing.posted_at).getTime() : 0;
    if (newDate > exDate) groupBest.set(k, j);
  }
  const jobsRaw = Array.from(groupBest.values()).slice(0, 50);

  // Most-recent ingest timestamp across the whole table — surfaced in the
  // feed header as a "last refreshed" hint.
  const { data: latest } = await supabase
    .from('jobs')
    .select('last_seen_at')
    .order('last_seen_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const lastSeenAt = latest?.last_seen_at ?? null;

  if (!jobsRaw || jobsRaw.length === 0) {
    return { jobs: [], unscored: 0, hasJobs: false, profileReady, lastSeenAt };
  }

  const { data: scores } = await supabase
    .from('match_scores')
    .select('job_id, score, reasoning, gaps, strengths')
    .eq('profile_id', user.id);

  const scoreMap = new Map(scores?.map((s) => [s.job_id, s]) ?? []);

  const { data: applications } = await supabase
    .from('applications')
    .select('id, job_id')
    .eq('profile_id', user.id);

  const appMap = new Map(applications?.map((a) => [a.job_id, a.id]) ?? []);

  const jobs: FeedJob[] = jobsRaw.map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    description: j.description,
    posted_at: j.posted_at,
    source: j.source,
    source_url: j.source_url,
    match: scoreMap.get(j.id)
      ? {
          score: scoreMap.get(j.id)!.score,
          reasoning: scoreMap.get(j.id)!.reasoning,
          gaps: scoreMap.get(j.id)!.gaps,
          strengths: scoreMap.get(j.id)!.strengths,
        }
      : null,
    application_id: appMap.get(j.id) ?? null,
  }));

  // Sort: freshness-weighted match score, then scored-over-unscored, then recency.
  // Decay: lose 1 point per 3 days posted age, capped at -10. Gently demotes
  // 30+ day old high-match jobs in favor of recent 75-match ones the user
  // might still actually apply to.
  function effectiveScore(j: FeedJob): number {
    const base = j.match?.score ?? 0;
    if (!j.posted_at) return base;
    const ageDays = (Date.now() - new Date(j.posted_at).getTime()) / 86400_000;
    const freshnessPenalty = Math.min(10, Math.max(0, Math.floor(ageDays / 3)));
    return base - freshnessPenalty;
  }

  jobs.sort((a, b) => {
    const sa = effectiveScore(a);
    const sb = effectiveScore(b);
    if (sb !== sa) return sb - sa;
    if (a.match && !b.match) return -1;
    if (!a.match && b.match) return 1;
    const aDate = a.posted_at ? new Date(a.posted_at).getTime() : 0;
    const bDate = b.posted_at ? new Date(b.posted_at).getTime() : 0;
    return bDate - aDate;
  });

  return {
    jobs,
    unscored: jobs.filter((j) => !j.match).length,
    hasJobs: true,
    profileReady,
    lastSeenAt,
  };
}

// Used internally by the match-scoring server action; export for type-narrowing
export type ScoreableProfile = {
  target_role_family: string;
  target_seniority: string;
  target_location: string;
  resume_json: ResumeJson;
  linkedin_paste: string | null;
  portfolio_urls: string[];
};
