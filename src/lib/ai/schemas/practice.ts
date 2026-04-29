import { z } from 'zod';

export const practiceQuestionType = z.enum(['technical', 'behavioral', 'situational']);
export type PracticeQuestionType = z.infer<typeof practiceQuestionType>;

export const practiceFeedbackSchema = z.object({
  score: z.number(), // 0-10
  strengths: z.array(z.string()), // 1-3 specific
  improvements: z.array(z.string()), // 2-4 specific, actionable
  ideal_answer_outline: z.string(), // 2-3 bullets, not full answer
  meta_summary: z.string(), // 1-line take
});
export type PracticeFeedback = z.infer<typeof practiceFeedbackSchema>;
