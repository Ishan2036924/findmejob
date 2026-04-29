import { z } from 'zod';

// Strict-mode-safe (no .optional/.int/.min/.max — see assessment.ts notes).
export const coverLetterOutputSchema = z.object({
  letter: z.string(), // 200-400 words target, plain text with paragraph breaks
  meta_summary: z.string(), // 1-line "what got emphasized and why"
});
export type CoverLetterOutput = z.infer<typeof coverLetterOutputSchema>;
