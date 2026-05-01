import 'server-only';
import { createClient } from '@/lib/supabase/server';

/**
 * Generalized per-user daily rate-limit helpers. All checkers share the same
 * shape so call-sites can be uniform. All checkers FAIL OPEN on infra error
 * (we never want a Supabase blip to hard-block the user).
 *
 * Returned `message` is friendly UI copy. Returned `reason` is a stable code
 * for logging / agent reasoning.
 */

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: string; message: string };

function startOfUtcDayIso(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Counts assistant messages today (UTC) for this user; blocks if over
 * `CHAT_DAILY_CAP` (default 50). gpt-4.1-mini is cheap, this is a sanity cap,
 * not a precise spend tracker.
 */
export async function checkChatRateLimit(profileId: string): Promise<RateLimitResult> {
  const cap = Number(process.env.CHAT_DAILY_CAP ?? 50);

  const supabase = await createClient();

  const { count, error } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('role', 'assistant')
    .gte('created_at', startOfUtcDayIso());

  if (error) {
    console.error('[checkChatRateLimit]', error);
    return { ok: true };
  }

  if ((count ?? 0) >= cap) {
    return {
      ok: false,
      reason: 'daily_chat_cap_reached',
      message: 'Daily chat limit reached. Try again tomorrow or upgrade for more.',
    };
  }
  return { ok: true };
}

/**
 * Counts artifact generations today; blocks if over `ARTIFACT_DAILY_CAP`
 * (default 10). Counts every row in `generations` for the user.
 */
export async function checkArtifactRateLimit(profileId: string): Promise<RateLimitResult> {
  const cap = Number(process.env.ARTIFACT_DAILY_CAP ?? 10);

  const supabase = await createClient();
  const { count, error } = await supabase
    .from('generations')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .gte('created_at', startOfUtcDayIso());

  if (error) {
    console.error('[checkArtifactRateLimit]', error);
    return { ok: true };
  }

  if ((count ?? 0) >= cap) {
    return {
      ok: false,
      reason: 'daily_artifact_cap_reached',
      message: 'Free tier limit hit (10 artifacts/day). Upgrade for more.',
    };
  }
  return { ok: true };
}

/**
 * Counts practice sessions today; blocks if over `PRACTICE_DAILY_CAP`
 * (default 20).
 */
export async function checkPracticeRateLimit(profileId: string): Promise<RateLimitResult> {
  const cap = Number(process.env.PRACTICE_DAILY_CAP ?? 20);

  const supabase = await createClient();

  // practice_sessions is keyed by application_id with no profile_id column.
  // Two-step: fetch this user's application IDs, then count today's sessions
  // for them. Cheap and avoids relying on PostgREST inner-join count semantics.
  const { data: apps, error: appsErr } = await supabase
    .from('applications')
    .select('id')
    .eq('profile_id', profileId);

  if (appsErr) {
    console.error('[checkPracticeRateLimit] apps fetch failed', appsErr);
    return { ok: true };
  }

  const appIds = (apps ?? []).map((a) => a.id);
  if (appIds.length === 0) return { ok: true };

  const { count, error } = await supabase
    .from('practice_sessions')
    .select('id', { count: 'exact', head: true })
    .in('application_id', appIds)
    .gte('created_at', startOfUtcDayIso());

  if (error) {
    console.error('[checkPracticeRateLimit]', error);
    return { ok: true };
  }

  if ((count ?? 0) >= cap) {
    return {
      ok: false,
      reason: 'daily_practice_cap_reached',
      message: 'Practice limit reached for today.',
    };
  }
  return { ok: true };
}

/**
 * Counts chat attachments uploaded today; blocks if over `ATTACHMENT_DAILY_CAP`
 * (default 10). The `chat_attachments` table is shipped in Phase 4 — until
 * then this fails open silently if the table is missing.
 */
export async function checkAttachmentRateLimit(profileId: string): Promise<RateLimitResult> {
  const cap = Number(process.env.ATTACHMENT_DAILY_CAP ?? 10);

  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('chat_attachments')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profileId)
      .gte('created_at', startOfUtcDayIso());

    if (error) {
      // Table likely doesn't exist yet in Phase 1 — fail open.
      console.error('[checkAttachmentRateLimit]', error);
      return { ok: true };
    }

    if ((count ?? 0) >= cap) {
      return {
        ok: false,
        reason: 'daily_attachment_cap_reached',
        message: 'Daily attachment limit reached.',
      };
    }
    return { ok: true };
  } catch (err) {
    console.error('[checkAttachmentRateLimit] threw', err);
    return { ok: true };
  }
}

/**
 * Counts pasted JD applications created today; blocks if over
 * `PASTE_JD_DAILY_CAP` (default 20).
 */
export async function checkPasteJdRateLimit(profileId: string): Promise<RateLimitResult> {
  const cap = Number(process.env.PASTE_JD_DAILY_CAP ?? 20);

  const supabase = await createClient();
  // Pasted JDs create an application row whose linked job has source='user_pasted'.
  // Easiest: count jobs of source='user_pasted' AND created_by = profile today.
  const { count, error } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('source', 'user_pasted')
    .eq('created_by', profileId)
    .gte('created_at', startOfUtcDayIso());

  if (error) {
    console.error('[checkPasteJdRateLimit]', error);
    return { ok: true };
  }

  if ((count ?? 0) >= cap) {
    return {
      ok: false,
      reason: 'daily_paste_jd_cap_reached',
      message: 'Daily paste-a-JD limit reached.',
    };
  }
  return { ok: true };
}

/**
 * Counts agent-initiated feed refreshes today. Heuristic: count match_scores
 * rows the user accumulated today. If there's even 1, the agent already
 * triggered a refresh (cron writes via service role under the system, not the
 * user). Cap defaults to `REFRESH_DAILY_CAP` = 1.
 */
export async function checkRefreshRateLimit(profileId: string): Promise<RateLimitResult> {
  const cap = Number(process.env.REFRESH_DAILY_CAP ?? 1);

  const supabase = await createClient();
  const { count, error } = await supabase
    .from('match_scores')
    .select('job_id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .gte('created_at', startOfUtcDayIso());

  if (error) {
    console.error('[checkRefreshRateLimit]', error);
    return { ok: true };
  }

  if ((count ?? 0) >= cap) {
    return {
      ok: false,
      reason: 'daily_refresh_cap_reached',
      message: 'Feed already refreshed today. Daily cron also pushes new jobs nightly.',
    };
  }
  return { ok: true };
}
