'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { MemoryKind } from './queries';

async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');
  return user.id;
}

export type SaveMemoryInput = {
  kind: MemoryKind;
  content: string;
  context?: string | null;
  importance?: number;
};

export async function saveMemory(input: SaveMemoryInput): Promise<void> {
  const profileId = await requireUserId();
  const supabase = await createClient();
  const content = input.content.trim();
  if (!content) throw new Error('Memory content is required.');

  const { error } = await supabase.from('user_memories').insert({
    profile_id: profileId,
    kind: input.kind,
    content,
    source: 'explicit',
    context: input.context ?? null,
    importance: input.importance ?? 0,
  });
  if (error) {
    console.error('[saveMemory]', error);
    throw new Error(error.message);
  }
  revalidatePath('/settings/memory');
}

export type UpdateMemoryPatch = Partial<{
  kind: MemoryKind;
  content: string;
  context: string | null;
  importance: number;
}>;

export async function updateMemory(
  id: string,
  patch: UpdateMemoryPatch,
): Promise<void> {
  await requireUserId();
  const supabase = await createClient();
  const cleaned: Record<string, unknown> = {};
  if (patch.kind !== undefined) cleaned.kind = patch.kind;
  if (patch.content !== undefined) cleaned.content = patch.content.trim();
  if (patch.context !== undefined) cleaned.context = patch.context;
  if (patch.importance !== undefined) cleaned.importance = patch.importance;

  if (Object.keys(cleaned).length === 0) return;

  const { error } = await supabase
    .from('user_memories')
    .update(cleaned)
    .eq('id', id);
  if (error) {
    console.error('[updateMemory]', error);
    throw new Error(error.message);
  }
  revalidatePath('/settings/memory');
}

export async function deleteMemory(id: string): Promise<void> {
  await requireUserId();
  const supabase = await createClient();
  const { error } = await supabase.from('user_memories').delete().eq('id', id);
  if (error) {
    console.error('[deleteMemory]', error);
    throw new Error(error.message);
  }
  revalidatePath('/settings/memory');
}
