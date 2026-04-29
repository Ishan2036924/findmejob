'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { runTailor } from '@/lib/ai/agents/tailor-agent';
import { applyTailorOutput } from './edit-ops';
import type { ResumeJson } from '@/lib/ai/schemas/profile';

export type GenerateTailoredResumeResult =
  | { ok: true; resumeId: string; appliedOps: number; skippedOps: number }
  | { ok: false; error: string };

/**
 * Generate a tailored resume for an application.
 *
 * 1. Auth + ownership check on the application
 * 2. Fetch base resume_json from profile + job description
 * 3. Run runTailor (Sonnet 4.6) to produce edit_ops
 * 4. Apply edit_ops deterministically → tailored_resume_json
 * 5. INSERT into resumes (source='ai_tailored', target_job_id, compile_status='success')
 * 6. INSERT into generations (kind='resume_tailoring', application_id, resume_id, status='success')
 * 7. revalidate the application page so the artifact card flips to "View"
 */
export async function generateTailoredResume(
  applicationId: string,
): Promise<GenerateTailoredResumeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  // 1. Application + linked job
  const { data: application, error: appErr } = await supabase
    .from('applications')
    .select('id, job_id, profile_id')
    .eq('id', applicationId)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (appErr || !application) {
    return { ok: false, error: 'Application not found.' };
  }

  // 2. Profile (for base resume_json)
  const { data: profile } = await supabase
    .from('profiles')
    .select('resume_json')
    .eq('id', user.id)
    .single();

  if (!profile?.resume_json) {
    return {
      ok: false,
      error: 'Your base resume is missing. Re-run the assessment to parse it first.',
    };
  }

  // 3. Job
  const { data: job } = await supabase
    .from('jobs')
    .select('id, title, company, description, description_parsed')
    .eq('id', application.job_id)
    .maybeSingle();

  if (!job) {
    return { ok: false, error: 'Job linked to this application is missing.' };
  }

  const baseResume = profile.resume_json as ResumeJson;

  // 4. Tailor agent
  let tailorResult;
  try {
    tailorResult = await runTailor({
      resume_json: baseResume,
      job: {
        title: job.title,
        company: job.company,
        description: job.description,
        description_parsed: job.description_parsed,
      },
    });
  } catch (err) {
    console.error('[generateTailoredResume] runTailor failed', {
      applicationId,
      error: err instanceof Error ? { name: err.name, message: err.message } : err,
    });
    return {
      ok: false,
      error: `Tailor agent failed: ${err instanceof Error ? err.message : 'unknown'}`,
    };
  }

  // 5. Apply edit_ops
  const { resume: tailoredResume, applied, skipped } = applyTailorOutput(
    baseResume,
    tailorResult.output,
  );

  if (skipped.length > 0) {
    console.warn('[generateTailoredResume] some edit_ops skipped', {
      applicationId,
      appliedCount: applied,
      skippedCount: skipped.length,
      sample: skipped.slice(0, 3),
    });
  }

  // 6. Insert resume row (compile_status='success' since we render via HTML preview)
  const { data: resumeRow, error: resumeErr } = await supabase
    .from('resumes')
    .insert({
      profile_id: user.id,
      source: 'ai_tailored',
      resume_json: tailoredResume,
      target_job_id: job.id,
      compile_status: 'success',
    })
    .select('id')
    .single();

  if (resumeErr || !resumeRow) {
    console.error('[generateTailoredResume] insert resume failed', { resumeErr });
    return { ok: false, error: resumeErr?.message ?? 'Failed to save tailored resume.' };
  }

  // 7. Insert generation row tying back to the application
  const { error: genErr } = await supabase.from('generations').insert({
    profile_id: user.id,
    job_id: job.id,
    application_id: applicationId,
    kind: 'resume_tailoring',
    status: 'success',
    output: { meta_summary: tailorResult.output.meta_summary, applied, skipped: skipped.length },
    resume_id: resumeRow.id,
    model: tailorResult.model,
    prompt_tokens: tailorResult.usage.inputTokens,
    completion_tokens: tailorResult.usage.outputTokens,
    cached_tokens: tailorResult.usage.cacheReadTokens,
    completed_at: new Date().toISOString(),
  });

  if (genErr) {
    // Resume row is already saved; log but don't fail the flow.
    console.error('[generateTailoredResume] insert generation failed', { genErr });
  }

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath(`/applications/${applicationId}/resume/${resumeRow.id}`);

  return {
    ok: true,
    resumeId: resumeRow.id,
    appliedOps: applied,
    skippedOps: skipped.length,
  };
}
