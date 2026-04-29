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
};

export async function getResumeById(id: string): Promise<TailoredResumeRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .eq('profile_id', user.id)
    .maybeSingle<TailoredResumeRow>();

  return data ?? null;
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
