'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { roleFamily, seniority } from '@/lib/ai/schemas/profile';

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
