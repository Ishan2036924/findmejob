import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { runMatchScore } from '@/lib/ai/agents/match-score-agent';
import type { Profile, RoleFamily, Seniority } from '@/lib/ai/schemas/profile';
import { userRegion } from './region';
import { familiesForUser } from './role-adjacency';

export type ScoreAllResult = {
  usersScored: number;
  jobsScored: number;
  errors: number;
  capHit: boolean;
};

const PER_USER_JOB_CAP = 30; // newest 30 unscored jobs per user per run
const PER_USER_CONCURRENCY = 5;
const TOTAL_JOB_CAP = 500; // hard ceiling per cron run, defends against runaway

/**
 * System-wide post-ingest scoring. Walks every fully-onboarded profile and
 * scores up to PER_USER_JOB_CAP unscored jobs per user. Bounded by TOTAL_JOB_CAP
 * across the whole run so a sudden user-count spike can't blow the 5-minute
 * Fluid Compute timeout. Uses admin client (service role) since cron has no
 * user session.
 *
 * Idempotent: jobs already scored for a user are skipped via left-join check.
 */
export async function scoreAllUsers(): Promise<ScoreAllResult> {
  const admin = createAdminClient();

  // 1. Fully-onboarded profiles only.
  const { data: profiles, error: profilesErr } = await admin
    .from('profiles')
    .select(
      'id, target_role_family, target_seniority, target_location, resume_json, linkedin_paste, portfolio_urls, latest_assessment_id',
    )
    .not('latest_assessment_id', 'is', null)
    .not('target_role_family', 'is', null)
    .not('resume_json', 'is', null);

  if (profilesErr || !profiles) {
    console.error('[scoreAllUsers] failed to load profiles', { error: profilesErr });
    return { usersScored: 0, jobsScored: 0, errors: 1, capHit: false };
  }

  let usersScored = 0;
  let totalJobsScored = 0;
  let errorCount = 0;
  let capHit = false;

  for (const profile of profiles) {
    if (totalJobsScored >= TOTAL_JOB_CAP) {
      capHit = true;
      console.warn('[scoreAllUsers] hit TOTAL_JOB_CAP, stopping early', {
        usersScored,
        totalJobsScored,
        remainingProfiles: profiles.length - usersScored,
      });
      break;
    }

    if (
      !profile.target_role_family ||
      !profile.target_seniority ||
      !profile.resume_json
    ) {
      continue; // belt + suspenders; query already filters
    }

    // 2. Newest jobs the user hasn't scored yet.
    const { data: existingScores } = await admin
      .from('match_scores')
      .select('job_id')
      .eq('profile_id', profile.id);
    const scoredIds = new Set(existingScores?.map((s) => s.job_id) ?? []);

    // Same region + role-family gate as getFeed — never spend mini calls
    // scoring jobs the user can't see anyway.
    const region = userRegion(profile.target_location);
    const families = familiesForUser(profile.target_role_family as RoleFamily | null);
    let jobsQuery = admin
      .from('jobs')
      .select('id, title, company, description')
      .order('posted_at', { ascending: false, nullsFirst: false })
      .limit(PER_USER_JOB_CAP * 2); // overfetch then filter; cheaper than left-join
    if (region !== 'other') {
      jobsQuery = jobsQuery.in('region', [region, 'remote']);
    }
    if (families.length > 0) {
      jobsQuery = jobsQuery.in('role_family', families);
    }
    const { data: jobs } = await jobsQuery;

    const unscored = (jobs ?? [])
      .filter((j) => !scoredIds.has(j.id))
      .slice(0, PER_USER_JOB_CAP);

    if (unscored.length === 0) continue;

    const profileForAgent: Profile = {
      target_role_family: profile.target_role_family as RoleFamily,
      target_seniority: profile.target_seniority as Seniority,
      target_location: profile.target_location ?? 'Delhi NCR',
      resume_json: profile.resume_json,
      linkedin_paste: profile.linkedin_paste ?? null,
      portfolio_urls: profile.portfolio_urls ?? [],
    };

    let scoredForUser = 0;
    for (let i = 0; i < unscored.length; i += PER_USER_CONCURRENCY) {
      if (totalJobsScored >= TOTAL_JOB_CAP) {
        capHit = true;
        break;
      }
      const batch = unscored.slice(i, i + PER_USER_CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map(async (job) => {
          const r = await runMatchScore({
            profile: profileForAgent,
            job: { title: job.title, company: job.company, description: job.description },
          });
          return { jobId: job.id, score: r };
        }),
      );

      type ScoredJob = { jobId: string; score: Awaited<ReturnType<typeof runMatchScore>> };
      const inserts = results
        .filter((r): r is PromiseFulfilledResult<ScoredJob> => r.status === 'fulfilled')
        .map((r) => ({
          profile_id: profile.id,
          job_id: r.value.jobId,
          score: Math.round(Math.max(0, Math.min(100, r.value.score.output.score))),
          reasoning: r.value.score.output.reasoning,
          gaps: r.value.score.output.gaps,
          strengths: r.value.score.output.strengths,
          model: r.value.score.model,
        }));

      if (inserts.length > 0) {
        const { error } = await admin
          .from('match_scores')
          .upsert(inserts, { onConflict: 'profile_id,job_id' });
        if (error) {
          console.error('[scoreAllUsers] upsert failed', {
            profileId: profile.id,
            error,
          });
          errorCount += 1;
        } else {
          scoredForUser += inserts.length;
          totalJobsScored += inserts.length;
        }
      }

      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        errorCount += failures.length;
        console.error('[scoreAllUsers] some scoring calls failed', {
          profileId: profile.id,
          count: failures.length,
          firstError: (failures[0] as PromiseRejectedResult).reason,
        });
      }
    }

    if (scoredForUser > 0) usersScored += 1;
  }

  return { usersScored, jobsScored: totalJobsScored, errors: errorCount, capHit };
}
