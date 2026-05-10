import { generateObject, type ModelMessage } from 'ai';
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
import type { ResumeJson } from '../schemas/profile';
import { applyTailorOutput, type ApplyResult } from '@/lib/resume/edit-ops';
import { analyzeJD } from './jd-analyzer';
import { verifyTailor } from './tailor-verifier';
import type { JdAnalysis } from '../schemas/jd-analysis';
import type { TailorVerification } from '../schemas/tailor-verification';

/** Score below which the verifier triggers a one-shot Sonnet retry. */
const VERIFIER_RETRY_THRESHOLD = 70;

export type TailorUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
};

export type TailorResult = {
  output: TailorOutput;
  /** The resume_json after edit_ops are applied — the persistable artifact. */
  tailored_resume: ResumeJson;
  applied: number;
  skipped: ApplyResult['skipped'];
  /** Step 1 output. */
  jd_analysis: JdAnalysis;
  /** Step 3 output (latest, post-retry if any). */
  verifier: TailorVerification;
  /** True when we ran the verifier-driven Sonnet retry (score < 70). */
  retried: boolean;
  /** True when the first Sonnet call returned 0 edit_ops and we re-prompted. */
  empty_retried: boolean;
  model: string;
  system_version: string;
  /** Aggregated Sonnet usage across all tailor calls (analyzer/verifier usage tracked separately). */
  usage: TailorUsage;
};

/**
 * Build the canonical tailor message stack: cached system + cached resume_json
 * + cached JD analysis + JD body. Volatile "produce edits now" message is
 * appended by the caller so retries can replace it without busting the cache.
 */
function buildBaseMessages(
  resume_json: ResumeJson,
  job: TailorInput['job'],
  analysis: JdAnalysis,
): ModelMessage[] {
  return [
    cached({ role: 'system', content: TAILOR_SYSTEM }, '1h'),
    cached(
      {
        role: 'user',
        content: `## RESUME JSON (base)\n\n\`\`\`json\n${JSON.stringify(resume_json, null, 2)}\n\`\`\``,
      },
      '5m',
    ),
    cached(
      {
        role: 'user',
        content: `## JD ANALYSIS (ground truth for which gaps to address)\n\n\`\`\`json\n${JSON.stringify(analysis, null, 2)}\n\`\`\``,
      },
      '5m',
    ),
    cached(
      {
        role: 'user',
        content: `## JOB\n\n${job.title} at ${job.company}\n\n${job.description}`,
      },
      '5m',
    ),
  ];
}

async function callSonnet(messages: ModelMessage[]): Promise<{
  output: TailorOutput;
  usage: TailorUsage;
}> {
  const result = await generateObject({
    model: MODELS.resumeTailor,
    schema: tailorOutputSchema,
    messages,
  });

  const cacheStats = extractCacheStats(result.providerMetadata);
  return {
    output: result.object,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
      cacheReadTokens: cacheStats.cacheReadTokens,
      cacheWriteTokens: cacheStats.cacheWriteTokens,
    },
  };
}

function addUsage(a: TailorUsage, b: TailorUsage): TailorUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
    cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens,
  };
}

/**
 * Resume tailoring agent — v3 multi-step pipeline (Reflexion / Plan-Act-Reflect).
 *
 * Step 1 (mini)   analyzeJD       extract must_haves, vocabulary, red_flags
 * Step 2 (Sonnet) callSonnet      produce edit_ops with analysis as ground truth
 *                 [retry if applied=0, same as v2]
 * Step 3 (mini)   verifyTailor    score 0-100; flag missing must_haves + hallucination
 * Step 4 (Sonnet) callSonnet      one retry if verifier score < 70 AND we have edits
 *                 + verifier feedback baked into the user message
 *
 * Multi-step on Sonnet ≈ Opus quality at ~⅓ the cost. Cost per invocation:
 *   ~1k tokens mini (analyzer) + ~6-12k Sonnet (cached prefix) + ~3-5k mini (verifier)
 *   + rare retry (~6-12k Sonnet again).
 *
 * The function preserves the v2 contract: callers still receive { output,
 * model, system_version, usage } — extended with applied / tailored_resume /
 * jd_analysis / verifier / retried so the action layer can persist the meta.
 */
export async function runTailor(input: TailorInput): Promise<TailorResult> {
  const parsed = tailorInputSchema.parse(input);
  const baseResume = parsed.resume_json;

  // ── Step 1: JD analysis ───────────────────────────────────────────────────
  const analyzer = await analyzeJD({
    title: parsed.job.title,
    company: parsed.job.company,
    description: parsed.job.description,
  });
  const analysis = analyzer.output;

  // ── Step 2: Sonnet tailor (with empty-output retry preserved from v2) ─────
  const baseMessages = buildBaseMessages(baseResume, parsed.job, analysis);
  const firstNudge: ModelMessage = {
    role: 'user',
    content:
      "Produce edit_ops now per the schema and grounding rules. Walk the JD ANALYSIS must_haves; address each one where the candidate has truthful evidence. Mirror analysis.vocabulary verbatim where supported. Return only the JSON object.",
  };

  let { output, usage } = await callSonnet([...baseMessages, firstNudge]);
  let applyResult = applyTailorOutput(baseResume, output);
  let empty_retried = false;

  if (output.edit_ops.length === 0) {
    console.warn('[tailor] empty_edit_ops on first call', {
      jobTitle: parsed.job.title,
      jobCompany: parsed.job.company,
    });
    empty_retried = true;

    const retryMessages: ModelMessage[] = [
      ...baseMessages,
      firstNudge,
      {
        role: 'user',
        content:
          'Your previous response had zero edits. The JD vocabulary clearly differs from the resume. Produce at least 4 edits now, focusing on the summary and the most JD-relevant experience bullets — driven by the JD ANALYSIS must_haves and vocabulary.',
      },
    ];

    const retry = await callSonnet(retryMessages);
    usage = addUsage(usage, retry.usage);
    output = retry.output;
    applyResult = applyTailorOutput(baseResume, output);

    if (output.edit_ops.length === 0) {
      console.warn('[tailor] empty_edit_ops on retry', {
        jobTitle: parsed.job.title,
        jobCompany: parsed.job.company,
      });
    }
  }

  // ── Step 3: verifier ──────────────────────────────────────────────────────
  let verifierResult = await verifyTailor({
    analysis,
    originalResume: baseResume,
    tailoredResume: applyResult.resume,
    job: { title: parsed.job.title, company: parsed.job.company },
  });

  let retried = false;

  // ── Step 4: verifier-driven Sonnet retry (score<70 AND we have edits) ────
  if (
    verifierResult.output.score < VERIFIER_RETRY_THRESHOLD &&
    applyResult.applied > 0 &&
    !verifierResult.fell_back
  ) {
    retried = true;
    console.warn('[tailor] verifier score below threshold; retrying', {
      score: verifierResult.output.score,
      missing: verifierResult.output.must_haves_missing.slice(0, 5),
      jobTitle: parsed.job.title,
    });

    const feedbackBlock = `Your previous tailoring scored ${verifierResult.output.score}/100. Specific gaps to fix:

Missing must_haves (analysis):
${verifierResult.output.must_haves_missing.map((m) => `- ${m}`).join('\n') || '- (none reported)'}

Missing vocabulary (analysis):
${verifierResult.output.vocabulary_missing.map((v) => `- ${v}`).join('\n') || '- (none reported)'}

Hallucination risks flagged (must remove or restate truthfully):
${verifierResult.output.hallucination_risks.map((h) => `- ${h}`).join('\n') || '- (none)'}

Verifier reasoning: ${verifierResult.output.reasoning}

Produce a NEW set of 4-12 edit_ops that addresses these specific gaps using the candidate's actual resume evidence. Do NOT fabricate. Return only the JSON object.`;

    const retryMessages: ModelMessage[] = [
      ...baseMessages,
      firstNudge,
      { role: 'user', content: feedbackBlock },
    ];

    const retry = await callSonnet(retryMessages);
    usage = addUsage(usage, retry.usage);

    // Only accept the retry if it produced edits — otherwise keep the first attempt.
    if (retry.output.edit_ops.length > 0) {
      const retryApply = applyTailorOutput(baseResume, retry.output);
      if (retryApply.applied > 0) {
        output = retry.output;
        applyResult = retryApply;
        verifierResult = await verifyTailor({
          analysis,
          originalResume: baseResume,
          tailoredResume: applyResult.resume,
          job: { title: parsed.job.title, company: parsed.job.company },
        });
      } else {
        console.warn('[tailor] verifier retry produced ops but none applied; keeping first pass');
      }
    } else {
      console.warn('[tailor] verifier retry produced 0 edits; keeping first pass');
    }
  }

  return {
    output,
    tailored_resume: applyResult.resume,
    applied: applyResult.applied,
    skipped: applyResult.skipped,
    jd_analysis: analysis,
    verifier: verifierResult.output,
    retried,
    empty_retried,
    model: MODEL_IDS.resumeTailor,
    system_version: TAILOR_SYSTEM_VERSION,
    usage,
  };
}
