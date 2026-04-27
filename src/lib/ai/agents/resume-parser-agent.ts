import { generateObject } from 'ai';
import { MODELS, MODEL_IDS } from '../models';
import { resumeJsonSchema, type ResumeJson } from '../schemas/profile';
import {
  RESUME_PARSER_SYSTEM,
  RESUME_PARSER_SYSTEM_VERSION,
} from '../prompts/system/resume-parser.system';

export type ResumeParserInput = {
  raw_text: string;
};

export type ResumeParserResult = {
  output: ResumeJson;
  model: string;
  system_version: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
};

/**
 * Convert raw resume text (paste-in or PDF-extracted) into structured resume_json.
 * Uses GPT-4.1 mini (strict-JSON reliable). Run once per profile; cache result.
 */
export async function runResumeParser(input: ResumeParserInput): Promise<ResumeParserResult> {
  const result = await generateObject({
    model: MODELS.extraction,
    schema: resumeJsonSchema,
    messages: [
      { role: 'system', content: RESUME_PARSER_SYSTEM },
      {
        role: 'user',
        content: `## RESUME TEXT\n\n${input.raw_text}\n\n## TASK\nExtract this into the schema. Return only the JSON object.`,
      },
    ],
  });

  return {
    output: result.object,
    model: MODEL_IDS.extraction,
    system_version: RESUME_PARSER_SYSTEM_VERSION,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
    },
  };
}
