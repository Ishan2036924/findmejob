import 'server-only';
import { createClient } from '@/lib/supabase/server';

/**
 * Simple cost guardrail. Counts assistant messages today (UTC) for this user;
 * blocks if over `CHAT_DAILY_CAP` (default 50). gpt-4.1-mini is cheap, this is
 * a sanity cap, not a precise spend tracker.
 */
export async function checkChatRateLimit(
  profileId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const cap = Number(process.env.CHAT_DAILY_CAP ?? 50);

  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('role', 'assistant')
    .gte('created_at', startOfDay.toISOString());

  if (error) {
    // Fail open on guardrail errors — never block the agent on infra noise.
    console.error('[checkChatRateLimit]', error);
    return { ok: true };
  }

  if ((count ?? 0) >= cap) {
    return { ok: false, reason: 'daily_chat_cap_reached' };
  }
  return { ok: true };
}
