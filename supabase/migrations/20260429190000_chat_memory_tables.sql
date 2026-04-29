-- chat_threads: one conversation per row
create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'New chat',
  archived_at timestamptz,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index chat_threads_profile_id_last_message_at_idx
  on public.chat_threads (profile_id, last_message_at desc nulls last);

-- chat_messages: append-only per thread
create type chat_role as enum ('user', 'assistant', 'tool');

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role chat_role not null,
  content text not null default '',
  tool_calls jsonb,
  tool_call_id text,
  tokens_input integer,
  tokens_output integer,
  model text,
  created_at timestamptz not null default now()
);
create index chat_messages_thread_id_created_at_idx
  on public.chat_messages (thread_id, created_at);

-- user_memories: durable facts the agent remembers across threads
create type memory_kind as enum ('preference', 'fact', 'history', 'goal');
create type memory_source as enum ('auto', 'explicit');

create table public.user_memories (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind memory_kind not null,
  content text not null,
  source memory_source not null default 'explicit',
  context text,
  importance smallint not null default 0,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index user_memories_profile_id_idx on public.user_memories (profile_id);

-- RLS
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.user_memories enable row level security;

create policy "chat_threads owner select" on public.chat_threads
  for select using (auth.uid() = profile_id);
create policy "chat_threads owner insert" on public.chat_threads
  for insert with check (auth.uid() = profile_id);
create policy "chat_threads owner update" on public.chat_threads
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "chat_threads owner delete" on public.chat_threads
  for delete using (auth.uid() = profile_id);

create policy "chat_messages owner select" on public.chat_messages
  for select using (auth.uid() = profile_id);
create policy "chat_messages owner insert" on public.chat_messages
  for insert with check (auth.uid() = profile_id);
create policy "chat_messages owner delete" on public.chat_messages
  for delete using (auth.uid() = profile_id);

create policy "user_memories owner select" on public.user_memories
  for select using (auth.uid() = profile_id);
create policy "user_memories owner insert" on public.user_memories
  for insert with check (auth.uid() = profile_id);
create policy "user_memories owner update" on public.user_memories
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "user_memories owner delete" on public.user_memories
  for delete using (auth.uid() = profile_id);

-- updated_at trigger (reuses existing function if present, else create)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger chat_threads_updated_at before update on public.chat_threads
  for each row execute function public.set_updated_at();
create trigger user_memories_updated_at before update on public.user_memories
  for each row execute function public.set_updated_at();
