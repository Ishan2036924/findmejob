import type { MatchScoreInput, MatchScoreOutput } from '../schemas/match-score';
import { MODELS } from '../models';
import { MATCH_SCORE_SYSTEM_VERSION } from '../prompts/system/match-score.system';

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
 * Match-scoring agent. GPT-4.1 mini, auto-prefix-cache. Wired during Slice 1
 * build (lazy invocation from the feed view).
 */
export async function runMatchScore(_input: MatchScoreInput): Promise<MatchScoreResult> {
  void MODELS.matchScoring;
  void MATCH_SCORE_SYSTEM_VERSION;
  throw new Error('runMatchScore() not implemented — fleshed out during Slice 1 build.');
}
