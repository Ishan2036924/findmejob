import 'server-only';
import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';

const summarySchema = z.object({
  summary: z
    .string()
    .describe(
      'Compact 2-3 sentence summary of the prior conversation. No advice, no opinions.',
    ),
});

const SYSTEM = `Summarize this conversation in 2-3 sentences. Capture decisions, durable preferences, named entities (companies, roles, jobs). NO opinions, NO advice. Output: just the summary text.`;

const MAX_BODY_CHARS = 500;

/**
 * Fire-and-forget rolling-summary refresh for a thread. Never throws.
 *
 * Loads chat_messages between [fromCreatedAt, toMessageId] inclusive (filtered
 * to user/assistant only), truncates each body to ~500 chars, and writes the
 * resulting summary back to chat_threads.rolling_summary +
 * summary_through_message_id.
 */
export async function summarizeThread(
  threadId: string,
  fromMessageCreatedAt: string | null,
  toMessageId: string,
): Promise<void> {
  try {
    const supabase = await createClient();

    // Resolve the upper bound's created_at so we can range-query by created_at.
    const { data: toRow } = await supabase
      .from('chat_messages')
      .select('created_at')
      .eq('id', toMessageId)
      .maybeSingle<{ created_at: string }>();
    if (!toRow) return;

    let q = supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('thread_id', threadId)
      .in('role', ['user', 'assistant'])
      .lte('created_at', toRow.created_at)
      .order('created_at', { ascending: true });
    if (fromMessageCreatedAt) {
      q = q.gte('created_at', fromMessageCreatedAt);
    }
    const { data: rows } = await q;
    if (!rows || rows.length === 0) return;

    const transcript = rows
      .map((r) => {
        const body = (r.content ?? '').slice(0, MAX_BODY_CHARS);
        return `${r.role}: ${body}`;
      })
      .join('\n\n');

    const result = await generateObject({
      model: openai('gpt-4.1-mini'),
      schema: summarySchema,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: transcript },
      ],
    });

    const summary = result.object.summary.trim();
    if (!summary) return;

    await supabase
      .from('chat_threads')
      .update({
        rolling_summary: summary,
        summary_through_message_id: toMessageId,
      })
      .eq('id', threadId);
  } catch (err) {
    console.error('[summarizeThread]', err);
  }
}
