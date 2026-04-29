import 'server-only';
import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';

const titleSchema = z.object({
  title: z
    .string()
    .describe('Short, descriptive thread title (<= 50 chars). No quotes, no trailing period.'),
});

const SYSTEM = `Generate a 2-6 word title for a chat thread based on the user's first message. Output the title only — no quotes, no period. Example: "Draft cover letter for Acme PM" or "Why is my match score 42?".`;

/**
 * Fire-and-forget title generation. Never throws — caught by caller wrapper too.
 */
export async function titleThread(
  threadId: string,
  firstMessage: string,
): Promise<void> {
  try {
    const result = await generateObject({
      model: openai('gpt-4.1-mini'),
      schema: titleSchema,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: firstMessage.slice(0, 500) },
      ],
    });

    const title = result.object.title.trim().slice(0, 50);
    if (!title) return;

    const supabase = await createClient();
    await supabase
      .from('chat_threads')
      .update({ title })
      .eq('id', threadId);
  } catch (err) {
    console.error('[titleThread]', err);
  }
}
