import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// NOTE: aggregation logic lives inline here on purpose. Step 5 will build a
// dedicated analytics module — duplicating the math now is intentional to avoid
// a race with that step. Re-unify when Step 5 lands.

const ALL_STATUSES = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
] as const;

export const getAnalyticsSummaryTool = tool({
  description:
    'Aggregate stats for the user\'s job search: total applications, breakdown by status, response rate (interview+offer / applied), average match score, top 5 companies applied to.',
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: 'unauthenticated' };

      const { data: apps, error } = await supabase
        .from('applications')
        .select(
          `id, status, job_id,
           job:jobs (company)`,
        )
        .eq('profile_id', user.id);

      if (error) return { error: error.message };

      type Row = {
        id: string;
        status: string;
        job_id: string;
        job: { company: string } | null;
      };
      const rows = (apps ?? []) as unknown as Row[];

      const by_status = ALL_STATUSES.reduce(
        (acc, s) => {
          acc[s] = 0;
          return acc;
        },
        {} as Record<string, number>,
      );
      for (const r of rows) {
        if (by_status[r.status] !== undefined) by_status[r.status] += 1;
      }

      const applied_or_further =
        by_status['applied'] +
        by_status['interview'] +
        by_status['offer'] +
        by_status['rejected'];
      const responded = by_status['interview'] + by_status['offer'];
      const response_rate =
        applied_or_further > 0
          ? Number((responded / applied_or_further).toFixed(3))
          : null;

      // Avg match score across applied jobs
      let avg_match_score: number | null = null;
      const jobIds = rows.map((r) => r.job_id);
      if (jobIds.length > 0) {
        const { data: scores } = await supabase
          .from('match_scores')
          .select('score')
          .eq('profile_id', user.id)
          .in('job_id', jobIds);
        if (scores && scores.length > 0) {
          const total = scores.reduce((a, s) => a + (s.score ?? 0), 0);
          avg_match_score = Number((total / scores.length).toFixed(1));
        }
      }

      const companyCounts = new Map<string, number>();
      for (const r of rows) {
        const company = r.job?.company;
        if (!company) continue;
        companyCounts.set(company, (companyCounts.get(company) ?? 0) + 1);
      }
      const top_companies_applied = Array.from(companyCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([company, count]) => ({ company, count }));

      return {
        applications_total: rows.length,
        by_status,
        response_rate,
        avg_match_score,
        top_companies_applied,
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
