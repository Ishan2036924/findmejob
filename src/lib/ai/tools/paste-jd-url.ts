import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { pasteJobFromUrl } from '@/lib/jobs/paste-actions';
import { createClient } from '@/lib/supabase/server';

export const pasteJdUrlTool = tool({
  description:
    'Add a job to the user\'s applications log by fetching and extracting a job posting URL. Creates a job row + an application row (status=saved) and runs match scoring. Confirm intent first unless the user was explicit.',
  inputSchema: z.object({
    url: z.string().describe('The full job posting URL (must start with http/https).'),
  }),
  execute: async ({ url }) => {
    try {
      const result = await pasteJobFromUrl(url);
      if (!result.ok) {
        return { error: result.error };
      }

      // Fetch the application + job + score for a useful return shape.
      try {
        const supabase = await createClient();
        const { data: app } = await supabase
          .from('applications')
          .select(`id, job:jobs (id, title, company)`)
          .eq('id', result.applicationId)
          .maybeSingle();
        type JobShape = { id: string; title: string; company: string };
        const job = (app?.job as unknown as JobShape) ?? null;
        let match_score: number | null = null;
        if (job?.id) {
          const { data: ms } = await supabase
            .from('match_scores')
            .select('score')
            .eq('job_id', job.id)
            .maybeSingle();
          match_score = ms?.score ?? null;
        }
        return {
          application_id: result.applicationId,
          title: job?.title ?? null,
          company: job?.company ?? null,
          match_score,
        };
      } catch {
        return {
          application_id: result.applicationId,
          title: null,
          company: null,
          match_score: null,
        };
      }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
