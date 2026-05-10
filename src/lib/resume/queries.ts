import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { ResumeJson } from '@/lib/ai/schemas/profile';
import type { JdAnalysis } from '@/lib/ai/schemas/jd-analysis';
import type { TailorVerification } from '@/lib/ai/schemas/tailor-verification';

export type TailoringMeta = {
  meta_summary: string | null;
  applied: number | null;
  /** v3 pipeline: upstream JD analysis used to ground the tailor. */
  jd_analysis: JdAnalysis | null;
  /** v3 pipeline: verifier output (score + missing must_haves + hallucination risks). */
  verifier: TailorVerification | null;
  /** True when verifier-driven retry fired (score<70 on first pass). */
  retried: boolean | null;
};

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
  tailoring_meta?: TailoringMeta | null;
};

/** Narrow shape of `generations.output` we care about for the tailoring meta. */
type GenerationOutput = {
  meta_summary?: string;
  applied?: number;
  jd_analysis?: JdAnalysis;
  verifier?: TailorVerification;
  retried?: boolean;
} | null;

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
  // Generation rows store `resume_id` + an `output` jsonb that (post v3) carries
  // meta_summary + applied + jd_analysis + verifier + retried.
  let tailoring_meta: TailoringMeta | null = null;
  if (resume.source === 'ai_tailored') {
    const { data: gen } = await supabase
      .from('generations')
      .select('output')
      .eq('profile_id', user.id)
      .eq('resume_id', resume.id)
      .eq('kind', 'resume_tailoring')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<{ output: GenerationOutput }>();

    if (gen?.output) {
      tailoring_meta = {
        meta_summary: gen.output.meta_summary ?? null,
        applied: typeof gen.output.applied === 'number' ? gen.output.applied : null,
        jd_analysis: gen.output.jd_analysis ?? null,
        verifier: gen.output.verifier ?? null,
        retried: typeof gen.output.retried === 'boolean' ? gen.output.retried : null,
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
