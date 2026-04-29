import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const statusEnum = z.enum([
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
]);

export const listApplicationsTool = tool({
  description:
    'List the user\'s applications with optional filters. Returns up to 50 rows joined with job title/company and match score.',
  inputSchema: z.object({
    status: statusEnum.nullable().describe('Filter by application status, or null for all.'),
    since_days: z
      .number()
      .nullable()
      .describe('Only include applications updated in the last N days, or null for no time filter.'),
    company_contains: z
      .string()
      .nullable()
      .describe('Case-insensitive substring filter on company name, or null.'),
  }),
  execute: async ({ status, since_days, company_contains }) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: 'unauthenticated' };

      let query = supabase
        .from('applications')
        .select(
          `id, status, applied_at, updated_at,
           job:jobs (id, title, company)`,
        )
        .eq('profile_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (status) query = query.eq('status', status);
      if (since_days != null) {
        const cutoff = new Date(
          Date.now() - since_days * 24 * 60 * 60 * 1000,
        ).toISOString();
        query = query.gte('updated_at', cutoff);
      }

      const { data: apps, error } = await query;
      if (error) return { error: error.message };
      if (!apps || apps.length === 0) return { applications: [] };

      type JobShape = { id: string; title: string; company: string };
      let filtered = apps;
      if (company_contains) {
        const needle = company_contains.toLowerCase();
        filtered = apps.filter((a) =>
          (a.job as unknown as JobShape)?.company
            ?.toLowerCase()
            .includes(needle),
        );
      }

      const jobIds = filtered.map(
        (a) => (a.job as unknown as JobShape).id,
      );
      const { data: scores } = await supabase
        .from('match_scores')
        .select('job_id, score')
        .eq('profile_id', user.id)
        .in('job_id', jobIds);
      const scoreMap = new Map(
        scores?.map((s) => [s.job_id, s.score]) ?? [],
      );

      return {
        applications: filtered.map((a) => {
          const job = a.job as unknown as JobShape;
          return {
            id: a.id,
            title: job.title,
            company: job.company,
            status: a.status,
            match_score: scoreMap.get(job.id) ?? null,
            applied_at: a.applied_at,
            updated_at: a.updated_at,
          };
        }),
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
