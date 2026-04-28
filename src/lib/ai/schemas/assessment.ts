import { z } from 'zod';
import { profileSchema } from './profile';

// Schema notes for LLM-output compatibility (Anthropic + OpenAI strict modes):
//   - No .min()/.max() on integers — providers reject `minimum`/`maximum`
//   - No .min()/.max() on arrays — providers reject `minItems`/`maxItems`
//   - No .int() — zod 4 converters add implicit JS-safe-integer bounds
//     (`minimum: -2^53, maximum: 2^53`) which providers also reject. Use
//     z.number() and instruct the LLM to return integers via the prompt.
//   - Constraints are described in the system prompt instead.

const dimensionAssessment = z.object({
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
  dimensions: z.record(z.string(), dimensionAssessment),
  candid_summary: z.string(),
  next_steps: z.array(nextStep),
});
export type AssessmentOutput = z.infer<typeof assessmentOutputSchema>;
