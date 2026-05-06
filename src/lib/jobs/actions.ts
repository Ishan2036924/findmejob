'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ingestJobs } from './ingest';
import { runMatchScore } from '@/lib/ai/agents/match-score-agent';
import type { Profile, RoleFamily, Seniority } from '@/lib/ai/schemas/profile';
import { checkRefreshRateLimit } from '@/lib/guardrails/rate-limit';
import { userRegion } from './region';

const SCORING_CONCURRENCY = 5;
const FRESH_INGEST_WINDOW_MS = 6 * 60 * 60 * 1000; // 6h

export type RefreshFeedResult =
  | { ok: true; ingested: number; scored: number }
  | { ok: false; error: string; reason?: string };

/**
 * One-click feed refresh from the user's perspective:
 *   1. If the most recent job in the table is older than ~6h, run a full
 *      multi-source ingest (cron normally handles this daily; manual fallback).
 *   2. Score every unscored job for the current user (parallel, batched).
 *   3. Revalidate /jobs.
 *
 * Decoupled from the daily cron at /api/cron/ingest-jobs which is the
 * primary ingest path system-wide.
 */
export async function refreshFeedForCurrentUser(): Promise<RefreshFeedResult> {
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

  // Daily refresh cap (default 1/day). Cron handles the nightly pull at 06:00
  // IST; this button is for users who want one extra manual pull.
  const rateLimit = await checkRefreshRateLimit(user.id);
  if (!rateLimit.ok) {
    return { ok: false, error: rateLimit.message, reason: rateLimit.reason };
  }

  const admin = createAdminClient();

  // 1. Decide whether to run a fresh ingest
  const { data: latestJob } = await admin
    .from('jobs')
    .select('last_seen_at')
    .order('last_seen_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const stale =
    !latestJob ||
    Date.now() - new Date(latestJob.last_seen_at).getTime() > FRESH_INGEST_WINDOW_MS;

  let ingested = 0;
  if (stale) {
    try {
      const result = await ingestJobs();
      ingested = result.totalUpserted;
      if (result.errors.length > 0) {
        console.warn('[refreshFeed] some sources errored', {
          count: result.errors.length,
          first: result.errors[0],
        });
      }
    } catch (err) {
      console.error('[refreshFeed] ingestJobs threw', { err });
      // Non-fatal — proceed with whatever's in the DB.
    }
  }

  // 2. Find unscored jobs for this user — filtered to their region
  const region = userRegion(profile.target_location);
  let allJobsQuery = admin
    .from('jobs')
    .select('id, title, company, description')
    .order('posted_at', { ascending: false, nullsFirst: false })
    .limit(50);
  if (region !== 'other') {
    allJobsQuery = allJobsQuery.in('region', [region, 'remote']);
  }
  const { data: allJobs } = await allJobsQuery;

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
        const { jobId, score } = (
          r as PromiseFulfilledResult<{
            jobId: string;
            score: {
              output: { score: number; reasoning: string; gaps: string[]; strengths: string[] };
              model: string;
            };
          }>
        ).value;
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

/**
 * Back-compat alias. The agent tool layer (Phase 3) and any stale callers may
 * still reference `refreshFeed`. Forwarder so we don't break them while we
 * rename the canonical export.
 */
export async function refreshFeed(): Promise<RefreshFeedResult> {
  return refreshFeedForCurrentUser();
}
