import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type MemoryKind = 'preference' | 'fact' | 'history' | 'goal';
export type MemorySource = 'auto' | 'explicit';

export type UserMemoryRow = {
  id: string;
  profile_id: string;
  kind: MemoryKind;
  content: string;
  source: MemorySource;
  context: string | null;
  importance: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function listMemories(): Promise<UserMemoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('user_memories')
    .select('*')
    .order('created_at', { ascending: false });
  return (data ?? []) as UserMemoryRow[];
}

/**
 * Ranked + capped memory load. Used by the agent at request time so we never
 * blow up the system prompt for long-tenured users. Order: importance desc,
 * then last_used_at desc, then created_at desc.
 */
export async function listMemoriesRanked(opts?: {
  max?: number;
}): Promise<UserMemoryRow[]> {
  const max = opts?.max ?? Number(process.env.MEMORY_CONTEXT_CAP ?? 50);
  const supabase = await createClient();
  const { data } = await supabase
    .from('user_memories')
    .select('*')
    .order('importance', { ascending: false })
    .order('last_used_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(max);
  return (data ?? []) as UserMemoryRow[];
}

/**
 * Returns the formatted memory block + the IDs that contributed to it so the
 * caller can bump last_used_at after a successful turn.
 */
export async function getMemoryBlockAndIds(opts?: {
  max?: number;
}): Promise<{ block: string; ids: string[] }> {
  const memories = await listMemoriesRanked(opts);
  if (memories.length === 0) return { block: '', ids: [] };
  return {
    block: memories.map((m) => `${m.kind}: ${m.content}`).join('\n'),
    ids: memories.map((m) => m.id),
  };
}

/**
 * Returns a string formatted for the agent system prompt — `kind: content` per
 * line. Used in Step 4 to inject durable user facts at request time.
 *
 * Backward-compat wrapper around `getMemoryBlockAndIds`.
 */
export async function getMemoryContextBlock(): Promise<string> {
  return (await getMemoryBlockAndIds()).block;
}
