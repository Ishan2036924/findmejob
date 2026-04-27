import { generateObject } from 'ai';
import { MODELS } from '../models';
import { cached, extractCacheStats } from '../cache';
import {
  type AssessmentInput,
  type AssessmentOutput,
  assessmentInputSchema,
  assessmentOutputSchema,
} from '../schemas/assessment';
import {
  ASSESSMENT_SYSTEM,
  ASSESSMENT_SYSTEM_VERSION,
} from '../prompts/system/assessment.system';
import { RUBRICS } from '../prompts/rubrics';

export type AssessmentResult = {
  output: AssessmentOutput;
  model: string;
  rubric_version: string;
  system_version: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
  };
};

/**
 * Run a candid, rubric-grounded profile assessment using Sonnet 4.6.
 *
 * Slice 1 supports swe + data_ml only — other role families throw with a clear
 * error so the UI can surface "rubric not yet available for your role family".
 *
 * Prompt structure (cache-optimized):
 *   [system]   ASSESSMENT_SYSTEM         cached 1h (rare changes)
 *   [user]     RUBRIC for role_family    cached 1h (per-role stable)
 *   [user]     profile JSON              cached 5m (per-session stable)
 *   [user]     "Now produce the assessment"  volatile
 */
export async function runAssessment(input: AssessmentInput): Promise<AssessmentResult> {
  const parsed = assessmentInputSchema.parse(input);
  const family = parsed.profile.target_role_family;
  const rubric = RUBRICS[family];

  if (!rubric) {
    throw new Error(
      `No assessment rubric for role_family='${family}' yet. Slice 1 supports: ${Object.keys(RUBRICS).join(', ')}.`,
    );
  }

  const result = await generateObject({
    model: MODELS.assessment,
    schema: assessmentOutputSchema,
    messages: [
      cached({ role: 'system', content: ASSESSMENT_SYSTEM }, '1h'),
      cached({ role: 'user', content: rubric.content }, '1h'),
      cached(
        {
          role: 'user',
          content: `## CANDIDATE PROFILE\n\n\`\`\`json\n${JSON.stringify(parsed.profile, null, 2)}\n\`\`\``,
        },
        '5m',
      ),
      {
        role: 'user',
        content:
          'Produce the assessment now per the rubric and output format. Return only the JSON object — no prose outside it.',
      },
    ],
  });

  const { cacheReadTokens, cacheWriteTokens } = extractCacheStats(result.providerMetadata);

  return {
    output: result.object,
    model: MODELS.assessment,
    rubric_version: rubric.version,
    system_version: ASSESSMENT_SYSTEM_VERSION,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
      cacheReadTokens,
      cacheWriteTokens,
    },
  };
}
