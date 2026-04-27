import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

// Workload → model mapping. Locked 2026-04-27. See .claude/NOTES.md ## Models.
//
// Direct provider SDKs (BYOK) — billing goes to the user's Anthropic + OpenAI
// accounts via ANTHROPIC_API_KEY + OPENAI_API_KEY env vars. AI Gateway bypassed.
//
// MODELS = SDK model objects passed to generateText / generateObject.
// MODEL_IDS = matching string identifiers for DB storage / logs / observability.

export const MODELS = {
  // Sonnet 4.6 — moat-only. Prompt caching mandatory on these calls.
  orchestrator: anthropic('claude-sonnet-4-6'),
  assessment: anthropic('claude-sonnet-4-6'),
  resumeTailor: anthropic('claude-sonnet-4-6'),

  // GPT-4.1 mini — everything else. Strict-JSON friendly.
  coverLetter: openai('gpt-4.1-mini'),
  interviewPrep: openai('gpt-4.1-mini'),
  outreach: openai('gpt-4.1-mini'),
  companyBrief: openai('gpt-4.1-mini'),
  roadmap: openai('gpt-4.1-mini'),
  matchScoring: openai('gpt-4.1-mini'),
  ghostJobClassifier: openai('gpt-4.1-mini'),
  extraction: openai('gpt-4.1-mini'),
} as const;

export const MODEL_IDS = {
  orchestrator: 'anthropic/claude-sonnet-4-6',
  assessment: 'anthropic/claude-sonnet-4-6',
  resumeTailor: 'anthropic/claude-sonnet-4-6',
  coverLetter: 'openai/gpt-4.1-mini',
  interviewPrep: 'openai/gpt-4.1-mini',
  outreach: 'openai/gpt-4.1-mini',
  companyBrief: 'openai/gpt-4.1-mini',
  roadmap: 'openai/gpt-4.1-mini',
  matchScoring: 'openai/gpt-4.1-mini',
  ghostJobClassifier: 'openai/gpt-4.1-mini',
  extraction: 'openai/gpt-4.1-mini',
} as const satisfies Record<keyof typeof MODELS, string>;

export type ModelKey = keyof typeof MODELS;

// Held in reserve for cost relief on scoring at production scale:
//   matchScoringCheap: google('gemini-2.5-flash-lite'),
// Requires `pnpm add @ai-sdk/google` + GOOGLE_GENERATIVE_AI_API_KEY env var.
