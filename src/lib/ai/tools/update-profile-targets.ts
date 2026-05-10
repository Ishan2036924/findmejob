import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const ROLE_FAMILY_VALUES = [
  'swe',
  'ai_ml_engineer',
  'data_ml',
  'devops',
  'dba',
  'security_engineer',
  'qa_engineer',
  'product',
  'design',
  'sales',
  'marketing',
  'ops',
  'hr',
  'finance',
  'procurement',
  'supply_chain',
  'consulting',
  'other',
] as const;

const SENIORITY_VALUES = ['intern', 'entry', 'mid', 'senior', 'staff'] as const;

export const updateProfileTargetsTool = tool({
  description:
    "Update the user's career targets (role family, seniority, target location). All inputs nullable — only fields provided are updated. Use when the user explicitly asks to change what they're targeting.",
  inputSchema: z.object({
    target_role_family: z.enum(ROLE_FAMILY_VALUES).nullable(),
    target_seniority: z.enum(SENIORITY_VALUES).nullable(),
    target_location: z.string().nullable(),
  }),
  execute: async (input) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: 'unauthorized' };

      const updates: Record<string, unknown> = {};
      if (input.target_role_family !== null)
        updates.target_role_family = input.target_role_family;
      if (input.target_seniority !== null)
        updates.target_seniority = input.target_seniority;
      if (input.target_location !== null)
        updates.target_location = input.target_location;

      if (Object.keys(updates).length === 0) {
        return { error: 'no fields provided to update' };
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) return { error: error.message };

      revalidatePath('/dashboard');
      revalidatePath('/jobs');

      return {
        ok: true,
        updated: updates,
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
