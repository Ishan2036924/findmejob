import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const forgetMemoryTool = tool({
  description:
    'Delete a stored user memory by id. Use when the user explicitly asks you to forget something. RLS guarantees only the owner can delete.',
  inputSchema: z.object({
    memory_id: z.string().describe('UUID of the memory to delete.'),
  }),
  execute: async ({ memory_id }) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: 'unauthenticated' };

      const { data: existing } = await supabase
        .from('user_memories')
        .select('id')
        .eq('id', memory_id)
        .maybeSingle();
      if (!existing) return { error: 'not_found' };

      const { error } = await supabase
        .from('user_memories')
        .delete()
        .eq('id', memory_id);
      if (error) return { error: error.message };

      return { deleted: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
