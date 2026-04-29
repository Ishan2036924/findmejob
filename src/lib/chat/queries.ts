import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type ChatRole = 'user' | 'assistant' | 'tool';

export type ChatThreadRow = {
  id: string;
  profile_id: string;
  title: string;
  archived_at: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessageRow = {
  id: string;
  thread_id: string;
  profile_id: string;
  role: ChatRole;
  content: string;
  tool_calls: unknown;
  tool_call_id: string | null;
  tokens_input: number | null;
  tokens_output: number | null;
  model: string | null;
  created_at: string;
};

export async function listThreads(): Promise<ChatThreadRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('chat_threads')
    .select('*')
    .is('archived_at', null)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  return (data ?? []) as ChatThreadRow[];
}

export async function getThread(id: string): Promise<ChatThreadRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('id', id)
    .maybeSingle<ChatThreadRow>();
  return data ?? null;
}

export async function getMessages(threadId: string): Promise<ChatMessageRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
  return (data ?? []) as ChatMessageRow[];
}
