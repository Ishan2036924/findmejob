import { generateObject } from 'ai';
import { MODELS, MODEL_IDS } from '../models';
import {
  type MatchScoreInput,
  type MatchScoreOutput,
  matchScoreInputSchema,
  matchScoreOutputSchema,
} from '../schemas/match-score';
import {
  MATCH_SCORE_SYSTEM,
  MATCH_SCORE_SYSTEM_VERSION,
} from '../prompts/system/match-score.system';

export type MatchScoreResult = {
  output: MatchScoreOutput;
  model: string;
  system_version: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
};

/**
 * Score a job against a candidate profile (0-100 + reasoning + gaps + strengths).
 * GPT-4.1 mini via direct provider SDK (BYOK). Auto-prefix-cached on stable
 * system + profile prefix when called repeatedly within a session.
 */
export async function runMatchScore(input: MatchScoreInput): Promise<MatchScoreResult> {
  const parsed = matchScoreInputSchema.parse(input);

  const result = await generateObject({
    model: MODELS.matchScoring,
    schema: matchScoreOutputSchema,
    messages: [
      { role: 'system', content: MATCH_SCORE_SYSTEM },
      {
        role: 'user',
        content: `## CANDIDATE PROFILE\n\n\`\`\`json\n${JSON.stringify(parsed.profile, null, 2)}\n\`\`\``,
      },
      {
        role: 'user',
        content: `## JOB\n\n${parsed.job.title} at ${parsed.job.company}\n\n${parsed.job.description}\n\n## TASK\nProduce the match score now per the format. Return only the JSON object — no prose outside it.`,
      },
    ],
  });

  return {
    output: result.object,
    model: MODEL_IDS.matchScoring,
    system_version: MATCH_SCORE_SYSTEM_VERSION,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
    },
  };
}
