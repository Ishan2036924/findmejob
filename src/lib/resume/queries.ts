import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { ResumeJson } from '@/lib/ai/schemas/profile';

export type TailoredResumeRow = {
  id: string;
  profile_id: string;
  resume_json: ResumeJson;
  source: 'upload_pdf' | 'upload_text' | 'ai_tailored';
  target_job_id: string | null;
  pdf_url: string | null;
  compile_status: 'pending' | 'compiling' | 'success' | 'failed';
  compile_error: string | null;
  created_at: string;
  /** Tailoring delta info pulled from the linked generations row, if any. */
  tailoring_meta?: {
    meta_summary: string | null;
    applied: number | null;
  } | null;
};

export async function getResumeById(id: string): Promise<TailoredResumeRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: resume } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .eq('profile_id', user.id)
    .maybeSingle<TailoredResumeRow>();

  if (!resume) return null;

  // Best-effort lookup of the most recent matching tailoring generation row.
  // Generation rows store `resume_id` + an `output` jsonb with meta_summary + applied.
  let tailoring_meta: TailoredResumeRow['tailoring_meta'] = null;
  if (resume.source === 'ai_tailored') {
    const { data: gen } = await supabase
      .from('generations')
      .select('output')
      .eq('profile_id', user.id)
      .eq('resume_id', resume.id)
      .eq('kind', 'resume_tailoring')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<{ output: { meta_summary?: string; applied?: number } | null }>();

    if (gen?.output) {
      tailoring_meta = {
        meta_summary: gen.output.meta_summary ?? null,
        applied: typeof gen.output.applied === 'number' ? gen.output.applied : null,
      };
    }
  }

  return { ...resume, tailoring_meta };
}

/**
 * Latest tailored resume for an (application, profile) pair.
 * Returns null if none generated yet.
 */
export async function getLatestTailoredResumeForJob(
  jobId: string,
): Promise<TailoredResumeRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('resumes')
    .select('*')
    .eq('profile_id', user.id)
    .eq('target_job_id', jobId)
    .eq('source', 'ai_tailored')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<TailoredResumeRow>();

  return data ?? null;
}
