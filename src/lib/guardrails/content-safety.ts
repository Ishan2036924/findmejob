import 'server-only';

const HARD_BLOCK_CATEGORIES = [
  'sexual/minors',
  'self-harm/instructions',
  'violence/graphic',
] as const;

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: 'blocked'; categories: string[]; message: string };

/**
 * Pre-call moderation on user input. Calls OpenAI omni-moderation-latest.
 * Returns ok:true on pass, on infra error, OR on soft-warn categories
 * (hate/harassment — we still respond, model handles refusal).
 *
 * Hard-blocks: sexual/minors, self-harm/instructions, violence/graphic.
 */
export async function moderateInput(text: string): Promise<ModerationResult> {
  const trimmed = text?.trim();
  if (!trimmed) return { ok: true };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[moderateInput] OPENAI_API_KEY missing — fail open');
    return { ok: true };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'omni-moderation-latest',
        input: trimmed,
      }),
      // 5s timeout via AbortController
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error('[moderateInput] non-200', res.status);
      return { ok: true };
    }
    const json = (await res.json()) as {
      results?: Array<{ flagged: boolean; categories: Record<string, boolean> }>;
    };
    const r = json.results?.[0];
    if (!r) return { ok: true };

    const flagged = HARD_BLOCK_CATEGORIES.filter((c) => r.categories[c]);
    if (flagged.length > 0) {
      return {
        ok: false,
        reason: 'blocked',
        categories: flagged,
        message:
          "I can't help with that. Try a different question — I'm here for career and job-search help.",
      };
    }
    return { ok: true };
  } catch (err) {
    console.error('[moderateInput] threw — fail open', err);
    return { ok: true };
  }
}
