import 'server-only';
import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';

// Cost note: ~$0.001 per turn at gpt-4.1-mini pricing (small input + small output).

const memoryItemSchema = z.object({
  kind: z.enum(['preference', 'fact', 'history', 'goal']),
  content: z.string(),
  context: z.string().nullable(),
  confidence: z.number().describe('0..1 — how durable / worth-remembering this is.'),
});

const distillSchema = z.object({
  memories: z.array(memoryItemSchema),
});

const SYSTEM = `You are a memory distiller. From a user↔assistant exchange, extract durable facts about the USER worth remembering across future threads.

Rules:
- Only extract things that are stable: preferences, goals, history, biographical facts.
- DO NOT extract one-off questions, situational requests, or assistant suggestions.
- DO NOT duplicate items already in EXISTING_MEMORIES (case-insensitive).
- Each memory: <= 160 chars, single sentence.
- confidence: 0..1. 0.7+ means "definitely worth saving".
- Return [] if nothing qualifies.`;

export async function distillMemories(input: {
  userMessage: string;
  assistantText: string;
  existingMemories: string[]; // simple compact list
}): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const existingBlock =
      input.existingMemories.length > 0
        ? input.existingMemories.map((m) => `- ${m}`).join('\n')
        : '(none)';

    const result = await generateObject({
      model: openai('gpt-4.1-mini'),
      schema: distillSchema,
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `## EXISTING_MEMORIES\n${existingBlock}\n\n## USER_MESSAGE\n${input.userMessage}\n\n## ASSISTANT_REPLY\n${input.assistantText}\n\nExtract memories now.`,
        },
      ],
    });

    const candidates = result.object.memories.filter((m) => m.confidence >= 0.7);
    if (candidates.length === 0) return;

    const existingLower = new Set(
      input.existingMemories.map((m) => m.toLowerCase()),
    );

    const inserts = candidates
      .map((m) => ({
        kind: m.kind,
        content: m.content.trim().slice(0, 600),
        context: m.context,
      }))
      .filter(
        (m) =>
          m.content.length >= 1 &&
          !existingLower.has(m.content.toLowerCase()),
      )
      .map((m) => ({
        profile_id: user.id,
        kind: m.kind,
        content: m.content,
        context: m.context,
        source: 'auto' as const,
      }));

    if (inserts.length === 0) return;

    const { error } = await supabase.from('user_memories').insert(inserts);
    if (error) console.error('[distillMemories insert]', error);
  } catch (err) {
    console.error('[distillMemories]', err);
  }
}
