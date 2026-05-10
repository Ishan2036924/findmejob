import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { getAttachmentsByIds } from '@/lib/chat/attachments';
import { runResumeParser } from '@/lib/ai/agents/resume-parser-agent';

export const parseAttachmentAsResumeTool = tool({
  description:
    "Parse a chat attachment (PDF only) as a resume and return the structured fields WITHOUT saving. Use when the user uploads a PDF and says 'use this as my resume'. Always show the parsed preview to the user and ask for confirmation BEFORE calling commit_resume_replacement.",
  inputSchema: z.object({
    attachment_id: z.string(),
  }),
  execute: async (input) => {
    try {
      const atts = await getAttachmentsByIds([input.attachment_id]);
      const att = atts[0];
      if (!att) return { error: 'attachment_not_found' };
      if (att.kind !== 'pdf') {
        return {
          error: 'attachment_not_a_pdf',
          message: 'Only PDF attachments can be parsed as a resume.',
        };
      }
      if (!att.extracted_text || att.extracted_text.length < 200) {
        return {
          error: 'pdf_text_too_short',
          message:
            'Could not extract enough text from this PDF. It may be a scan. Paste the text instead.',
        };
      }

      const parsed = await runResumeParser({ raw_text: att.extracted_text });
      const preview = {
        name: parsed.output?.contact?.name ?? null,
        email: parsed.output?.contact?.email ?? null,
        experience_count: parsed.output?.experience?.length ?? 0,
        education_count: parsed.output?.education?.length ?? 0,
        skill_count: (parsed.output?.skills ?? []).reduce(
          (acc, s) => acc + (s.items?.length ?? 0),
          0,
        ),
        summary: parsed.output?.summary ?? null,
      };
      return {
        ok: true,
        attachment_id: input.attachment_id,
        preview,
        instruction_for_agent:
          'Show the preview to the user, ask "Apply this as your resume? Yes / No". On yes, call commit_resume_replacement with this attachment_id.',
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'parse_failed' };
    }
  },
});
