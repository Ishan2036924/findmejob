'use server';

import { createClient } from '@/lib/supabase/server';
import { extractText, getDocumentProxy } from 'unpdf';
import { checkAttachmentRateLimit } from '@/lib/guardrails/rate-limit';

const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const PDF_MIME = 'application/pdf';

export type UploadAttachmentResult =
  | {
      ok: true;
      id: string;
      kind: 'image' | 'pdf';
      file_name: string;
      preview_url: string;
    }
  | { ok: false; error: string; message?: string };

export type AttachmentRow = {
  id: string;
  kind: 'image' | 'pdf' | 'document';
  mime_type: string;
  file_path: string;
  file_name: string;
  extracted_text: string | null;
  signed_url: string | null;
};

export async function uploadChatAttachment(
  formData: FormData,
): Promise<UploadAttachmentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthorized' };

  // Rate limit (table-aware; fails open if missing).
  try {
    const rl = await checkAttachmentRateLimit(user.id);
    if (!rl.ok) {
      return { ok: false, error: rl.reason ?? 'rate_limited', message: rl.message };
    }
  } catch (err) {
    console.error('[uploadChatAttachment rate-limit]', err);
  }

  const threadId = formData.get('thread_id');
  const file = formData.get('file');
  if (typeof threadId !== 'string' || !(file instanceof File)) {
    return { ok: false, error: 'bad_request' };
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
  else
    return {
      ok: false,
      error: 'unsupported_type',
      message:
        "We support images and PDFs only. We don't read Word docs yet — paste the text or save as PDF.",
    };

  // Verify thread ownership.
  const { data: thread } = await supabase
    .from('chat_threads')
    .select('id')
    .eq('id', threadId)
    .eq('profile_id', user.id)
    .maybeSingle();
  if (!thread) return { ok: false, error: 'thread_not_found' };

  // Upload to Storage.
  const ext = file.name.includes('.')
    ? (file.name.split('.').pop() ?? '').toLowerCase() || (kind === 'pdf' ? 'pdf' : 'png')
    : kind === 'pdf'
      ? 'pdf'
      : 'png';
  const safeName = `${crypto.randomUUID()}.${ext}`;
  const file_path = `${user.id}/${safeName}`;

  const { error: upErr } = await supabase.storage
    .from('chat-attachments')
    .upload(file_path, file, { contentType: file.type, upsert: false });
  if (upErr) {
    console.error('[uploadChatAttachment storage]', upErr);
    return { ok: false, error: 'upload_failed' };
  }

  // Extract text for PDFs.
  let extracted_text: string | null = null;
  if (kind === 'pdf') {
    try {
      const buf = await file.arrayBuffer();
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const { text } = await extractText(pdf, { mergePages: true });
      const textAny = text as unknown;
      const merged =
        typeof textAny === 'string'
          ? textAny
          : Array.isArray(textAny)
            ? (textAny as unknown[]).join('\n')
            : '';
      extracted_text = merged.trim();
      if (!extracted_text || extracted_text.length < 50) {
        // Likely an image-only PDF. Leave null.
        extracted_text = null;
      }
    } catch (err) {
      console.error('[uploadChatAttachment unpdf]', err);
    }
  }

  // Insert row.
  const { data: row, error: insErr } = await supabase
    .from('chat_attachments')
    .insert({
      profile_id: user.id,
      thread_id: threadId,
      kind,
      mime_type: file.type,
      file_path,
      file_name: file.name,
      size_bytes: file.size,
      extracted_text,
    })
    .select('id')
    .single();
  if (insErr || !row) {
    console.error('[uploadChatAttachment insert]', insErr);
    return { ok: false, error: 'insert_failed' };
  }

  // Signed URL for preview / vision.
  const { data: signed } = await supabase.storage
    .from('chat-attachments')
    .createSignedUrl(file_path, 60 * 60);

  return {
    ok: true,
    id: row.id,
    kind,
    file_name: file.name,
    preview_url: signed?.signedUrl ?? '',
  };
}

export async function getAttachmentsByIds(ids: string[]): Promise<AttachmentRow[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chat_attachments')
    .select('id, kind, mime_type, file_path, file_name, extracted_text')
    .in('id', ids);
  if (error || !data) return [];

  const results = await Promise.all(
    data.map(async (a) => {
      const { data: signed } = await supabase.storage
        .from('chat-attachments')
        .createSignedUrl(a.file_path, 60 * 60);
      return {
        id: a.id as string,
        kind: a.kind as 'image' | 'pdf' | 'document',
        mime_type: a.mime_type as string,
        file_path: a.file_path as string,
        file_name: a.file_name as string,
        extracted_text: (a.extracted_text as string | null) ?? null,
        signed_url: signed?.signedUrl ?? null,
      };
    }),
  );
  return results;
}

export async function getAttachmentsByMessageIds(
  messageIds: string[],
): Promise<Record<string, AttachmentRow[]>> {
  if (messageIds.length === 0) return {};
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chat_attachments')
    .select('id, message_id, kind, mime_type, file_path, file_name, extracted_text')
    .in('message_id', messageIds);
  if (error || !data) return {};

  const grouped: Record<string, AttachmentRow[]> = {};
  await Promise.all(
    data.map(async (a) => {
      const { data: signed } = await supabase.storage
        .from('chat-attachments')
        .createSignedUrl(a.file_path as string, 60 * 60);
      const row: AttachmentRow = {
        id: a.id as string,
        kind: a.kind as 'image' | 'pdf' | 'document',
        mime_type: a.mime_type as string,
        file_path: a.file_path as string,
        file_name: a.file_name as string,
        extracted_text: (a.extracted_text as string | null) ?? null,
        signed_url: signed?.signedUrl ?? null,
      };
      const mid = a.message_id as string | null;
      if (!mid) return;
      if (!grouped[mid]) grouped[mid] = [];
      grouped[mid].push(row);
    }),
  );
  return grouped;
}

export async function linkAttachmentsToMessage(
  attachmentIds: string[],
  messageId: string,
): Promise<void> {
  if (attachmentIds.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from('chat_attachments')
    .update({ message_id: messageId })
    .in('id', attachmentIds);
  if (error) {
    console.error('[linkAttachmentsToMessage]', error);
  }
}

/**
 * Verify the given attachment IDs all belong to the requesting user AND the
 * given thread. Returns the subset that passes; caller decides what to do
 * with rejects.
 */
export async function verifyAttachmentOwnership(
  attachmentIds: string[],
  threadId: string,
): Promise<string[]> {
  if (attachmentIds.length === 0) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('chat_attachments')
    .select('id')
    .in('id', attachmentIds)
    .eq('profile_id', user.id)
    .eq('thread_id', threadId);
  if (error || !data) return [];
  return data.map((r) => r.id as string);
}
