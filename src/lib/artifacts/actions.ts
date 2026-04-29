'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { runCoverLetter } from '@/lib/ai/agents/cover-letter-agent';
import { runCompanyBrief } from '@/lib/ai/agents/company-brief-agent';
import { runInterviewQuestions } from '@/lib/ai/agents/interview-questions-agent';
import { runOutreach } from '@/lib/ai/agents/outreach-agent';
import type { ResumeJson } from '@/lib/ai/schemas/profile';

type ArtifactKind = 'cover_letter' | 'company_brief' | 'interview_questions' | 'outreach_drafts';

export type GenerateArtifactResult =
  | { ok: true; generationId: string }
  | { ok: false; error: string };

async function loadContext(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const { data: application } = await supabase
    .from('applications')
    .select('id, job_id')
    .eq('id', applicationId)
    .eq('profile_id', user.id)
    .maybeSingle();
  if (!application) return { ok: false as const, error: 'Application not found.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('resume_json')
    .eq('id', user.id)
    .single();
  if (!profile?.resume_json) {
    return {
      ok: false as const,
      error: 'Your base resume is missing. Run an assessment first.',
    };
  }

  const { data: job } = await supabase
    .from('jobs')
    .select('id, title, company, description')
    .eq('id', application.job_id)
    .maybeSingle();
  if (!job) return { ok: false as const, error: 'Linked job is missing.' };

  return {
    ok: true as const,
    supabase,
    user,
    application,
    profile: { resume_json: profile.resume_json as ResumeJson },
    job,
  };
}

async function persistGeneration(
  ctx: { supabase: Awaited<ReturnType<typeof createClient>>; user: { id: string }; application: { id: string; job_id: string } },
  kind: ArtifactKind,
  output: unknown,
  model: string,
  inputTokens: number,
  outputTokens: number,
): Promise<GenerateArtifactResult> {
  const { data: row, error } = await ctx.supabase
    .from('generations')
    .insert({
      profile_id: ctx.user.id,
      job_id: ctx.application.job_id,
      application_id: ctx.application.id,
      kind,
      status: 'success',
      output,
      model,
      prompt_tokens: inputTokens,
      completion_tokens: outputTokens,
      cached_tokens: 0,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !row) {
    console.error(`[generate ${kind}] insert failed`, { error });
    return { ok: false, error: error?.message ?? 'Failed to save artifact.' };
  }
  return { ok: true, generationId: row.id };
}

export async function generateCoverLetter(applicationId: string): Promise<GenerateArtifactResult> {
  const ctx = await loadContext(applicationId);
  if (!ctx.ok) return ctx;
  try {
    const result = await runCoverLetter({
      resume_json: ctx.profile.resume_json,
      job: ctx.job,
    });
    const ret = await persistGeneration(
      ctx,
      'cover_letter',
      result.output,
      result.model,
      result.usage.inputTokens,
      result.usage.outputTokens,
    );
    revalidatePath(`/applications/${applicationId}`);
    return ret;
  } catch (err) {
    console.error('[generateCoverLetter] failed', { applicationId, err });
    return {
      ok: false,
      error: `Cover letter agent failed: ${err instanceof Error ? err.message : 'unknown'}`,
    };
  }
}

export async function generateCompanyBrief(
  applicationId: string,
): Promise<GenerateArtifactResult> {
  const ctx = await loadContext(applicationId);
  if (!ctx.ok) return ctx;
  try {
    const result = await runCompanyBrief({ job: ctx.job });
    const ret = await persistGeneration(
      ctx,
      'company_brief',
      result.output,
      result.model,
      result.usage.inputTokens,
      result.usage.outputTokens,
    );
    revalidatePath(`/applications/${applicationId}`);
    return ret;
  } catch (err) {
    console.error('[generateCompanyBrief] failed', { applicationId, err });
    return {
      ok: false,
      error: `Company brief agent failed: ${err instanceof Error ? err.message : 'unknown'}`,
    };
  }
}

export async function generateInterviewQuestions(
  applicationId: string,
): Promise<GenerateArtifactResult> {
  const ctx = await loadContext(applicationId);
  if (!ctx.ok) return ctx;
  try {
    const result = await runInterviewQuestions({
      resume_json: ctx.profile.resume_json,
      job: ctx.job,
    });
    const ret = await persistGeneration(
      ctx,
      'interview_questions',
      result.output,
      result.model,
      result.usage.inputTokens,
      result.usage.outputTokens,
    );
    revalidatePath(`/applications/${applicationId}`);
    return ret;
  } catch (err) {
    console.error('[generateInterviewQuestions] failed', { applicationId, err });
    return {
      ok: false,
      error: `Interview questions agent failed: ${err instanceof Error ? err.message : 'unknown'}`,
    };
  }
}

export async function generateOutreach(applicationId: string): Promise<GenerateArtifactResult> {
  const ctx = await loadContext(applicationId);
  if (!ctx.ok) return ctx;
  try {
    const result = await runOutreach({
      resume_json: ctx.profile.resume_json,
      job: ctx.job,
    });
    const ret = await persistGeneration(
      ctx,
      'outreach_drafts',
      result.output,
      result.model,
      result.usage.inputTokens,
      result.usage.outputTokens,
    );
    revalidatePath(`/applications/${applicationId}`);
    return ret;
  } catch (err) {
    console.error('[generateOutreach] failed', { applicationId, err });
    return {
      ok: false,
      error: `Outreach agent failed: ${err instanceof Error ? err.message : 'unknown'}`,
    };
  }
}
