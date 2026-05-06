import 'server-only';

const HARD_BLOCK_CATEGORIES = [
  'sexual/minors',
  'self-harm/instructions',
  'self-harm/intent',
  'violence/graphic',
  'violence', // generic violence (pipe bomb instructions land here)
  'illicit', // illegal advice
  'illicit/violent', // instructions for violent/illegal acts
  'harassment/threatening',
  'hate/threatening',
] as const;

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: 'blocked'; categories: string[]; message: string };

const PII_PATTERNS = [
  // US SSN: 3-2-4 with hyphens or spaces (lenient)
  { name: 'ssn', regex: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/ },
  // Credit card: 13-19 digits, optionally separated by spaces or hyphens.
  // Apply Luhn check inline to avoid false positives on order numbers.
  { name: 'credit_card', regex: /\b(?:\d[ -]?){13,19}\b/, requiresLuhn: true as const },
  // Passport: 1-2 letters + 6-9 digits is the most common pattern (US/UK/India).
  { name: 'passport', regex: /\b[A-Z]{1,2}\d{6,9}\b/ },
  // Aadhaar: 4-4-4 digit groups (12 total) — Indian gov ID.
  { name: 'aadhaar', regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/ },
];

function luhnValid(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function detectPii(text: string): { found: string[] } {
  const trimmed = text?.trim() ?? '';
  if (!trimmed) return { found: [] };
  const found: string[] = [];
  for (const p of PII_PATTERNS) {
    const match = trimmed.match(p.regex);
    if (!match) continue;
    if ('requiresLuhn' in p && p.requiresLuhn) {
      if (luhnValid(match[0])) found.push(p.name);
    } else {
      found.push(p.name);
    }
  }
  return { found: Array.from(new Set(found)) };
}

/**
 * Pre-call moderation on user input. Calls OpenAI omni-moderation-latest.
 * Returns ok:true on pass, on infra error, OR on soft-warn categories
 * (hate/harassment — we still respond, model handles refusal).
 *
 * Hard-blocks: violence, self-harm/instructions, sexual/minors, illicit, etc.
 * Also runs PII detection (SSN, credit card with Luhn, passport, Aadhaar)
 * before the API call.
 */
export async function moderateInput(text: string): Promise<ModerationResult> {
  const trimmed = text?.trim();
  if (!trimmed) return { ok: true };

  // PII pre-check (regex; cheap; runs before the API call).
  const pii = detectPii(trimmed);
  if (pii.found.length > 0) {
    return {
      ok: false,
      reason: 'blocked',
      categories: pii.found.map((p) => `pii/${p}`),
      message:
        "I can't accept personal IDs or financial info (SSN, credit cards, passport numbers). Please redact and try again.",
    };
  }

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
