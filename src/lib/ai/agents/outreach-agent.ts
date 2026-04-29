import { generateObject } from 'ai';
import { MODELS, MODEL_IDS } from '../models';
import { outreachOutputSchema, type OutreachOutput } from '../schemas/outreach';
import {
  OUTREACH_SYSTEM,
  OUTREACH_SYSTEM_VERSION,
} from '../prompts/system/outreach.system';
import type { ResumeJson } from '../schemas/profile';

export type OutreachInput = {
  resume_json: ResumeJson;
  job: { title: string; company: string; description: string };
};

export type OutreachResult = {
  output: OutreachOutput;
  model: string;
  system_version: string;
  usage: { inputTokens: number; outputTokens: number };
};

export async function runOutreach(input: OutreachInput): Promise<OutreachResult> {
  const result = await generateObject({
    model: MODELS.outreach,
    schema: outreachOutputSchema,
    messages: [
      { role: 'system', content: OUTREACH_SYSTEM },
      {
        role: 'user',
        content: `## CANDIDATE RESUME\n\n\`\`\`json\n${JSON.stringify(input.resume_json, null, 2)}\n\`\`\``,
      },
      {
        role: 'user',
        content: `## JOB\n\n${input.job.title} at ${input.job.company}\n\n${input.job.description}\n\n## TASK\nWrite the 3 outreach drafts (recruiter, hiring_manager, referral) per the schema. Return only the JSON object.`,
      },
    ],
  });

  return {
    output: result.object,
    model: MODEL_IDS.outreach,
    system_version: OUTREACH_SYSTEM_VERSION,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
    },
  };
}
