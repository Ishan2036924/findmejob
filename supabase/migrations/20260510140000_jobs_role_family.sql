-- Reuse the existing role_family enum from profiles schema (declared in 20260427180700).
alter table public.jobs add column role_family role_family;
create index jobs_role_family_idx on public.jobs (role_family) where role_family is not null;

-- Best-effort backfill via simple title heuristics. Anything ambiguous stays NULL
-- and the classifier picks it up on next ingest run.
update public.jobs set role_family = 'ai_ml_engineer' where role_family is null and (
  title ilike '%machine learning%' or title ilike '%ml engineer%'
  or title ilike '%applied scientist%' or title ilike '%nlp engineer%'
  or title ilike '%llm engineer%' or title ilike '%ai engineer%'
);
update public.jobs set role_family = 'data_ml' where role_family is null and (
  title ilike '%data scientist%' or title ilike '%data analyst%'
  or title ilike '%data engineer%' or title ilike '%analytics engineer%'
);
update public.jobs set role_family = 'devops' where role_family is null and (
  title ilike '%devops%' or title ilike '%sre%' or title ilike '%site reliability%'
  or title ilike '%cloud architect%' or title ilike '%platform engineer%'
);
update public.jobs set role_family = 'dba' where role_family is null and (
  title ilike '%database administrator%' or title ilike '% dba %' or title ilike '%dba)%'
);
update public.jobs set role_family = 'security_engineer' where role_family is null and (
  title ilike '%security engineer%' or title ilike '%appsec%' or title ilike '%infosec%'
  or title ilike '%application security%'
);
update public.jobs set role_family = 'qa_engineer' where role_family is null and (
  title ilike '% qa %' or title ilike '%qa engineer%' or title ilike '%sdet%'
  or title ilike '%test engineer%' or title ilike '%quality engineer%'
);
update public.jobs set role_family = 'product' where role_family is null and (
  title ilike '%product manager%' or title ilike '%product owner%' or title ilike '%group product%'
);
update public.jobs set role_family = 'design' where role_family is null and (
  title ilike '%designer%' or title ilike '% ux %' or title ilike '%ux designer%'
  or title ilike '%ui designer%' or title ilike '%product designer%'
);
update public.jobs set role_family = 'sales' where role_family is null and (
  title ilike '%sales%' or title ilike '%account executive%' or title ilike '%solutions consultant%'
  or title ilike '%implementation consultant%' or title ilike '%account manager%'
);
update public.jobs set role_family = 'marketing' where role_family is null and (
  title ilike '%marketing%' or title ilike '%growth manager%' or title ilike '%demand gen%'
  or title ilike '%brand manager%' or title ilike '%content manager%'
);
update public.jobs set role_family = 'hr' where role_family is null and (
  title ilike '%recruiter%' or title ilike '% hr %' or title ilike '%hrbp%' or title ilike '%people partner%'
  or title ilike '%talent acquisition%'
);
update public.jobs set role_family = 'finance' where role_family is null and (
  title ilike '%finance%' or title ilike '%accountant%' or title ilike '%fp&a%'
  or title ilike '%controller%' or title ilike '%treasury%'
);
update public.jobs set role_family = 'consulting' where role_family is null and (
  title ilike '%consultant%' and title not ilike '%solutions consultant%' and title not ilike '%implementation consultant%'
);
update public.jobs set role_family = 'ops' where role_family is null and (
  title ilike '%operations%' or title ilike '%bizops%' or title ilike '%biz ops%'
);
-- SWE last so prior matches (ai_ml_engineer, data_ml, etc.) take precedence.
update public.jobs set role_family = 'swe' where role_family is null and (
  title ilike '%software engineer%' or title ilike '%backend engineer%'
  or title ilike '%frontend engineer%' or title ilike '%full-stack%' or title ilike '%fullstack%'
  or title ilike '%full stack%' or title ilike '%web engineer%' or title ilike '%mobile engineer%'
  or title ilike '%ios engineer%' or title ilike '%android engineer%'
);
-- Anything else stays NULL until classifier runs on next ingest.
