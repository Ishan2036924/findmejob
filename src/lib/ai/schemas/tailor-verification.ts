import { z } from 'zod';

/**
 * Verifier output: scores how well a tailored resume addresses the upstream
 * JD analysis. 0-100 scale. Drives the retry decision in tailor-agent.
 */
export const tailorVerificationSchema = z.object({
  /** 0-100. 90+ excellent, 70-89 acceptable, 50-69 weak, <50 critical gaps or hallucination. */
  score: z.number(),
  /** Strings from analysis.must_haves that the tailored resume now addresses. */
  must_haves_addressed: z.array(z.string()),
  /** Strings from analysis.must_haves NOT yet addressed (verbatim). */
  must_haves_missing: z.array(z.string()),
  /** analysis.vocabulary terms that now appear in the tailored resume. */
  vocabulary_mirrored: z.array(z.string()),
  /** analysis.vocabulary terms that don't appear in the tailored resume. */
  vocabulary_missing: z.array(z.string()),
  /** Claims in the tailored resume that look fabricated (not present in original). */
  hallucination_risks: z.array(z.string()),
  /** 2-3 sentences justifying the score. */
  reasoning: z.string(),
});

export type TailorVerification = z.infer<typeof tailorVerificationSchema>;

/** Used when the verifier itself fails — surfaces as score=0, no false positives. */
export const TAILOR_VERIFICATION_STUB: TailorVerification = {
  score: 0,
  must_haves_addressed: [],
  must_haves_missing: [],
  vocabulary_mirrored: [],
  vocabulary_missing: [],
  hallucination_risks: [],
  reasoning: 'verifier unavailable',
};
