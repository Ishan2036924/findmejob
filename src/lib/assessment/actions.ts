'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { runResumeParser } from '@/lib/ai/agents/resume-parser-agent';
import { runAssessment } from '@/lib/ai/agents/assessment-agent';
import type { AssessmentInput } from '@/lib/ai/schemas/assessment';
import type { ResumeJson } from '@/lib/ai/schemas/profile';

const ASSESSMENT_FRESHNESS_DAYS = 7;

export type TriggerAssessmentResult =
  | { ok: true; assessmentId: string; fromCache: boolean }
  | { ok: false; error: string };

export async function triggerAssessment(): Promise<TriggerAssessmentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  // 1. Fetch profile
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile) {
    return { ok: false, error: 'Profile not found.' };
  }

  if (
    !profile.target_role_family ||
    !profile.target_seniority ||
    !profile.raw_resume_text
  ) {
    return { ok: false, error: 'Onboarding is incomplete.' };
  }

  // 2. Idempotency: return latest assessment if it's fresh enough
  const sevenDaysAgo = new Date(
    Date.now() - ASSESSMENT_FRESHNESS_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { data: recent } = await supabase
    .from('assessments')
    .select('id, created_at')
    .eq('profile_id', user.id)
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent) {
    return { ok: true, assessmentId: recent.id, fromCache: true };
  }

  // 3. Parse resume if we don't have resume_json yet
  let resumeJson: ResumeJson | null = profile.resume_json as ResumeJson | null;
  if (!resumeJson) {
    try {
      const parsed = await runResumeParser({ raw_text: profile.raw_resume_text });
      resumeJson = parsed.output;
      await supabase
        .from('profiles')
        .update({ resume_json: resumeJson, updated_at: new Date().toISOString() })
        .eq('id', user.id);
    } catch (err) {
      return {
        ok: false,
        error: `Resume parser failed: ${err instanceof Error ? err.message : 'unknown'}`,
      };
    }
  }

  // 4. Run assessment
  const assessmentInput: AssessmentInput = {
    profile: {
      target_role_family: profile.target_role_family,
      target_seniority: profile.target_seniority,
      target_location: profile.target_location ?? 'Delhi NCR',
      resume_json: resumeJson,
      linkedin_paste: profile.linkedin_paste ?? null,
      portfolio_urls: profile.portfolio_urls ?? [],
    },
  };

  let assessmentResult;
  try {
    assessmentResult = await runAssessment(assessmentInput);
  } catch (err) {
    return {
      ok: false,
      error: `Assessment failed: ${err instanceof Error ? err.message : 'unknown'}`,
    };
  }

  // 5. Persist + update profile pointer
  const { data: inserted, error: insertErr } = await supabase
    .from('assessments')
    .insert({
      profile_id: user.id,
      rubric_version: assessmentResult.rubric_version,
      model: assessmentResult.model,
      overall_score: assessmentResult.output.overall_score,
      dimensions: assessmentResult.output.dimensions,
      candid_summary: assessmentResult.output.candid_summary,
      next_steps: assessmentResult.output.next_steps,
      raw_response: assessmentResult.output,
      prompt_tokens: assessmentResult.usage.inputTokens,
      completion_tokens: assessmentResult.usage.outputTokens,
      cached_tokens: assessmentResult.usage.cacheReadTokens,
    })
    .select('id')
    .single();

  if (insertErr || !inserted) {
    return {
      ok: false,
      error: `Failed to save assessment: ${insertErr?.message ?? 'unknown'}`,
    };
  }

  await supabase
    .from('profiles')
    .update({ latest_assessment_id: inserted.id, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  revalidatePath('/dashboard');
  revalidatePath(`/assessment/${inserted.id}`);

  return { ok: true, assessmentId: inserted.id, fromCache: false };
}
