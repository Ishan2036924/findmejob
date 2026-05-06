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
 *
 * Retry: if first call returns zero edit_ops we re-call once with a stronger
 * "produce ≥4 edits" nudge before giving up. Caller treats applied=0 as a
 * surfaced error.
 */
export async function runTailor(input: TailorInput): Promise<TailorResult> {
  const parsed = tailorInputSchema.parse(input);

  const baseMessages = [
    cached({ role: 'system' as const, content: TAILOR_SYSTEM }, '1h'),
    cached(
      {
        role: 'user' as const,
        content: `## RESUME JSON (base)\n\n\`\`\`json\n${JSON.stringify(parsed.resume_json, null, 2)}\n\`\`\``,
      },
      '5m',
    ),
    cached(
      {
        role: 'user' as const,
        content: `## JOB\n\n${parsed.job.title} at ${parsed.job.company}\n\n${parsed.job.description}`,
      },
      '5m',
    ),
    {
      role: 'user' as const,
      content:
        "Produce edit_ops now per the schema and grounding rules. Use the candidate's actual experience; mirror JD vocabulary only when supported. Return only the JSON object.",
    },
  ];

  let result = await generateObject({
    model: MODELS.resumeTailor,
    schema: tailorOutputSchema,
    messages: baseMessages,
  });

  let cacheStats = extractCacheStats(result.providerMetadata);
  let inputTokens = result.usage.inputTokens ?? 0;
  let outputTokens = result.usage.outputTokens ?? 0;
  let cacheReadTokens = cacheStats.cacheReadTokens;
  let cacheWriteTokens = cacheStats.cacheWriteTokens;

  // Retry once if the agent returned zero edits — empty output is failure.
  if (result.object.edit_ops.length === 0) {
    console.warn('[tailor] empty_edit_ops on first call', {
      jobTitle: parsed.job.title,
      jobCompany: parsed.job.company,
    });

    const retryMessages = [
      ...baseMessages,
      {
        role: 'user' as const,
        content:
          'Your previous response had zero edits. The JD vocabulary clearly differs from the resume. Produce at least 4 edits now, focusing on the summary and the most JD-relevant experience bullets.',
      },
    ];

    const retryResult = await generateObject({
      model: MODELS.resumeTailor,
      schema: tailorOutputSchema,
      messages: retryMessages,
    });

    const retryCacheStats = extractCacheStats(retryResult.providerMetadata);
    inputTokens += retryResult.usage.inputTokens ?? 0;
    outputTokens += retryResult.usage.outputTokens ?? 0;
    cacheReadTokens += retryCacheStats.cacheReadTokens;
    cacheWriteTokens += retryCacheStats.cacheWriteTokens;

    if (retryResult.object.edit_ops.length === 0) {
      console.warn('[tailor] empty_edit_ops on retry', {
        jobTitle: parsed.job.title,
        jobCompany: parsed.job.company,
      });
    }

    result = retryResult;
  }

  return {
    output: result.object,
    model: MODEL_IDS.resumeTailor,
    system_version: TAILOR_SYSTEM_VERSION,
    usage: {
      inputTokens,
      outputTokens,
      cacheReadTokens,
      cacheWriteTokens,
    },
  };
}
