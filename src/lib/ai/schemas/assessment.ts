import { z } from 'zod';
import { profileSchema } from './profile';

const dimensionAssessment = z.object({
  score: z.number().int().min(0).max(100).nullable(),
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
  overall_score: z.number().int().min(0).max(100),
  dimensions: z.record(z.string(), dimensionAssessment),
  candid_summary: z.string(),
  next_steps: z.array(nextStep).min(3).max(7),
});
export type AssessmentOutput = z.infer<typeof assessmentOutputSchema>;
