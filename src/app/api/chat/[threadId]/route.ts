import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkChatRateLimit } from '@/lib/guardrails/chat-rate-limit';
import { careerAgent } from '@/lib/ai/agents/career-agent';
import { titleThread } from '@/lib/ai/agents/thread-titler';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Validate thread ownership (RLS enforces too, but we want a clean 404).
  const { data: thread } = await supabase
    .from('chat_threads')
    .select('id, title')
    .eq('id', threadId)
    .eq('profile_id', user.id)
    .maybeSingle();
  if (!thread) {
    return NextResponse.json({ error: 'thread_not_found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const message =
    body && typeof body === 'object' && 'message' in body
      ? String((body as { message: unknown }).message ?? '').trim()
      : '';
  if (!message) {
    return NextResponse.json({ error: 'empty_message' }, { status: 400 });
  }

  // Cost guardrail.
  const rate = await checkChatRateLimit(user.id);
  if (!rate.ok) {
    return NextResponse.json(
      { error: rate.reason },
      { status: 429 },
    );
  }

  // Persist the user message immediately so the UI sees it even if streaming
  // dies mid-flight.
  const { error: userInsertError } = await supabase.from('chat_messages').insert({
    thread_id: threadId,
    profile_id: user.id,
    role: 'user',
    content: message,
  });
  if (userInsertError) {
    console.error('[chat route user insert]', userInsertError);
    return NextResponse.json(
      { error: 'message_persist_failed' },
      { status: 500 },
    );
  }

  // First user message? Fire-and-forget title gen.
  const { count: priorUserCount } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('thread_id', threadId)
    .eq('role', 'user');
  if ((priorUserCount ?? 0) <= 1) {
    void titleThread(threadId, message);
  }

  return careerAgent({ threadId, userMessage: message });
}
