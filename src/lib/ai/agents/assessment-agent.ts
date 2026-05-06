import { generateObject } from 'ai';
import { MODELS, MODEL_IDS } from '../models';
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
import type { ResumeJson } from '../schemas/profile';

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
 * Cap a resume body to keep the assessment input under ~30k chars. Senior AI/ML
 * resumes (User B in synth) blow past the 60s budget when long bullet text
 * hammers Sonnet. Truncate experience + project bullets to 200 chars each.
 */
function capResumeBody(resume: ResumeJson): ResumeJson {
  const serialized = JSON.stringify(resume);
  if (serialized.length <= 30000) return resume;
  return {
    ...resume,
    experience: resume.experience.map((e) => ({
      ...e,
      bullets: e.bullets.map((b) => b.slice(0, 200)),
    })),
    projects: resume.projects.map((p) => ({
      ...p,
      bullets: p.bullets.map((b) => b.slice(0, 200)),
    })),
  };
}

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

  if (family === 'other') {
    throw new Error(
      `No assessment rubric for role_family='other'. Pick a concrete role family. Available: ${Object.keys(RUBRICS).join(', ')}.`,
    );
  }
  const rubric = RUBRICS[family];

  const cappedResume = capResumeBody(parsed.profile.resume_json);
  const cappedProfile = { ...parsed.profile, resume_json: cappedResume };

  const result = await generateObject({
    model: MODELS.assessment,
    schema: assessmentOutputSchema,
    messages: [
      cached({ role: 'system', content: ASSESSMENT_SYSTEM }, '1h'),
      cached({ role: 'user', content: rubric.content }, '1h'),
      cached(
        {
          role: 'user',
          content: `## CANDIDATE PROFILE\n\n\`\`\`json\n${JSON.stringify(cappedProfile, null, 2)}\n\`\`\``,
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
  const totalIn = result.usage.inputTokens ?? 0;
  const ratio = totalIn > 0 ? cacheReadTokens / totalIn : 0;
  console.info(
    '[assessment] cache_read=' +
      cacheReadTokens +
      ' cache_creation=' +
      cacheWriteTokens +
      ' total=' +
      totalIn +
      ' ratio=' +
      ratio.toFixed(2),
  );

  return {
    output: result.object,
    model: MODEL_IDS.assessment,
    rubric_version: rubric.version,
    system_version: ASSESSMENT_SYSTEM_VERSION,
    usage: {
      inputTokens: totalIn,
      outputTokens: result.usage.outputTokens ?? 0,
      cacheReadTokens,
      cacheWriteTokens,
    },
  };
}
