import { generateObject } from 'ai';
import { MODELS, MODEL_IDS } from '../models';
import { companyBriefOutputSchema, type CompanyBriefOutput } from '../schemas/company-brief';
import {
  COMPANY_BRIEF_SYSTEM,
  COMPANY_BRIEF_SYSTEM_VERSION,
} from '../prompts/system/company-brief.system';

export type CompanyBriefInput = {
  job: { title: string; company: string; description: string };
};

export type CompanyBriefResult = {
  output: CompanyBriefOutput;
  model: string;
  system_version: string;
  usage: { inputTokens: number; outputTokens: number };
};

export async function runCompanyBrief(input: CompanyBriefInput): Promise<CompanyBriefResult> {
  const result = await generateObject({
    model: MODELS.companyBrief,
    schema: companyBriefOutputSchema,
    messages: [
      { role: 'system', content: COMPANY_BRIEF_SYSTEM },
      {
        role: 'user',
        content: `## JOB\n\n${input.job.title} at ${input.job.company}\n\n${input.job.description}\n\n## TASK\nProduce the briefing now. Use ONLY information visible in the JD — no external knowledge. Return only the JSON object.`,
      },
    ],
  });

  return {
    output: result.object,
    model: MODEL_IDS.companyBrief,
    system_version: COMPANY_BRIEF_SYSTEM_VERSION,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
    },
  };
}
