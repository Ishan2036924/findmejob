import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type ApplicationRow = {
  id: string;
  profile_id: string;
  job_id: string;
  status: ApplicationStatus;
  notes: string;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationListItem = {
  id: string;
  status: ApplicationStatus;
  notes: string;
  applied_at: string | null;
  updated_at: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string | null;
    posted_at: string | null;
    source: string;
    source_url: string;
  };
  match_score: number | null;
};

export type ApplicationDetail = ApplicationListItem & {
  job: ApplicationListItem['job'] & { description: string };
  match: {
    score: number;
    reasoning: string;
    gaps: string[];
    strengths: string[];
  } | null;
};

export async function getApplications(): Promise<ApplicationListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: applications } = await supabase
    .from('applications')
    .select(
      `id, status, notes, applied_at, updated_at,
       job:jobs (id, title, company, location, posted_at, source, source_url)`,
    )
    .eq('profile_id', user.id)
    .order('updated_at', { ascending: false });

  if (!applications || applications.length === 0) return [];

  // Supabase PostgREST embed types one-to-one relations as arrays at the type
  // layer; cast through unknown. At runtime each `job` is a single object.
  const jobIds = applications.map(
    (a) => (a.job as unknown as ApplicationListItem['job']).id,
  );
  const { data: scores } = await supabase
    .from('match_scores')
    .select('job_id, score')
    .eq('profile_id', user.id)
    .in('job_id', jobIds);

  const scoreMap = new Map(scores?.map((s) => [s.job_id, s.score]) ?? []);

  return applications.map((a) => {
    const job = a.job as unknown as ApplicationListItem['job'];
    return {
      id: a.id,
      status: a.status as ApplicationStatus,
      notes: a.notes,
      applied_at: a.applied_at,
      updated_at: a.updated_at,
      job,
      match_score: scoreMap.get(job.id) ?? null,
    };
  });
}

export async function getApplicationById(id: string): Promise<ApplicationDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: application } = await supabase
    .from('applications')
    .select(
      `id, status, notes, applied_at, updated_at,
       job:jobs (id, title, company, location, posted_at, source, source_url, description)`,
    )
    .eq('id', id)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (!application) return null;

  const job = application.job as unknown as ApplicationDetail['job'];

  const { data: matchScore } = await supabase
    .from('match_scores')
    .select('score, reasoning, gaps, strengths')
    .eq('profile_id', user.id)
    .eq('job_id', job.id)
    .maybeSingle();

  return {
    id: application.id,
    status: application.status as ApplicationStatus,
    notes: application.notes,
    applied_at: application.applied_at,
    updated_at: application.updated_at,
    job,
    match_score: matchScore?.score ?? null,
    match: matchScore
      ? {
          score: matchScore.score,
          reasoning: matchScore.reasoning,
          gaps: matchScore.gaps,
          strengths: matchScore.strengths,
        }
      : null,
  };
}

/** Used by JobCard to render either "Save" or "Saved → open" — Map<job_id, application_id>. */
export async function getApplicationMapForCurrentUser(): Promise<Map<string, string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Map();

  const { data } = await supabase
    .from('applications')
    .select('id, job_id')
    .eq('profile_id', user.id);

  return new Map((data ?? []).map((a) => [a.job_id, a.id]));
}
