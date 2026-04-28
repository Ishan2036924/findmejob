import { z } from 'zod';
import { profileSchema } from './profile';

// See notes in ./assessment.ts re: no .min()/.max() on integers/arrays for
// LLM-output compatibility. Constraints described in the system prompt.

export const matchScoreInputSchema = z.object({
  profile: profileSchema,
  job: z.object({
    title: z.string(),
    company: z.string(),
    description: z.string(),
  }),
});
export type MatchScoreInput = z.infer<typeof matchScoreInputSchema>;

export const matchScoreOutputSchema = z.object({
  score: z.number().int(),
  reasoning: z.string(),
  gaps: z.array(z.string()),
  strengths: z.array(z.string()),
});
export type MatchScoreOutput = z.infer<typeof matchScoreOutputSchema>;
