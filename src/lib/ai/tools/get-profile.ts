import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const getProfileTool = tool({
  description:
    'Get the current user profile: target role/seniority/location and a truncated resume_json.',
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: 'unauthenticated' };

      const { data, error } = await supabase
        .from('profiles')
        .select(
          'target_role_family, target_seniority, target_location, resume_json, display_name',
        )
        .eq('id', user.id)
        .maybeSingle();

      if (error) return { error: error.message };
      if (!data) return { error: 'profile_not_found' };

      const serialized = data.resume_json
        ? JSON.stringify(data.resume_json)
        : null;
      const truncated_resume_json =
        serialized && serialized.length > 3000
          ? `${serialized.slice(0, 3000)}…[truncated]`
          : serialized;

      return {
        display_name: data.display_name,
        target_role_family: data.target_role_family,
        target_seniority: data.target_seniority,
        target_location: data.target_location,
        resume_json_excerpt: truncated_resume_json,
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
