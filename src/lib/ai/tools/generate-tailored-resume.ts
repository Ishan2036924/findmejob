import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { generateTailoredResume } from '@/lib/resume/actions';
import { createClient } from '@/lib/supabase/server';

export const generateTailoredResumeTool = tool({
  description:
    'Generate a tailored resume (Sonnet) for an application. Persists a resumes row + a generations row of kind=resume_tailoring. Returns resume_id, generation_id, and a preview_url. Confirm intent first unless the user was explicit — this is the most expensive artifact.',
  inputSchema: z.object({
    application_id: z.string().describe('The application UUID.'),
  }),
  execute: async ({ application_id }) => {
    try {
      const result = await generateTailoredResume(application_id);
      if (!result.ok) {
        return { error: result.error };
      }

      // Look up the linked generation row id (best-effort).
      let generation_id: string | null = null;
      try {
        const supabase = await createClient();
        const { data } = await supabase
          .from('generations')
          .select('id')
          .eq('application_id', application_id)
          .eq('resume_id', result.resumeId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        generation_id = data?.id ?? null;
      } catch {
        // best-effort
      }

      return {
        resume_id: result.resumeId,
        generation_id,
        preview_url: `/applications/${application_id}/resume/${result.resumeId}`,
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
