import { generateObject, type ModelMessage } from 'ai';
import { MODELS, MODEL_IDS } from '../models';
import { cached } from '../cache';
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
import { RUBRICS } from '../prompts/rubrics';

export type MatchScoreResult = {
  output: MatchScoreOutput;
  model: string;
  system_version: string;
  rubric_version: string | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
};

/**
 * Score a job against a candidate profile (0-100 + reasoning + gaps + strengths).
 * GPT-4.1 mini via direct provider SDK (BYOK). Auto-prefix-cached on stable
 * system + rubric + profile prefix when called repeatedly within a session.
 *
 * The rubric for the user's `target_role_family` is injected as a stable
 * cache-marked user message before the JD. The rubric is per-role stable, so
 * GPT-4.1 mini's automatic prefix caching gets a long stable prefix
 * (system + rubric) shared across every match-score call for the same role.
 * For 'other', no rubric is injected — falls back to system-prompt-only.
 */
export async function runMatchScore(input: MatchScoreInput): Promise<MatchScoreResult> {
  const parsed = matchScoreInputSchema.parse(input);
  const family = parsed.profile.target_role_family;
  const rubric = family === 'other' ? null : RUBRICS[family];

  const messages: ModelMessage[] = [
    cached({ role: 'system', content: MATCH_SCORE_SYSTEM }, '1h'),
    ...(rubric
      ? [
          cached(
            {
              role: 'user' as const,
              content: `## ROLE_RUBRIC\n${rubric.content}\n\nUse this rubric's dimensions and gap-detection patterns to ground your scoring. The candidate profile and JD follow.`,
            },
            '1h',
          ),
        ]
      : []),
    {
      role: 'user',
      content: `## CANDIDATE PROFILE\n\n\`\`\`json\n${JSON.stringify(parsed.profile, null, 2)}\n\`\`\``,
    },
    {
      role: 'user',
      content: `## JOB\n\n${parsed.job.title} at ${parsed.job.company}\n\n${parsed.job.description}\n\n## TASK\nProduce the match score now per the format. Return only the JSON object — no prose outside it.`,
    },
  ];

  const result = await generateObject({
    model: MODELS.matchScoring,
    schema: matchScoreOutputSchema,
    messages,
  });

  return {
    output: result.object,
    model: MODEL_IDS.matchScoring,
    system_version: MATCH_SCORE_SYSTEM_VERSION,
    rubric_version: rubric?.version ?? null,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
    },
  };
}
