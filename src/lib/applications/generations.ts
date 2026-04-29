import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type ArtifactGenerationKind =
  | 'resume_tailoring'
  | 'cover_letter'
  | 'company_brief'
  | 'interview_questions'
  | 'outreach_drafts';

export type ArtifactGeneration = {
  id: string;
  kind: ArtifactGenerationKind;
  output: unknown;
  status: string;
  resume_id: string | null;
  created_at: string;
  completed_at: string | null;
};

/**
 * Latest generation per kind for a single application. Used by the per-job
 * dashboard to flip artifact cards from Generate → View.
 */
export async function getLatestGenerationsByKind(
  applicationId: string,
): Promise<Map<ArtifactGenerationKind, ArtifactGeneration>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Map();

  const { data } = await supabase
    .from('generations')
    .select('id, kind, output, status, resume_id, created_at, completed_at')
    .eq('profile_id', user.id)
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false });

  const map = new Map<ArtifactGenerationKind, ArtifactGeneration>();
  for (const row of data ?? []) {
    const kind = row.kind as ArtifactGenerationKind;
    if (!map.has(kind)) {
      map.set(kind, {
        id: row.id,
        kind,
        output: row.output,
        status: row.status,
        resume_id: row.resume_id,
        created_at: row.created_at,
        completed_at: row.completed_at,
      });
    }
  }
  return map;
}
