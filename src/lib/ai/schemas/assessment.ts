import { z } from 'zod';
import { profileSchema } from './profile';

// Schema notes for LLM-output compatibility (Anthropic + OpenAI strict modes):
//   - No .min()/.max() on numbers — providers reject `minimum`/`maximum`
//   - No .min()/.max() on arrays — providers reject `minItems`/`maxItems`
//   - No .int() — zod 4 converters add implicit JS-safe-integer bounds
//   - No z.record(...) — converters add `propertyNames`, providers reject it
//     Use z.array() of objects with a `name` field instead.
//   - Constraints described in the system prompt; validate post-parse if needed.

const dimensionAssessment = z.object({
  name: z.string(),
  score: z.number().nullable(),
  evidence: z.string(),
  gaps: z.array(z.string()),
  strengths: z.array(z.string()),
});
export type DimensionAssessment = z.infer<typeof dimensionAssessment>;

const nextStep = z.object({
  priority: z.enum(['high', 'medium', 'low']),
  action: z.string(),
  why: z.string(),
  time_estimate: z.string(),
});
export type NextStep = z.infer<typeof nextStep>;

export const assessmentInputSchema = z.object({
  profile: profileSchema,
});
export type AssessmentInput = z.infer<typeof assessmentInputSchema>;

export const assessmentOutputSchema = z.object({
  overall_score: z.number(),
  dimensions: z.array(dimensionAssessment),
  candid_summary: z.string(),
  next_steps: z.array(nextStep),
});
export type AssessmentOutput = z.infer<typeof assessmentOutputSchema>;
