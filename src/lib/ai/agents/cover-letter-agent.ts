import { generateObject } from 'ai';
import { MODELS, MODEL_IDS } from '../models';
import { coverLetterOutputSchema, type CoverLetterOutput } from '../schemas/cover-letter';
import {
  COVER_LETTER_SYSTEM,
  COVER_LETTER_SYSTEM_VERSION,
} from '../prompts/system/cover-letter.system';
import type { ResumeJson } from '../schemas/profile';

export type CoverLetterInput = {
  resume_json: ResumeJson;
  job: { title: string; company: string; description: string };
};

export type CoverLetterResult = {
  output: CoverLetterOutput;
  model: string;
  system_version: string;
  usage: { inputTokens: number; outputTokens: number };
};

export async function runCoverLetter(input: CoverLetterInput): Promise<CoverLetterResult> {
  const result = await generateObject({
    model: MODELS.coverLetter,
    schema: coverLetterOutputSchema,
    messages: [
      { role: 'system', content: COVER_LETTER_SYSTEM },
      {
        role: 'user',
        content: `## CANDIDATE RESUME\n\n\`\`\`json\n${JSON.stringify(input.resume_json, null, 2)}\n\`\`\``,
      },
      {
        role: 'user',
        content: `## JOB\n\n${input.job.title} at ${input.job.company}\n\n${input.job.description}\n\n## TASK\nWrite the cover letter now per the schema. Return only the JSON object.`,
      },
    ],
  });

  return {
    output: result.object,
    model: MODEL_IDS.coverLetter,
    system_version: COVER_LETTER_SYSTEM_VERSION,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
    },
  };
}
