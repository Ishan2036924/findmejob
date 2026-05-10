import { generateObject } from 'ai';
import { MODELS, MODEL_IDS } from '../models';
import type { ResumeJson } from '../schemas/profile';
import type { JdAnalysis } from '../schemas/jd-analysis';
import {
  tailorVerificationSchema,
  TAILOR_VERIFICATION_STUB,
  type TailorVerification,
} from '../schemas/tailor-verification';
import {
  TAILOR_VERIFIER_SYSTEM,
  TAILOR_VERIFIER_VERSION,
} from '../prompts/system/tailor-verifier.system';

export type TailorVerifierInput = {
  analysis: JdAnalysis;
  originalResume: ResumeJson;
  tailoredResume: ResumeJson;
  job: { title: string; company: string };
};

export type TailorVerifierResult = {
  output: TailorVerification;
  model: string;
  system_version: string;
  usage: { inputTokens: number; outputTokens: number };
  /** True when the underlying generateObject call failed and we returned the stub. */
  fell_back: boolean;
};

/**
 * Step 3 of the v3 tailor pipeline: score the tailored resume against the JD
 * analysis. Drives the retry decision in tailor-agent (score < 70 ⇒ retry).
 *
 * Uses gpt-4.1-mini. Failures fall back to a score=0 stub so the caller can
 * still log and continue without crashing the user-facing flow.
 */
export async function verifyTailor(
  input: TailorVerifierInput,
): Promise<TailorVerifierResult> {
  const userMessage = `## JD ANALYSIS
${JSON.stringify(input.analysis, null, 2)}

## ORIGINAL RESUME
${JSON.stringify(input.originalResume)}

## TAILORED RESUME
${JSON.stringify(input.tailoredResume)}

## JOB
Title: ${input.job.title}
Company: ${input.job.company}`;

  try {
    const result = await generateObject({
      model: MODELS.extraction,
      schema: tailorVerificationSchema,
      messages: [
        { role: 'system', content: TAILOR_VERIFIER_SYSTEM },
        { role: 'user', content: userMessage },
        {
          role: 'user',
          content: 'Verify and score now per the schema. Return only the JSON object.',
        },
      ],
    });

    return {
      output: result.object,
      model: MODEL_IDS.extraction,
      system_version: TAILOR_VERIFIER_VERSION,
      usage: {
        inputTokens: result.usage.inputTokens ?? 0,
        outputTokens: result.usage.outputTokens ?? 0,
      },
      fell_back: false,
    };
  } catch (err) {
    console.warn('[tailor-verifier] failed; using stub verification', {
      jobTitle: input.job.title,
      jobCompany: input.job.company,
      error: err instanceof Error ? { name: err.name, message: err.message } : err,
    });
    return {
      output: TAILOR_VERIFICATION_STUB,
      model: MODEL_IDS.extraction,
      system_version: TAILOR_VERIFIER_VERSION,
      usage: { inputTokens: 0, outputTokens: 0 },
      fell_back: true,
    };
  }
}
