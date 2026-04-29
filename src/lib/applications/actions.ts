'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { enqueueCompanyClassification } from './classify';
import type { ApplicationStatus } from './queries';

export type SaveJobResult =
  | { ok: true; applicationId: string; alreadySaved: boolean }
  | { ok: false; error: string };

/** Save a feed job to the user's applications log (status='saved'). Idempotent. */
export async function saveJob(jobId: string): Promise<SaveJobResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('profile_id', user.id)
    .eq('job_id', jobId)
    .maybeSingle();

  if (existing) {
    return { ok: true, applicationId: existing.id, alreadySaved: true };
  }

  const { data: inserted, error } = await supabase
    .from('applications')
    .insert({ profile_id: user.id, job_id: jobId, status: 'saved' })
    .select('id')
    .single();

  if (error || !inserted) {
    console.error('[saveJob] insert failed', { jobId, userId: user.id, error });
    return { ok: false, error: error?.message ?? 'Failed to save.' };
  }

  // Fire-and-forget company-type classification (don't await).
  void enqueueCompanyClassification(inserted.id);

  revalidatePath('/jobs');
  revalidatePath('/applications');
  return { ok: true, applicationId: inserted.id, alreadySaved: false };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const patch: { status: ApplicationStatus; applied_at?: string | null } = { status };
  if (status === 'applied' || status === 'interview' || status === 'offer') {
    patch.applied_at = new Date().toISOString();
  }
  if (status === 'saved') {
    patch.applied_at = null;
  }

  const { error } = await supabase
    .from('applications')
    .update(patch)
    .eq('id', applicationId)
    .eq('profile_id', user.id);

  if (error) {
    console.error('[updateApplicationStatus] failed', { applicationId, status, error });
    return { ok: false, error: error.message };
  }

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath('/applications');
  return { ok: true };
}

export async function updateApplicationNotes(
  applicationId: string,
  notes: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const { error } = await supabase
    .from('applications')
    .update({ notes })
    .eq('id', applicationId)
    .eq('profile_id', user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/applications/${applicationId}`);
  return { ok: true };
}

export async function deleteApplication(
  applicationId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId)
    .eq('profile_id', user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/applications');
  return { ok: true };
}
