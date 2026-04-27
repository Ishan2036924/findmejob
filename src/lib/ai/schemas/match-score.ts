import { z } from 'zod';
import { profileSchema } from './profile';

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
  score: z.number().int().min(0).max(100),
  reasoning: z.string(),
  gaps: z.array(z.string()).max(3),
  strengths: z.array(z.string()).max(3),
});
export type MatchScoreOutput = z.infer<typeof matchScoreOutputSchema>;
