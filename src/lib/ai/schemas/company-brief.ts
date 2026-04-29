import { z } from 'zod';

export const companyBriefOutputSchema = z.object({
  what_they_do: z.string(), // 2-3 sentence overview inferred from JD context
  signals_from_jd: z.array(z.string()), // culture/practices visible in JD wording
  questions_to_ask: z.array(z.string()), // 3-5 thoughtful interviewer questions
  red_flags: z.array(z.string()), // anything in JD that should give pause; can be empty
  meta_summary: z.string(),
});
export type CompanyBriefOutput = z.infer<typeof companyBriefOutputSchema>;
