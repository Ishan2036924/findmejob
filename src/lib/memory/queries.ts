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
 * Returns a string formatted for the agent system prompt — `kind: content` per
 * line. Used in Step 4 to inject durable user facts at request time.
 */
export async function getMemoryContextBlock(): Promise<string> {
  const memories = await listMemories();
  if (memories.length === 0) return '';
  return memories
    .map((m) => `${m.kind}: ${m.content}`)
    .join('\n');
}
