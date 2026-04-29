import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const saveMemoryTool = tool({
  description:
    'Persist a durable user fact, preference, history, or goal across threads. Use proactively when the user states something worth remembering long-term (e.g. preferred locations, target salary, "I hate sales-y cover letters"). Content must be 1-600 chars.',
  inputSchema: z.object({
    kind: z.enum(['preference', 'fact', 'history', 'goal']),
    content: z.string().describe('The memory itself — 1 to 600 chars.'),
    context: z
      .string()
      .nullable()
      .describe('Optional source/context (e.g. "stated 2026-04-29 in chat").'),
  }),
  execute: async ({ kind, content, context }) => {
    try {
      const trimmed = content.trim();
      if (trimmed.length < 1 || trimmed.length > 600) {
        return { error: 'content_length_out_of_range' };
      }

      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: 'unauthenticated' };

      const { data, error } = await supabase
        .from('user_memories')
        .insert({
          profile_id: user.id,
          kind,
          content: trimmed,
          context: context ?? null,
          source: 'auto',
        })
        .select('id')
        .single();

      if (error) return { error: error.message };
      return { id: data.id, saved: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
