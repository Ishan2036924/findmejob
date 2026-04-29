import { generateObject } from 'ai';
import { MODELS, MODEL_IDS } from '../models';
import { jobExtractSchema, type JobExtract } from '../schemas/job-extract';
import {
  JOB_EXTRACTOR_SYSTEM,
  JOB_EXTRACTOR_SYSTEM_VERSION,
} from '../prompts/system/job-extractor.system';

export type JobExtractorInput = {
  raw_text: string; // HTML stripped to text, or raw JD paste
  source_url?: string | null; // hint for the source_url field if known
};

export type JobExtractorResult = {
  output: JobExtract;
  model: string;
  system_version: string;
  usage: { inputTokens: number; outputTokens: number };
};

/** Extract structured Job fields from arbitrary HTML / JD text. GPT-4.1 mini. */
export async function runJobExtractor(input: JobExtractorInput): Promise<JobExtractorResult> {
  const result = await generateObject({
    model: MODELS.extraction,
    schema: jobExtractSchema,
    messages: [
      { role: 'system', content: JOB_EXTRACTOR_SYSTEM },
      {
        role: 'user',
        content: input.source_url
          ? `## SOURCE URL\n${input.source_url}\n\n## INPUT\n${input.raw_text}`
          : `## INPUT\n${input.raw_text}`,
      },
      {
        role: 'user',
        content:
          'Extract the structured fields now per the schema. Return only the JSON object.',
      },
    ],
  });

  return {
    output: result.object,
    model: MODEL_IDS.extraction,
    system_version: JOB_EXTRACTOR_SYSTEM_VERSION,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
    },
  };
}
