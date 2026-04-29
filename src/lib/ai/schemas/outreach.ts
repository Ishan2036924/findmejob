import { z } from 'zod';

const outreachDraft = z.object({
  subject: z.string(),
  body: z.string(),
  length_words: z.number(), // approx wordcount, sanity check
});

export const outreachOutputSchema = z.object({
  recruiter: outreachDraft,
  hiring_manager: outreachDraft,
  referral: outreachDraft,
  meta_summary: z.string(),
});
export type OutreachOutput = z.infer<typeof outreachOutputSchema>;
