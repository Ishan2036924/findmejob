-- In-app feedback widget. Users submit via the floating "Report a problem"
-- button in the sidebar; admins triage at /admin/feedback.

-- Allow chat_attachments to be detached from a chat thread so the same
-- table can back feedback screenshots. Existing rows always have a thread.
alter table public.chat_attachments alter column thread_id drop not null;

create type feedback_status as enum ('new', 'triaged', 'resolved', 'wontfix');

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  page_url text,
  attachment_id uuid references public.chat_attachments(id) on delete set null,
  status feedback_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index feedback_profile_idx on public.feedback(profile_id);
create index feedback_status_idx on public.feedback(status);
create index feedback_created_at_idx on public.feedback(created_at desc);

alter table public.feedback enable row level security;

create policy "feedback owner insert" on public.feedback
  for insert with check (auth.uid() = profile_id);

create policy "feedback owner select" on public.feedback
  for select using (auth.uid() = profile_id);

-- Admin reads/writes go through the service-role client, which bypasses RLS.

comment on table public.feedback is
  'User-submitted bug reports / feedback. Optional attachment is reused from chat_attachments. Admin triage via /admin/feedback.';
