import { generateObject } from 'ai';
import { MODELS, MODEL_IDS } from '../models';
import {
  interviewQuestionsOutputSchema,
  type InterviewQuestionsOutput,
} from '../schemas/interview-questions';
import {
  INTERVIEW_QUESTIONS_SYSTEM,
  INTERVIEW_QUESTIONS_SYSTEM_VERSION,
} from '../prompts/system/interview-questions.system';
import type { ResumeJson } from '../schemas/profile';

export type InterviewQuestionsInput = {
  resume_json: ResumeJson;
  job: { title: string; company: string; description: string };
};

export type InterviewQuestionsResult = {
  output: InterviewQuestionsOutput;
  model: string;
  system_version: string;
  usage: { inputTokens: number; outputTokens: number };
};

export async function runInterviewQuestions(
  input: InterviewQuestionsInput,
): Promise<InterviewQuestionsResult> {
  const result = await generateObject({
    model: MODELS.interviewPrep,
    schema: interviewQuestionsOutputSchema,
    messages: [
      { role: 'system', content: INTERVIEW_QUESTIONS_SYSTEM },
      {
        role: 'user',
        content: `## CANDIDATE RESUME\n\n\`\`\`json\n${JSON.stringify(input.resume_json, null, 2)}\n\`\`\``,
      },
      {
        role: 'user',
        content: `## JOB\n\n${input.job.title} at ${input.job.company}\n\n${input.job.description}\n\n## TASK\nGenerate the interview questions per the schema (5 technical, 4 behavioral with STAR scaffolds, 3 situational). Return only the JSON object.`,
      },
    ],
  });

  return {
    output: result.object,
    model: MODEL_IDS.interviewPrep,
    system_version: INTERVIEW_QUESTIONS_SYSTEM_VERSION,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
    },
  };
}
