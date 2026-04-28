import { z } from 'zod';
import { profileSchema } from './profile';

// Schema notes for LLM-output compatibility (Anthropic + OpenAI strict modes):
//   - No .min()/.max() on integers — providers reject `minimum`/`maximum` on type:integer
//   - No .min()/.max() on arrays — providers reject `minItems`/`maxItems`
//   - Constraints are described in the system prompt instead and enforced
//     post-hoc with .refine() if needed.

const dimensionAssessment = z.object({
  score: z.number().int().nullable(),
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
  overall_score: z.number().int(),
  dimensions: z.record(z.string(), dimensionAssessment),
  candid_summary: z.string(),
  next_steps: z.array(nextStep),
});
export type AssessmentOutput = z.infer<typeof assessmentOutputSchema>;
