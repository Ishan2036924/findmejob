import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { generateOutreach } from '@/lib/artifacts/actions';
import { createClient } from '@/lib/supabase/server';

export const generateOutreachTool = tool({
  description:
    'Generate outreach drafts (e.g. recruiter / hiring manager messages) for an application. Persists a generations row. Returns the new generation_id and a short preview. Confirm intent first unless the user was explicit.',
  inputSchema: z.object({
    application_id: z.string().describe('The application UUID.'),
  }),
  execute: async ({ application_id }) => {
    try {
      const result = await generateOutreach(application_id);
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
        // Try common shapes: drafts: [{body}], messages: [{body}], or stringified
        const drafts =
          (out?.drafts as Array<Record<string, unknown>> | undefined) ??
          (out?.messages as Array<Record<string, unknown>> | undefined) ??
          [];
        let first = '';
        const firstDraft = drafts[0];
        if (firstDraft && typeof firstDraft.body === 'string') {
          first = firstDraft.body;
        } else if (firstDraft && typeof firstDraft.message === 'string') {
          first = firstDraft.message;
        } else if (typeof out?.meta_summary === 'string') {
          first = out.meta_summary;
        }
        preview = first.slice(0, 300);
      } catch {
        // best-effort
      }

      return { generation_id: result.generationId, preview };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
