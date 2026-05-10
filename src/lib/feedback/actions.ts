'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin/auth';

const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const PDF_MIME = 'application/pdf';

export type SubmitFeedbackResult =
  | { ok: true; id: string }
  | { ok: false; error: string; message: string };

export async function submitFeedback(
  formData: FormData,
): Promise<SubmitFeedbackResult> {
  const body = String(formData.get('body') ?? '').trim();
  const pageUrlRaw = String(formData.get('page_url') ?? '').trim();
  const attachmentIdRaw = String(formData.get('attachment_id') ?? '').trim();
  const page_url = pageUrlRaw.length > 0 ? pageUrlRaw.slice(0, 500) : null;
  const attachment_id = attachmentIdRaw.length > 0 ? attachmentIdRaw : null;

  if (!body || body.length < 5) {
    return {
      ok: false,
      error: 'too_short',
      message: 'Please write at least a sentence.',
    };
  }
  if (body.length > 4000) {
    return {
      ok: false,
      error: 'too_long',
      message: 'Keep it under 4000 chars.',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'unauthorized', message: 'Sign in first.' };
  }

  const { data, error } = await supabase
    .from('feedback')
    .insert({ profile_id: user.id, body, page_url, attachment_id })
    .select('id')
    .single();
  if (error || !data) {
    return {
      ok: false,
      error: 'insert_failed',
      message: error?.message ?? 'Could not save feedback.',
    };
  }
  return { ok: true, id: data.id as string };
}

export type UploadFeedbackAttachmentResult =
  | { ok: true; id: string; preview_url: string }
  | { ok: false; error: string; message?: string };

/**
 * Upload an optional screenshot/PDF attached to a feedback submission.
 * Reuses the chat-attachments storage bucket and table (thread_id is null
 * for feedback uploads).
 */
export async function uploadFeedbackAttachment(
  formData: FormData,
): Promise<UploadFeedbackAttachmentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthorized' };

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, error: 'bad_request', message: 'No file provided.' };
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: 'file_too_large',
      message: 'Files must be 5MB or smaller.',
    };
  }

  let kind: 'image' | 'pdf';
  if (IMAGE_MIMES.has(file.type)) kind = 'image';
  else if (file.type === PDF_MIME) kind = 'pdf';
  else {
    return {
      ok: false,
      error: 'unsupported_type',
      message: 'Attach a PNG, JPG, WEBP, or PDF.',
    };
  }

  const ext = file.name.includes('.')
    ? (file.name.split('.').pop() ?? '').toLowerCase() ||
      (kind === 'pdf' ? 'pdf' : 'png')
    : kind === 'pdf'
      ? 'pdf'
      : 'png';
  const safeName = `${crypto.randomUUID()}.${ext}`;
  const file_path = `${user.id}/${safeName}`;

  const { error: upErr } = await supabase.storage
    .from('chat-attachments')
    .upload(file_path, file, { contentType: file.type, upsert: false });
  if (upErr) {
    console.error('[uploadFeedbackAttachment storage]', upErr);
    return { ok: false, error: 'upload_failed', message: upErr.message };
  }

  const { data: row, error: insErr } = await supabase
    .from('chat_attachments')
    .insert({
      profile_id: user.id,
      thread_id: null,
      kind,
      mime_type: file.type,
      file_path,
      file_name: file.name,
      size_bytes: file.size,
    })
    .select('id')
    .single();
  if (insErr || !row) {
    console.error('[uploadFeedbackAttachment insert]', insErr);
    return { ok: false, error: 'insert_failed', message: insErr?.message };
  }

  const { data: signed } = await supabase.storage
    .from('chat-attachments')
    .createSignedUrl(file_path, 60 * 60);

  return {
    ok: true,
    id: row.id as string,
    preview_url: signed?.signedUrl ?? '',
  };
}

export type FeedbackStatus = 'new' | 'triaged' | 'resolved' | 'wontfix';

export type UpdateFeedbackResult = { ok: true } | { ok: false; error: string };

export async function updateFeedback(
  id: string,
  patch: { status?: FeedbackStatus; admin_notes?: string | null },
): Promise<UpdateFeedbackResult> {
  await requireAdmin();
  if (!id) return { ok: false, error: 'bad_request' };

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.admin_notes !== undefined) update.admin_notes = patch.admin_notes;

  if (Object.keys(update).length === 1) {
    return { ok: false, error: 'nothing_to_update' };
  }

  const admin = createAdminClient();
  const { error } = await admin.from('feedback').update(update).eq('id', id);
  if (error) {
    console.error('[updateFeedback]', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
