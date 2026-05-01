'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { roleFamily, seniority, resumeJsonSchema, type ResumeJson } from '@/lib/ai/schemas/profile';
import { runResumeParser } from '@/lib/ai/agents/resume-parser-agent';
import { mergeResumeWithLinkedin } from '@/lib/profile/merge-linkedin';

const onboardingInputSchema = z.object({
  target_role_family: roleFamily,
  target_seniority: seniority,
  target_location: z.string().min(1, 'Location is required.'),
  raw_resume_text: z.string().min(100, 'Resume must be at least 100 characters.'),
  linkedin_paste: z.string().optional().nullable(),
  portfolio_urls: z.array(z.string().url()).max(10).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;

export type OnboardingActionResult = { ok: true } | { ok: false; error: string };

export async function saveOnboarding(input: OnboardingInput): Promise<OnboardingActionResult> {
  const parsed = onboardingInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const { error } = await supabase
    .from('profiles')
    .update({
      target_role_family: parsed.data.target_role_family,
      target_seniority: parsed.data.target_seniority,
      target_location: parsed.data.target_location,
      raw_resume_text: parsed.data.raw_resume_text,
      linkedin_paste: parsed.data.linkedin_paste ?? null,
      portfolio_urls: parsed.data.portfolio_urls ?? [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/onboarding');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// PDF resume upload + parse + commit
// ---------------------------------------------------------------------------

const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5MB
const MIN_TEXT_CHARS = 200;

export type UploadResumeResult =
  | { ok: true; resumeJson: ResumeJson; rawText: string }
  | { ok: false; error: string };

/**
 * Accepts a PDF file (FormData field "file"), extracts text via unpdf,
 * pipes the text through the resume parser agent, and returns the parsed
 * structure WITHOUT persisting it. The client decides whether to commit.
 */
export async function uploadResumePdf(formData: FormData): Promise<UploadResumeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, error: 'No file uploaded.' };
  }
  if (file.type !== 'application/pdf') {
    return { ok: false, error: 'Only PDF files are accepted.' };
  }
  if (file.size > MAX_PDF_BYTES) {
    return { ok: false, error: 'PDF must be 5MB or smaller.' };
  }

  let rawText: string;
  try {
    const { extractText, getDocumentProxy } = await import('unpdf');
    const buffer = await file.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    rawText = (Array.isArray(text) ? text.join('\n') : text).trim();
  } catch (err) {
    console.error('[uploadResumePdf] extract failed', err);
    return { ok: false, error: 'Failed to read the PDF. Try a different file or paste the text.' };
  }

  if (rawText.length < MIN_TEXT_CHARS) {
    return {
      ok: false,
      error:
        'Could not extract text. The PDF may be a scanned image. Paste the text instead.',
    };
  }

  try {
    const parsed = await runResumeParser({ raw_text: rawText });
    return { ok: true, resumeJson: parsed.output, rawText };
  } catch (err) {
    console.error('[uploadResumePdf] parser failed', err);
    return { ok: false, error: 'Resume parser failed. Try again.' };
  }
}

/**
 * Parse pasted resume text (no PDF) and return the parsed JSON. Mirrors
 * uploadResumePdf but skips the unpdf step. Used by the dashboard
 * "replace via paste" path.
 */
export async function parseResumeText(rawText: string): Promise<UploadResumeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };

  const trimmed = rawText.trim();
  if (trimmed.length < MIN_TEXT_CHARS) {
    return { ok: false, error: `Paste at least ${MIN_TEXT_CHARS} characters.` };
  }

  try {
    const parsed = await runResumeParser({ raw_text: trimmed });
    return { ok: true, resumeJson: parsed.output, rawText: trimmed };
  } catch (err) {
    console.error('[parseResumeText] parser failed', err);
    return { ok: false, error: 'Resume parser failed. Try again.' };
  }
}

const commitResumeSchema = z.object({
  resumeJson: resumeJsonSchema,
  rawText: z.string().min(MIN_TEXT_CHARS),
});

export type CommitResumeResult =
  | { ok: true; resumeId: string | null }
  | { ok: false; error: string };

/**
 * Persist a parsed resume to the user's profile and append a row to the
 * `resumes` history table.
 */
export async function commitResume(input: {
  resumeJson: ResumeJson;
  rawText: string;
}): Promise<CommitResumeResult> {
  const parsed = commitResumeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid resume payload.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };

  const { error: profileErr } = await supabase
    .from('profiles')
    .update({
      resume_json: parsed.data.resumeJson,
      raw_resume_text: parsed.data.rawText,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (profileErr) return { ok: false, error: profileErr.message };

  // Append to resumes history table. Best-effort: surface any error but don't
  // roll back the profile update.
  const { data: resumeRow, error: resumeErr } = await supabase
    .from('resumes')
    .insert({
      profile_id: user.id,
      source: 'upload_pdf',
      resume_json: parsed.data.resumeJson,
      raw_text: parsed.data.rawText,
    })
    .select('id')
    .single();

  if (resumeErr) {
    console.error('[commitResume] resumes insert failed', resumeErr);
  }

  revalidatePath('/dashboard');
  revalidatePath('/onboarding');

  return { ok: true, resumeId: resumeRow?.id ?? null };
}

// ---------------------------------------------------------------------------
// LinkedIn merge (PDF export or pasted profile text)
// ---------------------------------------------------------------------------

export type LinkedinUploadResult =
  | { ok: true; resumeJson: ResumeJson; rawText: string }
  | { ok: false; error: string };

export type LinkedinCommitResult = { ok: true } | { ok: false; error: string };

/**
 * Accepts a LinkedIn profile PDF export, extracts text, parses to ResumeJson,
 * and returns the parsed result WITHOUT committing. Mirrors uploadResumePdf.
 */
export async function uploadLinkedinPdf(
  formData: FormData,
): Promise<LinkedinUploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, error: 'No file uploaded.' };
  }
  if (file.type !== 'application/pdf') {
    return { ok: false, error: 'Only PDF files are accepted.' };
  }
  if (file.size > MAX_PDF_BYTES) {
    return { ok: false, error: 'PDF must be 5MB or smaller.' };
  }

  let rawText: string;
  try {
    const { extractText, getDocumentProxy } = await import('unpdf');
    const buffer = await file.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    rawText = (Array.isArray(text) ? text.join('\n') : text).trim();
  } catch (err) {
    console.error('[uploadLinkedinPdf] extract failed', err);
    return {
      ok: false,
      error: 'Failed to read the PDF. Try a different file or paste the text.',
    };
  }

  if (rawText.length < MIN_TEXT_CHARS) {
    return {
      ok: false,
      error:
        'Could not extract text. The PDF may be a scanned image. Paste the text instead.',
    };
  }

  try {
    const parsed = await runResumeParser({ raw_text: rawText });
    return { ok: true, resumeJson: parsed.output, rawText };
  } catch (err) {
    console.error('[uploadLinkedinPdf] parser failed', err);
    return { ok: false, error: 'LinkedIn parser failed. Try again.' };
  }
}

const linkedinCommitSchema = z.object({
  resumeJson: resumeJsonSchema,
  rawText: z.string().min(MIN_TEXT_CHARS),
});

/**
 * Persist a parsed LinkedIn profile by merging it with the user's existing
 * resume_json (or saving directly if none exists), and append the raw text to
 * profiles.linkedin_paste.
 */
export async function commitLinkedinMerge(parsed: {
  resumeJson: ResumeJson;
  rawText: string;
}): Promise<LinkedinCommitResult> {
  const validated = linkedinCommitSchema.safeParse(parsed);
  if (!validated.success) {
    return {
      ok: false,
      error: validated.error.issues[0]?.message ?? 'Invalid LinkedIn payload.',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };

  const { data: profileRow, error: loadErr } = await supabase
    .from('profiles')
    .select('resume_json, linkedin_paste')
    .eq('id', user.id)
    .single();

  if (loadErr) return { ok: false, error: loadErr.message };

  const existing = profileRow?.resume_json as ResumeJson | null;
  const merged: ResumeJson = existing
    ? mergeResumeWithLinkedin(existing, validated.data.resumeJson)
    : validated.data.resumeJson;

  const linkedinPaste = appendLinkedinPaste(
    profileRow?.linkedin_paste ?? null,
    validated.data.rawText,
  );

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({
      resume_json: merged,
      linkedin_paste: linkedinPaste,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateErr) return { ok: false, error: updateErr.message };

  revalidatePath('/dashboard');
  revalidatePath('/onboarding');
  return { ok: true };
}

/**
 * Parse pasted LinkedIn profile text into ResumeJson, merge with existing
 * resume_json, and persist alongside the raw text.
 */
export async function commitLinkedinText(
  text: string,
): Promise<LinkedinCommitResult> {
  const trimmed = text.trim();
  if (trimmed.length < MIN_TEXT_CHARS) {
    return { ok: false, error: `Paste at least ${MIN_TEXT_CHARS} characters.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };

  let parsedResume: ResumeJson;
  try {
    const parsed = await runResumeParser({ raw_text: trimmed });
    parsedResume = parsed.output;
  } catch (err) {
    console.error('[commitLinkedinText] parser failed', err);
    return { ok: false, error: 'LinkedIn parser failed. Try again.' };
  }

  return commitLinkedinMerge({ resumeJson: parsedResume, rawText: trimmed });
}

function appendLinkedinPaste(existing: string | null, addition: string): string {
  const trimmedExisting = (existing ?? '').trim();
  const trimmedAddition = addition.trim();
  if (!trimmedExisting) return trimmedAddition;
  if (trimmedExisting.includes(trimmedAddition)) return trimmedExisting;
  return `${trimmedExisting}\n\n---\n\n${trimmedAddition}`;
}
