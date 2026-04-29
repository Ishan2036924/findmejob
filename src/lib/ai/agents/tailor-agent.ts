import { generateObject } from 'ai';
import { MODELS, MODEL_IDS } from '../models';
import { cached, extractCacheStats } from '../cache';
import {
  type TailorInput,
  type TailorOutput,
  tailorInputSchema,
  tailorOutputSchema,
} from '../schemas/tailor';
import {
  TAILOR_SYSTEM,
  TAILOR_SYSTEM_VERSION,
} from '../prompts/system/tailor.system';

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
 * Resume tailoring agent — Sonnet 4.6.
 *
 * Prompt structure (cache-optimized):
 *   [system]   TAILOR_SYSTEM             cached 1h (rare changes)
 *   [user]     resume_json (base)         cached 5m (per-session stable)
 *   [user]     job description            cached 5m (per-application stable)
 *   [user]     "Now produce edits"        volatile
 *
 * Output: { edit_ops[], meta_summary }. The caller applies edit_ops to
 * resume_json deterministically (see src/lib/resume/edit-ops.ts).
 */
export async function runTailor(input: TailorInput): Promise<TailorResult> {
  const parsed = tailorInputSchema.parse(input);

  const result = await generateObject({
    model: MODELS.resumeTailor,
    schema: tailorOutputSchema,
    messages: [
      cached({ role: 'system', content: TAILOR_SYSTEM }, '1h'),
      cached(
        {
          role: 'user',
          content: `## RESUME JSON (base)\n\n\`\`\`json\n${JSON.stringify(parsed.resume_json, null, 2)}\n\`\`\``,
        },
        '5m',
      ),
      cached(
        {
          role: 'user',
          content: `## JOB\n\n${parsed.job.title} at ${parsed.job.company}\n\n${parsed.job.description}`,
        },
        '5m',
      ),
      {
        role: 'user',
        content:
          'Produce edit_ops now per the schema and grounding rules. Use the candidate\'s actual experience; mirror JD vocabulary only when supported. Return only the JSON object.',
      },
    ],
  });

  const { cacheReadTokens, cacheWriteTokens } = extractCacheStats(result.providerMetadata);

  return {
    output: result.object,
    model: MODEL_IDS.resumeTailor,
    system_version: TAILOR_SYSTEM_VERSION,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
      cacheReadTokens,
      cacheWriteTokens,
    },
  };
}
