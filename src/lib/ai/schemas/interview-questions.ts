import { z } from 'zod';

const technicalQ = z.object({
  question: z.string(),
  why_likely: z.string(), // 1-sentence — why the JD probably triggers this Q
});

const situationalQ = z.object({
  question: z.string(),
  why_likely: z.string(),
});

const behavioralQ = z.object({
  question: z.string(),
  star_scaffold: z.object({
    situation: z.string(),
    task: z.string(),
    action_hint: z.string(),
    result_hint: z.string(),
  }),
});

export const interviewQuestionsOutputSchema = z.object({
  technical: z.array(technicalQ),
  behavioral: z.array(behavioralQ),
  situational: z.array(situationalQ),
  meta_summary: z.string(),
});
export type InterviewQuestionsOutput = z.infer<typeof interviewQuestionsOutputSchema>;
