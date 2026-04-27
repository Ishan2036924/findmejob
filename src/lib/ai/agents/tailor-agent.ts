import type { TailorInput, TailorOutput } from '../schemas/tailor';
import { MODELS } from '../models';
import { TAILOR_SYSTEM_VERSION } from '../prompts/system/tailor.system';

export type TailorResult = {
  output: TailorOutput;
  model: string;
  system_version: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
  };
};

/**
 * Resume tailor agent. Slice 1 wires this fully during build. Contract is
 * locked so server actions and DB writes can be authored against it now.
 *
 * Prompt structure (when implemented):
 *   [system]   TAILOR_SYSTEM            cached 1h
 *   [user]     resume_json              cached 5m
 *   [user]     job description          cached 5m
 *   [user]     "Now produce edits"      volatile
 */
export async function runTailor(_input: TailorInput): Promise<TailorResult> {
  void MODELS.resumeTailor;
  void TAILOR_SYSTEM_VERSION;
  throw new Error('runTailor() not implemented — fleshed out during Slice 1 build.');
}
