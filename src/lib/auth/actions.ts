'use server';

import { createClient } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/url';
import { redirect } from 'next/navigation';

export type AuthActionResult = { ok: true } | { ok: false; error: string };

export async function signInWithEmail(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get('email') as string | null)?.trim();
  if (!email) return { ok: false, error: 'Email is required.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
