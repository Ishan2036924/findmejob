-- =======================================================================
-- Slice 1 Step 6 expansion: applications log + paste-a-job + per-job
-- dashboard shell. See .claude/NOTES.md ## Architecture extension (2026-04-29).
--
-- Adds:
--   - applications table          (per profile×job, status enum, notes)
--   - practice_sessions table     (Slice 2; declared now for schema stability)
--   - generations.application_id  (optional fk linking artifacts to an app)
--   - jobs.created_by             (nullable fk; non-null = user-pasted job)
--   - job_source enum 'user_pasted' value
--   - application_status enum
--   - RLS for new tables + updated jobs SELECT/INSERT policies
-- =======================================================================

-- -----------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------

alter type job_source add value if not exists 'user_pasted';

create type application_status as enum (
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn'
);

-- -----------------------------------------------------------------------
-- applications
-- -----------------------------------------------------------------------

create table applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  status application_status default 'saved' not null,
  notes text default '' not null,
  applied_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(profile_id, job_id)
);

create index applications_profile_idx on applications(profile_id, updated_at desc);
create index applications_status_idx on applications(profile_id, status);

create trigger applications_set_updated_at
  before update on applications
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------
-- practice_sessions (Slice 2 — schema declared now for stability)
-- -----------------------------------------------------------------------

create table practice_sessions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  question text not null,
  user_answer text not null,
  feedback jsonb,
  created_at timestamptz default now() not null
);

create index practice_sessions_application_idx
  on practice_sessions(application_id, created_at desc);

-- -----------------------------------------------------------------------
-- New columns on existing tables
-- -----------------------------------------------------------------------

alter table generations
  add column application_id uuid references applications(id) on delete set null;

create index generations_application_idx
  on generations(application_id) where application_id is not null;

alter table jobs
  add column created_by uuid references auth.users(id) on delete set null;

create index jobs_created_by_idx
  on jobs(created_by) where created_by is not null;

-- -----------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------

alter table applications enable row level security;
alter table practice_sessions enable row level security;

create policy "applications_select_own" on applications
  for select using (auth.uid() = profile_id);
create policy "applications_insert_own" on applications
  for insert with check (auth.uid() = profile_id);
create policy "applications_update_own" on applications
  for update using (auth.uid() = profile_id);
create policy "applications_delete_own" on applications
  for delete using (auth.uid() = profile_id);

create policy "practice_sessions_select_own" on practice_sessions
  for select to authenticated
  using (application_id in (select id from applications where profile_id = auth.uid()));
create policy "practice_sessions_insert_own" on practice_sessions
  for insert to authenticated
  with check (application_id in (select id from applications where profile_id = auth.uid()));

-- jobs SELECT: users see public (system-ingested) jobs + their own pasted jobs
drop policy if exists "jobs_select_authenticated" on jobs;
create policy "jobs_select_public_or_own" on jobs
  for select to authenticated
  using (created_by is null or created_by = auth.uid());

-- jobs INSERT for user-pasted entries: created_by must be self.
-- (System-ingested jobs continue to use service-role, which bypasses RLS.)
create policy "jobs_insert_user_pasted" on jobs
  for insert to authenticated
  with check (created_by = auth.uid());

-- -----------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------

comment on table applications is
  'User work board. Per profile×job, tracks status + notes + timestamps. status: saved | applied | interview | offer | rejected | withdrawn.';
comment on table practice_sessions is
  'Mock-interview attempts (Slice 2). User types an answer, mini scores + suggests improvements.';
comment on column jobs.created_by is
  'User who pasted this job via paste-a-job flow. NULL = system-ingested (cron / refreshFeed).';
comment on column generations.application_id is
  'Optional link to applications row when the artifact was generated from /applications/[id].';
