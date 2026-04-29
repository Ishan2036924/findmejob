import { generateObject } from 'ai';
import { MODELS, MODEL_IDS } from '../models';
import {
  practiceFeedbackSchema,
  type PracticeFeedback,
  type PracticeQuestionType,
} from '../schemas/practice';
import {
  PRACTICE_SYSTEM,
  PRACTICE_SYSTEM_VERSION,
} from '../prompts/system/practice.system';
import type { ResumeJson } from '../schemas/profile';

export type PracticeInput = {
  question: string;
  question_type: PracticeQuestionType;
  user_answer: string;
  resume_json: ResumeJson;
  job: { title: string; company: string; description: string };
};

export type PracticeResult = {
  output: PracticeFeedback;
  model: string;
  system_version: string;
  usage: { inputTokens: number; outputTokens: number };
};

export async function runPracticeFeedback(input: PracticeInput): Promise<PracticeResult> {
  const result = await generateObject({
    model: MODELS.interviewPrep, // re-use mini; same workload class
    schema: practiceFeedbackSchema,
    messages: [
      { role: 'system', content: PRACTICE_SYSTEM },
      {
        role: 'user',
        content: `## CONTEXT\n\nJob: ${input.job.title} at ${input.job.company}\n\nQuestion type: ${input.question_type}\n\nQuestion:\n${input.question}\n\n## CANDIDATE'S RESUME\n\`\`\`json\n${JSON.stringify(input.resume_json, null, 2)}\n\`\`\`\n\n## JOB DESCRIPTION\n${input.job.description}`,
      },
      {
        role: 'user',
        content: `## CANDIDATE'S TYPED ANSWER\n\n${input.user_answer}\n\n## TASK\nScore this answer per the rubric and return only the JSON object.`,
      },
    ],
  });

  return {
    output: result.object,
    model: MODEL_IDS.interviewPrep,
    system_version: PRACTICE_SYSTEM_VERSION,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
    },
  };
}
