import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const getMatchScoreTrendTool = tool({
  description:
    'Time-series of recent match scores with job title + company. Useful for averages or spotting a dip in fit. Default window 30 days.',
  inputSchema: z.object({
    since_days: z
      .number()
      .nullable()
      .describe('Lookback in days. Defaults to 30 when null.'),
  }),
  execute: async ({ since_days }) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: 'unauthenticated' };

      const window = since_days ?? 30;
      const cutoff = new Date(
        Date.now() - window * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { data, error } = await supabase
        .from('match_scores')
        .select(
          `created_at, score,
           job:jobs (title, company)`,
        )
        .eq('profile_id', user.id)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) return { error: error.message };

      type JobShape = { title: string; company: string };
      const points = (data ?? []).map((row) => {
        const job = row.job as unknown as JobShape | null;
        return {
          created_at: row.created_at,
          score: row.score,
          job_title: job?.title ?? null,
          company: job?.company ?? null,
        };
      });

      return { window_days: window, points };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
