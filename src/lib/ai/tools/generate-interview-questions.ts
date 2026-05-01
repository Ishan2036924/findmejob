import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { generateInterviewQuestions } from '@/lib/artifacts/actions';
import { createClient } from '@/lib/supabase/server';

export const generateInterviewQuestionsTool = tool({
  description:
    'Generate likely interview questions (technical + behavioral + situational) for an application. Persists a generations row. Returns the new generation_id and the first 3 questions as a preview. Confirm intent first unless the user was explicit.',
  inputSchema: z.object({
    application_id: z.string().describe('The application UUID.'),
  }),
  execute: async ({ application_id }) => {
    try {
      const result = await generateInterviewQuestions(application_id);
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
        const out = data?.output as
          | {
              technical?: Array<{ question?: string }>;
              behavioral?: Array<{ question?: string }>;
              situational?: Array<{ question?: string }>;
            }
          | null;
        const all: string[] = [];
        for (const q of out?.technical ?? []) {
          if (q?.question) all.push(q.question);
        }
        for (const q of out?.behavioral ?? []) {
          if (q?.question) all.push(q.question);
        }
        for (const q of out?.situational ?? []) {
          if (q?.question) all.push(q.question);
        }
        preview = all.slice(0, 3).join(' | ');
      } catch {
        // best-effort
      }

      return { generation_id: result.generationId, preview };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
