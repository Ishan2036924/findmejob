import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { ResumeJson } from '@/lib/ai/schemas/profile';

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
};

export type FeedResult = {
  jobs: FeedJob[];
  unscored: number;
  hasJobs: boolean;
  profileReady: boolean;
};

export async function getFeed(): Promise<FeedResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { jobs: [], unscored: 0, hasJobs: false, profileReady: false };

  // Profile readiness check — match scoring needs target_role_family + resume_json
  const { data: profile } = await supabase
    .from('profiles')
    .select('target_role_family, target_seniority, resume_json')
    .eq('id', user.id)
    .single();

  const profileReady =
    !!profile?.target_role_family && !!profile?.target_seniority && !!profile?.resume_json;

  const { data: jobsRaw } = await supabase
    .from('jobs')
    .select('id, title, company, location, description, posted_at, source, source_url')
    .order('posted_at', { ascending: false, nullsFirst: false })
    .limit(50);

  if (!jobsRaw || jobsRaw.length === 0) {
    return { jobs: [], unscored: 0, hasJobs: false, profileReady };
  }

  const { data: scores } = await supabase
    .from('match_scores')
    .select('job_id, score, reasoning, gaps, strengths')
    .eq('profile_id', user.id);

  const scoreMap = new Map(scores?.map((s) => [s.job_id, s]) ?? []);

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
  }));

  // Sort: scored (highest first) → unscored (most recent first)
  jobs.sort((a, b) => {
    if (a.match && b.match) return b.match.score - a.match.score;
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
