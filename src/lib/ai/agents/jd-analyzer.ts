import { generateObject } from 'ai';
import { MODELS, MODEL_IDS } from '../models';
import {
  jdAnalysisSchema,
  JD_ANALYSIS_STUB,
  type JdAnalysis,
} from '../schemas/jd-analysis';
import {
  JD_ANALYZER_SYSTEM,
  JD_ANALYZER_VERSION,
} from '../prompts/system/jd-analyzer.system';

export type JdAnalyzerInput = {
  title: string;
  company: string;
  description: string;
};

export type JdAnalyzerResult = {
  output: JdAnalysis;
  model: string;
  system_version: string;
  usage: { inputTokens: number; outputTokens: number };
  /** True when the underlying generateObject call failed and we returned the stub. */
  fell_back: boolean;
};

/** Truncation guard. Most JDs are well under 4000 chars; long ones get clipped to keep latency + cost predictable. */
const MAX_DESCRIPTION_CHARS = 4000;

/**
 * Step 1 of the v3 tailor pipeline: extract structured signals from the JD
 * (must-haves / vocabulary / seniority / red flags) so downstream Sonnet has
 * concrete grounding rather than just a wall of JD text.
 *
 * Uses gpt-4.1-mini (cheap, structured-JSON friendly). Failures fall back to a
 * stub analysis so the tailor can still proceed.
 */
export async function analyzeJD(input: JdAnalyzerInput): Promise<JdAnalyzerResult> {
  const description = input.description.slice(0, MAX_DESCRIPTION_CHARS);

  try {
    const result = await generateObject({
      model: MODELS.extraction,
      schema: jdAnalysisSchema,
      messages: [
        { role: 'system', content: JD_ANALYZER_SYSTEM },
        {
          role: 'user',
          content: `## JOB\nTitle: ${input.title}\nCompany: ${input.company}\n\n## DESCRIPTION\n${description}`,
        },
        {
          role: 'user',
          content: 'Extract the structured analysis now per the schema. Return only the JSON object.',
        },
      ],
    });

    return {
      output: result.object,
      model: MODEL_IDS.extraction,
      system_version: JD_ANALYZER_VERSION,
      usage: {
        inputTokens: result.usage.inputTokens ?? 0,
        outputTokens: result.usage.outputTokens ?? 0,
      },
      fell_back: false,
    };
  } catch (err) {
    console.warn('[jd-analyzer] failed; using stub analysis', {
      jobTitle: input.title,
      jobCompany: input.company,
      error: err instanceof Error ? { name: err.name, message: err.message } : err,
    });
    return {
      output: JD_ANALYSIS_STUB,
      model: MODEL_IDS.extraction,
      system_version: JD_ANALYZER_VERSION,
      usage: { inputTokens: 0, outputTokens: 0 },
      fell_back: true,
    };
  }
}
