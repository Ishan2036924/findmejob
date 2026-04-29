import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const getApplicationDetailTool = tool({
  description:
    'Get full detail for a single application: job info (truncated description), match score breakdown, and linked artifacts.',
  inputSchema: z.object({
    application_id: z.string().describe('The application UUID.'),
  }),
  execute: async ({ application_id }) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: 'unauthenticated' };

      const { data: app, error } = await supabase
        .from('applications')
        .select(
          `id, status, notes, applied_at, updated_at,
           job:jobs (id, title, company, location, description, source, source_url, posted_at)`,
        )
        .eq('id', application_id)
        .eq('profile_id', user.id)
        .maybeSingle();

      if (error) return { error: error.message };
      if (!app) return { error: 'not_found' };

      type JobShape = {
        id: string;
        title: string;
        company: string;
        location: string | null;
        description: string;
        source: string;
        source_url: string;
        posted_at: string | null;
      };
      const job = app.job as unknown as JobShape;

      const { data: matchScore } = await supabase
        .from('match_scores')
        .select('score, reasoning, gaps, strengths')
        .eq('profile_id', user.id)
        .eq('job_id', job.id)
        .maybeSingle();

      const { data: artifacts } = await supabase
        .from('generations')
        .select('id, kind, created_at')
        .eq('profile_id', user.id)
        .eq('application_id', application_id)
        .order('created_at', { ascending: false });

      const description = job.description ?? '';
      const truncated_description =
        description.length > 1500
          ? `${description.slice(0, 1500)}…[truncated]`
          : description;

      return {
        id: app.id,
        status: app.status,
        notes: app.notes,
        applied_at: app.applied_at,
        updated_at: app.updated_at,
        job: {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          source: job.source,
          source_url: job.source_url,
          posted_at: job.posted_at,
          description: truncated_description,
        },
        match: matchScore
          ? {
              score: matchScore.score,
              reasoning: matchScore.reasoning,
              gaps: matchScore.gaps,
              strengths: matchScore.strengths,
            }
          : null,
        artifacts: (artifacts ?? []).map((a) => ({
          id: a.id,
          kind: a.kind,
          created_at: a.created_at,
        })),
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
