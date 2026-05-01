-- Phase 4: chat attachments (images + PDFs) for vision-enabled chat.
-- Storage path convention: {user_id}/{uuid}.{ext}.

create type attachment_kind as enum ('image', 'pdf', 'document');

create table public.chat_attachments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  message_id uuid references public.chat_messages(id) on delete set null,
  kind attachment_kind not null,
  mime_type text not null,
  file_path text not null,
  file_name text not null,
  size_bytes integer not null,
  extracted_text text,
  created_at timestamptz not null default now()
);
create index chat_attachments_profile_id_idx on public.chat_attachments (profile_id);
create index chat_attachments_thread_id_idx on public.chat_attachments (thread_id);
create index chat_attachments_message_id_idx on public.chat_attachments (message_id);

alter table public.chat_attachments enable row level security;

create policy "chat_attachments owner select" on public.chat_attachments
  for select using (auth.uid() = profile_id);
create policy "chat_attachments owner insert" on public.chat_attachments
  for insert with check (auth.uid() = profile_id);
create policy "chat_attachments owner update" on public.chat_attachments
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "chat_attachments owner delete" on public.chat_attachments
  for delete using (auth.uid() = profile_id);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('chat-attachments', 'chat-attachments', false)
on conflict (id) do nothing;

create policy "chat-attachments owner read" on storage.objects
  for select to authenticated
  using (bucket_id = 'chat-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "chat-attachments owner insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'chat-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "chat-attachments owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'chat-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

comment on table public.chat_attachments is 'Per-message attachments for chat (images, PDFs). Images go to vision; PDFs are extracted to text via unpdf.';
