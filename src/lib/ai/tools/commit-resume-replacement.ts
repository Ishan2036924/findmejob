import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAttachmentsByIds } from '@/lib/chat/attachments';
import { runResumeParser } from '@/lib/ai/agents/resume-parser-agent';

export const commitResumeReplacementTool = tool({
  description:
    "ONLY call after `parse_attachment_as_resume` succeeded AND the user confirmed 'yes, apply'. Replaces the user's `profiles.resume_json` with the parsed PDF content.",
  inputSchema: z.object({
    attachment_id: z.string(),
    user_confirmed: z.boolean(),
  }),
  execute: async (input) => {
    try {
      if (!input.user_confirmed) {
        return {
          error: 'user_confirmation_required',
          message:
            'Cannot replace resume without explicit user confirmation. Ask "Apply this as your new resume? Yes / No" first.',
        };
      }

      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: 'unauthorized' };

      const atts = await getAttachmentsByIds([input.attachment_id]);
      const att = atts[0];
      if (!att || att.kind !== 'pdf' || !att.extracted_text) {
        return { error: 'attachment_invalid' };
      }

      let parsed;
      try {
        parsed = await runResumeParser({ raw_text: att.extracted_text });
      } catch {
        return { error: 'parse_failed' };
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          resume_json: parsed.output,
          raw_resume_text: att.extracted_text,
        })
        .eq('id', user.id);
      if (error) return { error: error.message };

      revalidatePath('/dashboard');
      revalidatePath('/onboarding');

      return {
        ok: true,
        replaced: true,
        summary: parsed.output?.summary ?? null,
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
