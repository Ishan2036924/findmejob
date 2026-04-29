import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const listArtifactsTool = tool({
  description:
    'List generated artifacts (resume, cover letter, brief, interview Qs, outreach). Pass application_id to scope to one application, or null for all (last 50).',
  inputSchema: z.object({
    application_id: z
      .string()
      .nullable()
      .describe('Filter to one application, or null for all artifacts.'),
  }),
  execute: async ({ application_id }) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: 'unauthenticated' };

      let query = supabase
        .from('generations')
        .select('id, kind, application_id, model, created_at')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (application_id) query = query.eq('application_id', application_id);

      const { data, error } = await query;
      if (error) return { error: error.message };

      return { artifacts: data ?? [] };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
