import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { generateCompanyBrief } from '@/lib/artifacts/actions';
import { createClient } from '@/lib/supabase/server';

export const generateCompanyBriefTool = tool({
  description:
    'Generate a company / role briefing for an application (by application_id). Persists a generations row. Returns the new generation_id and a short preview. Confirm intent with the user before calling unless they were explicit.',
  inputSchema: z.object({
    application_id: z.string().describe('The application UUID.'),
  }),
  execute: async ({ application_id }) => {
    try {
      const result = await generateCompanyBrief(application_id);
      if (!result.ok) {
        return { error: result.message ?? result.error };
      }

      let preview = '';
      try {
        const supabase = await createClient();
        const { data } = await supabase
          .from('generations')
          .select('output')
          .eq('id', result.generationId)
          .maybeSingle();
        const out = data?.output as Record<string, unknown> | null;
        let summary = '';
        if (typeof out?.summary === 'string') {
          summary = out.summary;
        } else if (typeof out?.meta_summary === 'string') {
          summary = out.meta_summary;
        } else if (typeof out?.what_they_do === 'string') {
          summary = out.what_they_do;
        }
        preview = summary.slice(0, 300);
      } catch {
        // best-effort
      }

      return { generation_id: result.generationId, preview };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
