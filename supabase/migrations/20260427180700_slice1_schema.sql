-- =======================================================================
-- Slice 1 schema for findmejob
-- 6 tables: profiles, resumes, jobs, assessments, generations, match_scores
-- + RLS, triggers, storage bucket
-- See .claude/NOTES.md ## Architecture for design rationale
-- =======================================================================

-- -----------------------------------------------------------------------
-- 1. Enums
-- -----------------------------------------------------------------------

create type role_family as enum (
  'swe', 'data_ml', 'product', 'design', 'devops',
  'sales', 'marketing', 'ops', 'other'
);

create type seniority as enum ('intern', 'entry', 'mid', 'senior', 'staff');

create type resume_source as enum ('upload_pdf', 'upload_text', 'ai_tailored');

create type compile_status as enum ('pending', 'compiling', 'success', 'failed');

create type job_source as enum ('jsearch', 'greenhouse', 'lever', 'ashby');

-- generation_kind expands in Slice 2 (cover_letter, interview_prep, outreach, company_brief)
create type generation_kind as enum ('resume_tailoring');

create type generation_status as enum ('pending', 'generating', 'success', 'failed');

-- -----------------------------------------------------------------------
-- 2. Tables (FKs that span tables added after all are created)
-- -----------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  target_role_family role_family,
  target_seniority seniority,
  target_location text default 'Delhi NCR',
  linkedin_paste text,
  portfolio_urls text[] default '{}',
  resume_json jsonb,
  raw_resume_text text,
  latest_assessment_id uuid,  -- FK added below after assessments exists
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table resumes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  source resume_source not null,
  resume_json jsonb not null,
  raw_text text,
  parent_resume_id uuid references resumes(id) on delete set null,
  target_job_id uuid,  -- FK added below after jobs exists
  pdf_url text,
  compile_status compile_status default 'pending' not null,
  compile_error text,
  created_at timestamptz default now() not null
);

create index resumes_profile_idx on resumes(profile_id);
create index resumes_target_job_idx on resumes(target_job_id) where target_job_id is not null;

create table jobs (
  id uuid primary key default gen_random_uuid(),
  source job_source not null,
  source_id text not null,
  source_url text not null,
  title text not null,
  company text not null,
  location text,
  description text not null,
  description_parsed jsonb,
  posted_at timestamptz,
  raw jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  last_seen_at timestamptz default now() not null,
  unique(source, source_id)
);

create index jobs_posted_idx on jobs(posted_at desc nulls last);
create index jobs_source_idx on jobs(source);

alter table resumes
  add constraint resumes_target_job_fkey
  foreign key (target_job_id) references jobs(id) on delete set null;

create table assessments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  rubric_version text not null,
  model text not null,
  overall_score int not null check (overall_score between 0 and 100),
  dimensions jsonb not null,
  candid_summary text not null,
  next_steps jsonb default '[]'::jsonb not null,
  raw_response jsonb,
  prompt_tokens int default 0 not null,
  completion_tokens int default 0 not null,
  cached_tokens int default 0 not null,
  created_at timestamptz default now() not null
);

create index assessments_profile_idx on assessments(profile_id, created_at desc);

alter table profiles
  add constraint profiles_latest_assessment_fkey
  foreign key (latest_assessment_id) references assessments(id) on delete set null;

create table generations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  kind generation_kind not null,
  status generation_status default 'pending' not null,
  output jsonb,
  resume_id uuid references resumes(id) on delete set null,
  error text,
  model text,
  prompt_tokens int default 0 not null,
  completion_tokens int default 0 not null,
  cached_tokens int default 0 not null,
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

create index generations_profile_idx on generations(profile_id, created_at desc);
create index generations_pending_idx on generations(status) where status in ('pending', 'generating');

create table match_scores (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  score int not null check (score between 0 and 100),
  reasoning text not null,
  gaps text[] default '{}'::text[] not null,
  strengths text[] default '{}'::text[] not null,
  model text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(profile_id, job_id)
);

create index match_scores_profile_score_idx on match_scores(profile_id, score desc);

-- -----------------------------------------------------------------------
-- 3. Triggers
-- -----------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger match_scores_set_updated_at
  before update on match_scores
  for each row execute function set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- -----------------------------------------------------------------------
-- 4. Row Level Security
-- -----------------------------------------------------------------------

alter table profiles      enable row level security;
alter table resumes       enable row level security;
alter table jobs          enable row level security;
alter table assessments   enable row level security;
alter table generations   enable row level security;
alter table match_scores  enable row level security;

-- profiles: own only
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on profiles for delete using (auth.uid() = id);

-- resumes: own (via profile_id)
create policy "resumes_select_own" on resumes for select using (auth.uid() = profile_id);
create policy "resumes_insert_own" on resumes for insert with check (auth.uid() = profile_id);
create policy "resumes_update_own" on resumes for update using (auth.uid() = profile_id);
create policy "resumes_delete_own" on resumes for delete using (auth.uid() = profile_id);

-- jobs: shared read for authenticated users; service_role writes (RLS bypassed)
create policy "jobs_select_authenticated" on jobs for select to authenticated using (true);

-- assessments: own select + own delete; INSERT/UPDATE only via service_role (server-action gated)
create policy "assessments_select_own" on assessments for select using (auth.uid() = profile_id);
create policy "assessments_delete_own" on assessments for delete using (auth.uid() = profile_id);

-- generations: own select + own delete; INSERT/UPDATE only via service_role
create policy "generations_select_own" on generations for select using (auth.uid() = profile_id);
create policy "generations_delete_own" on generations for delete using (auth.uid() = profile_id);

-- match_scores: own select only; service_role inserts/updates
create policy "match_scores_select_own" on match_scores for select using (auth.uid() = profile_id);

-- -----------------------------------------------------------------------
-- 5. Storage bucket for resume PDFs
--    Path convention: {user_id}/{resume_id}.pdf
--    Path-prefix RLS keeps each user isolated to their own folder.
-- -----------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "resumes_storage_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "resumes_storage_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "resumes_storage_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

-- -----------------------------------------------------------------------
-- 6. Comments (live documentation for the schema)
-- -----------------------------------------------------------------------

comment on table profiles      is 'One row per user; mirrors auth.users.id. Auto-created by handle_new_user trigger.';
comment on table resumes       is 'Resume versions: upload_pdf, upload_text, or ai_tailored. ai_tailored rows have parent_resume_id + target_job_id.';
comment on table jobs          is 'Shared deduped jobs from external sources. Slice 1: jsearch only. Slice 4 adds Greenhouse/Lever/Ashby.';
comment on table assessments   is 'Rubric-grounded profile evaluations (Sonnet 4.6). Immutable; latest reachable via profiles.latest_assessment_id.';
comment on table generations   is 'On-click bundle artifacts. Slice 1: resume_tailoring only. Slice 2 adds cover_letter, interview_prep, outreach, company_brief.';
comment on table match_scores  is 'Cached job-fit scores per (profile, job). Soft-invalidated on profile change. GPT-4.1 mini.';
