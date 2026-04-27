// Workload → model mapping. Locked 2026-04-27. See .claude/NOTES.md ## Models.
// Pass these strings directly to AI SDK: generateText({ model: MODELS.assessment, ... }).
// Routes through Vercel AI Gateway by default (no explicit provider import needed).

export const MODELS = {
  // Sonnet 4.6 — moat-only. Prompt caching mandatory on these calls.
  orchestrator: 'anthropic/claude-sonnet-4-6',
  assessment: 'anthropic/claude-sonnet-4-6',
  resumeTailor: 'anthropic/claude-sonnet-4-6',

  // GPT-4.1 mini — everything else. Strict-JSON friendly.
  coverLetter: 'openai/gpt-4.1-mini',
  interviewPrep: 'openai/gpt-4.1-mini',
  outreach: 'openai/gpt-4.1-mini',
  companyBrief: 'openai/gpt-4.1-mini',
  roadmap: 'openai/gpt-4.1-mini',
  matchScoring: 'openai/gpt-4.1-mini',
  ghostJobClassifier: 'openai/gpt-4.1-mini',
  extraction: 'openai/gpt-4.1-mini',

  // Held in reserve for production-scale cost relief on scoring.
  // Swap MODELS.matchScoring to MODELS.matchScoringCheap when scoring spend exceeds budget.
  matchScoringCheap: 'google/gemini-2.5-flash-lite',
} as const;

export type ModelKey = keyof typeof MODELS;
