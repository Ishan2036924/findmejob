'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { runPracticeFeedback } from '@/lib/ai/agents/practice-agent';
import type { ResumeJson } from '@/lib/ai/schemas/profile';
import type { PracticeFeedback, PracticeQuestionType } from '@/lib/ai/schemas/practice';

export type SubmitPracticeAnswerInput = {
  applicationId: string;
  question: string;
  questionType: PracticeQuestionType;
  userAnswer: string;
};

export type SubmitPracticeAnswerResult =
  | { ok: true; sessionId: string; feedback: PracticeFeedback }
  | { ok: false; error: string };

export async function submitPracticeAnswer(
  input: SubmitPracticeAnswerInput,
): Promise<SubmitPracticeAnswerResult> {
  const trimmed = input.userAnswer.trim();
  if (trimmed.length < 30) {
    return { ok: false, error: 'Answer is too short. At least 30 characters please.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const { data: application } = await supabase
    .from('applications')
    .select('id, job_id')
    .eq('id', input.applicationId)
    .eq('profile_id', user.id)
    .maybeSingle();
  if (!application) return { ok: false, error: 'Application not found.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('resume_json')
    .eq('id', user.id)
    .single();
  if (!profile?.resume_json) {
    return {
      ok: false,
      error: 'Your base resume is missing. Run an assessment first.',
    };
  }

  const { data: job } = await supabase
    .from('jobs')
    .select('title, company, description')
    .eq('id', application.job_id)
    .maybeSingle();
  if (!job) return { ok: false, error: 'Linked job is missing.' };

  let result;
  try {
    result = await runPracticeFeedback({
      question: input.question,
      question_type: input.questionType,
      user_answer: trimmed,
      resume_json: profile.resume_json as ResumeJson,
      job: { title: job.title, company: job.company, description: job.description },
    });
  } catch (err) {
    console.error('[submitPracticeAnswer] agent failed', { err });
    return {
      ok: false,
      error: `Practice agent failed: ${err instanceof Error ? err.message : 'unknown'}`,
    };
  }

  const { data: row, error } = await supabase
    .from('practice_sessions')
    .insert({
      application_id: input.applicationId,
      question: input.question,
      user_answer: trimmed,
      feedback: result.output,
    })
    .select('id')
    .single();

  if (error || !row) {
    console.error('[submitPracticeAnswer] insert failed', { error });
    return { ok: false, error: error?.message ?? 'Failed to save session.' };
  }

  revalidatePath(`/applications/${input.applicationId}/practice`);
  return { ok: true, sessionId: row.id, feedback: result.output };
}
