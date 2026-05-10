import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const STATUS_VALUES = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
] as const;

export const saveFeedJobTool = tool({
  description:
    "Save a job from the feed to the user's applications log. Use after `list_feed_jobs` to track a specific job. Distinct from `paste_jd_url` (which adds an EXTERNAL job, not one from the feed).",
  inputSchema: z.object({
    job_id: z.string(),
    status: z.enum(STATUS_VALUES).nullable(),
  }),
  execute: async (input) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: 'unauthorized' };

      // Confirm the job exists and is visible to this user.
      const { data: job, error: jobErr } = await supabase
        .from('jobs')
        .select('id, title, company')
        .eq('id', input.job_id)
        .maybeSingle();
      if (jobErr || !job) return { error: 'job_not_found' };

      // Dedupe: if an application already exists, return it.
      const { data: existing } = await supabase
        .from('applications')
        .select('id, status')
        .eq('profile_id', user.id)
        .eq('job_id', input.job_id)
        .maybeSingle();
      if (existing) {
        return {
          ok: true,
          application_id: existing.id,
          status: existing.status,
          deduped: true,
          title: job.title,
          company: job.company,
        };
      }

      const status = input.status ?? 'saved';
      const { data, error } = await supabase
        .from('applications')
        .insert({ profile_id: user.id, job_id: input.job_id, status })
        .select('id')
        .single();
      if (error || !data) return { error: error?.message ?? 'insert_failed' };

      revalidatePath('/applications');
      revalidatePath('/jobs');

      return {
        ok: true,
        application_id: data.id,
        status,
        title: job.title,
        company: job.company,
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
