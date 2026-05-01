import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { generateCoverLetter } from '@/lib/artifacts/actions';
import { createClient } from '@/lib/supabase/server';

export const generateCoverLetterTool = tool({
  description:
    'Generate a tailored cover letter for an existing application (by application_id). Persists a generations row. Returns the new generation_id and a short preview. Confirm intent with the user before calling unless they were explicit.',
  inputSchema: z.object({
    application_id: z.string().describe('The application UUID.'),
  }),
  execute: async ({ application_id }) => {
    try {
      const result = await generateCoverLetter(application_id);
      if (!result.ok) {
        return { error: result.message ?? result.error };
      }

      // Pull the persisted output to build a 300-char preview.
      let preview = '';
      try {
        const supabase = await createClient();
        const { data } = await supabase
          .from('generations')
          .select('output')
          .eq('id', result.generationId)
          .maybeSingle();
        const letter =
          (data?.output as { letter?: string } | null)?.letter ?? '';
        preview = letter.slice(0, 300);
      } catch {
        // Preview is best-effort.
      }

      return { generation_id: result.generationId, preview };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
