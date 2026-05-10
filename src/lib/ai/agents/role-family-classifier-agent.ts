import 'server-only';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  ROLE_FAMILY_CLASSIFIER_SYSTEM,
  ROLE_FAMILY_CLASSIFIER_VERSION,
} from '../prompts/system/role-family-classifier.system';
import {
  roleFamilyClassificationSchema,
  type RoleFamilyClassification,
} from '../schemas/role-family-classification';

const MODEL_ID = 'gpt-4.1-mini';

export type ClassifyRoleFamilyInput = {
  title: string;
  company: string;
  description: string;
};

export type ClassifyRoleFamilyResult = {
  output: RoleFamilyClassification;
  model: string;
  system_version: string;
};

/**
 * Classify a single job posting into one of 17 role families + 'other'.
 * Used by the daily ingest pipeline so the feed and scorer can filter to the
 * user's target family + adjacent ones.
 *
 * Cost: ~$0.0003/job at gpt-4.1-mini. Fail-open returns 'other' on any error.
 */
export async function classifyRoleFamily(
  input: ClassifyRoleFamilyInput,
): Promise<ClassifyRoleFamilyResult> {
  const truncated = (input.description ?? '').slice(0, 1500);
  try {
    const result = await generateObject({
      model: openai(MODEL_ID),
      schema: roleFamilyClassificationSchema,
      messages: [
        { role: 'system', content: ROLE_FAMILY_CLASSIFIER_SYSTEM },
        {
          role: 'user',
          content: `Title: ${input.title}\nCompany: ${input.company}\n\nDescription:\n${truncated}`,
        },
      ],
    });
    return {
      output: result.object,
      model: MODEL_ID,
      system_version: ROLE_FAMILY_CLASSIFIER_VERSION,
    };
  } catch (err) {
    console.error('[classifyRoleFamily] threw — falling back to other', err);
    return {
      output: { role_family: 'other', confidence: 0 },
      model: MODEL_ID,
      system_version: ROLE_FAMILY_CLASSIFIER_VERSION,
    };
  }
}
