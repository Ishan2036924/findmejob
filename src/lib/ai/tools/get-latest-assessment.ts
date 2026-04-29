import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const getLatestAssessmentTool = tool({
  description:
    'Fetch the user\'s most recent rubric-grounded profile assessment: overall score, dimensions, candid summary, next steps.',
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: 'unauthenticated' };

      const { data, error } = await supabase
        .from('assessments')
        .select(
          'id, overall_score, dimensions, candid_summary, next_steps, created_at, rubric_version, model',
        )
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return { error: error.message };
      if (!data) return { assessment: null };

      return {
        assessment: {
          id: data.id,
          overall_score: data.overall_score,
          dimensions: data.dimensions,
          summary: data.candid_summary,
          next_steps: data.next_steps,
          rubric_version: data.rubric_version,
          model: data.model,
          created_at: data.created_at,
        },
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
