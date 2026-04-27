import { createClient } from '@/lib/supabase/server';
import type { RoleFamily, Seniority } from '@/lib/ai/schemas/profile';

export type ProfileRow = {
  id: string;
  display_name: string | null;
  target_role_family: RoleFamily | null;
  target_seniority: Seniority | null;
  target_location: string | null;
  linkedin_paste: string | null;
  portfolio_urls: string[];
  resume_json: unknown;
  raw_resume_text: string | null;
  latest_assessment_id: string | null;
  created_at: string;
  updated_at: string;
};

export async function getCurrentUserProfile(): Promise<{
  user: { id: string; email: string | null } | null;
  profile: ProfileRow | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<ProfileRow>();

  return {
    user: { id: user.id, email: user.email ?? null },
    profile: profile ?? null,
  };
}

export function isOnboardingComplete(profile: ProfileRow | null): boolean {
  if (!profile) return false;
  return (
    !!profile.target_role_family &&
    !!profile.target_seniority &&
    !!profile.raw_resume_text &&
    profile.raw_resume_text.length > 100
  );
}
