'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');
  return user.id;
}

export async function createThread(): Promise<void> {
  const profileId = await requireUserId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chat_threads')
    .insert({ profile_id: profileId })
    .select('id')
    .single<{ id: string }>();
  if (error || !data) {
    console.error('[createThread]', error);
    throw new Error(error?.message ?? 'Failed to create thread');
  }
  revalidatePath('/chat');
  redirect(`/chat/${data.id}`);
}

export async function renameThread(id: string, title: string): Promise<void> {
  await requireUserId();
  const supabase = await createClient();
  const trimmed = title.trim().slice(0, 200);
  if (!trimmed) return;
  const { error } = await supabase
    .from('chat_threads')
    .update({ title: trimmed })
    .eq('id', id);
  if (error) {
    console.error('[renameThread]', error);
    throw new Error(error.message);
  }
  revalidatePath('/chat');
  revalidatePath(`/chat/${id}`);
}

export async function archiveThread(id: string): Promise<void> {
  await requireUserId();
  const supabase = await createClient();
  const { error } = await supabase
    .from('chat_threads')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.error('[archiveThread]', error);
    throw new Error(error.message);
  }
  revalidatePath('/chat');
  redirect('/chat');
}

export async function deleteThread(id: string): Promise<void> {
  await requireUserId();
  const supabase = await createClient();
  const { error } = await supabase.from('chat_threads').delete().eq('id', id);
  if (error) {
    console.error('[deleteThread]', error);
    throw new Error(error.message);
  }
  revalidatePath('/chat');
  redirect('/chat');
}
