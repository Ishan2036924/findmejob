'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchJobs } from './jsearch';
import { runMatchScore } from '@/lib/ai/agents/match-score-agent';
import type { Profile, RoleFamily, Seniority } from '@/lib/ai/schemas/profile';

const SCORING_CONCURRENCY = 5;

export type RefreshFeedResult =
  | { ok: true; ingested: number; scored: number }
  | { ok: false; error: string };

const QUERIES_BY_ROLE: Record<RoleFamily, string> = {
  swe: 'software engineer india',
  data_ml: 'machine learning engineer india',
  product: 'product manager india',
  design: 'product designer india',
  devops: 'devops engineer india',
  sales: 'sales manager india',
  marketing: 'marketing manager india',
  ops: 'operations manager india',
  other: 'engineer india',
};

/**
 * One-click feed refresh:
 *   1. Fetch jobs from JSearch (or mock fallback)
 *   2. Upsert into the jobs table via service-role
 *   3. Score every unscored job for the current user (parallel, batched)
 *   4. Insert match_scores
 *   5. Revalidate /jobs
 */
export async function refreshFeed(): Promise<RefreshFeedResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile?.target_role_family || !profile?.target_seniority || !profile?.resume_json) {
    return { ok: false, error: 'Complete onboarding first.' };
  }

  const admin = createAdminClient();

  // 1. Fetch + upsert jobs
  let ingested = 0;
  try {
    const query = QUERIES_BY_ROLE[profile.target_role_family as RoleFamily] ?? 'engineer india';
    const raw = await fetchJobs({ query });

    if (raw.length > 0) {
      const rows = raw.map((j) => ({
        source: j.source,
        source_id: j.source_id,
        source_url: j.source_url,
        title: j.title,
        company: j.company,
        location: j.location,
        description: j.description,
        posted_at: j.posted_at,
        last_seen_at: new Date().toISOString(),
      }));
      const { error } = await admin
        .from('jobs')
        .upsert(rows, { onConflict: 'source,source_id', ignoreDuplicates: false });
      if (error) {
        console.error('[refreshFeed] upsert jobs failed', { error });
        return { ok: false, error: `Job ingestion failed: ${error.message}` };
      }
      ingested = raw.length;
    }
  } catch (err) {
    console.error('[refreshFeed] fetchJobs threw', { err });
    return {
      ok: false,
      error: `Job source error: ${err instanceof Error ? err.message : 'unknown'}`,
    };
  }

  // 2. Find unscored jobs for this user
  const { data: allJobs } = await admin
    .from('jobs')
    .select('id, title, company, description')
    .order('posted_at', { ascending: false, nullsFirst: false })
    .limit(50);

  const { data: existingScores } = await admin
    .from('match_scores')
    .select('job_id')
    .eq('profile_id', user.id);

  const scoredIds = new Set(existingScores?.map((s) => s.job_id) ?? []);
  const unscored = (allJobs ?? []).filter((j) => !scoredIds.has(j.id));

  // 3. Score in parallel batches
  const profileForAgent: Profile = {
    target_role_family: profile.target_role_family as RoleFamily,
    target_seniority: profile.target_seniority as Seniority,
    target_location: profile.target_location ?? 'Delhi NCR',
    resume_json: profile.resume_json,
    linkedin_paste: profile.linkedin_paste ?? null,
    portfolio_urls: profile.portfolio_urls ?? [],
  };

  let scored = 0;
  for (let i = 0; i < unscored.length; i += SCORING_CONCURRENCY) {
    const batch = unscored.slice(i, i + SCORING_CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (job) => {
        const r = await runMatchScore({
          profile: profileForAgent,
          job: { title: job.title, company: job.company, description: job.description },
        });
        return { jobId: job.id, score: r };
      }),
    );

    const inserts = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => {
        const { jobId, score } = (r as PromiseFulfilledResult<{ jobId: string; score: { output: { score: number; reasoning: string; gaps: string[]; strengths: string[] }; model: string } }>).value;
        return {
          profile_id: user.id,
          job_id: jobId,
          score: Math.round(Math.max(0, Math.min(100, score.output.score))),
          reasoning: score.output.reasoning,
          gaps: score.output.gaps,
          strengths: score.output.strengths,
          model: score.model,
        };
      });

    if (inserts.length > 0) {
      const { error } = await admin
        .from('match_scores')
        .upsert(inserts, { onConflict: 'profile_id,job_id' });
      if (error) {
        console.error('[refreshFeed] insert match_scores failed', { error });
      } else {
        scored += inserts.length;
      }
    }

    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      console.error('[refreshFeed] some scoring calls failed', {
        count: failures.length,
        firstError: (failures[0] as PromiseRejectedResult).reason,
      });
    }
  }

  revalidatePath('/jobs');
  return { ok: true, ingested, scored };
}
