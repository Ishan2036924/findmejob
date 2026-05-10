import { z } from 'zod';

/**
 * Structured analysis of a target job description, produced by the upstream
 * JD Analyzer (gpt-4.1-mini) and consumed by the Tailor (Sonnet) and the
 * Tailor Verifier (gpt-4.1-mini). Treated by Tailor as ground truth for what
 * the resume edits must address.
 */
export const jdAnalysisSchema = z.object({
  /** Explicit JD requirements (skills, years, certifications, must-have responsibilities). */
  must_haves: z.array(z.string()),
  /** "Preferred" / "plus" qualifications. */
  nice_to_haves: z.array(z.string()),
  /** 8-12 critical keywords/phrases the resume should mirror verbatim where truthful. */
  vocabulary: z.array(z.string()),
  /** Leadership / scope / ownership cues that hint at level expectations. */
  seniority_signals: z.array(z.string()),
  /** Things in the resume that would CONFLICT with the JD (location, years, hard requirements). */
  red_flags: z.array(z.string()),
  /** 3-5 short sentences describing the day-to-day. */
  core_responsibilities: z.array(z.string()),
  /** 1-2 sentence summary of what this role is fundamentally about. */
  reasoning: z.string(),
});

export type JdAnalysis = z.infer<typeof jdAnalysisSchema>;

/** Stub used when the analyzer fails — keeps the pipeline alive without injecting wrong context. */
export const JD_ANALYSIS_STUB: JdAnalysis = {
  must_haves: [],
  nice_to_haves: [],
  vocabulary: [],
  seniority_signals: [],
  red_flags: [],
  core_responsibilities: [],
  reasoning: 'analysis unavailable',
};
