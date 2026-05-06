-- Region-tagging for jobs so the feed and per-user scorer can filter to the
-- user's target region instead of mixing global postings. India users were
-- seeing California roles because there was no WHERE on location anywhere.
--
-- Patterns mirror src/lib/jobs/region.ts. Backfill is best-effort; rows we
-- can't classify land in 'other'. The cron + ATS fetchers will write region
-- on every subsequent upsert.

create type job_region as enum ('india', 'us', 'remote', 'other');

alter table public.jobs add column region job_region;

create index jobs_region_idx on public.jobs (region) where region is not null;

-- Remote first — wins over both India and US patterns.
update public.jobs set region = 'remote'
  where (location is null or location = '' or location ilike '%remote%' or location ilike '%anywhere%' or location ilike '%worldwide%')
    and region is null;

update public.jobs set region = 'india'
  where region is null
    and (
      location ilike '%delhi%' or location ilike '%ncr%' or location ilike '%gurgaon%' or location ilike '%gurugram%'
      or location ilike '%noida%' or location ilike '%mumbai%' or location ilike '%pune%'
      or location ilike '%bengaluru%' or location ilike '%bangalore%' or location ilike '%hyderabad%'
      or location ilike '%chennai%' or location ilike '%kolkata%' or location ilike '%ahmedabad%'
      or location ilike '%, india%' or location ilike 'india%'
    );

update public.jobs set region = 'us'
  where region is null
    and (
      location ilike '%san francisco%' or location ilike '%bay area%' or location ilike '%new york%'
      or location ilike '%nyc%' or location ilike '%boston%' or location ilike '%seattle%'
      or location ilike '%austin%' or location ilike '%chicago%' or location ilike '%los angeles%'
      or location ilike '%denver%' or location ilike '%atlanta%' or location ilike '%washington%'
      or location ilike '%, ca%' or location ilike '%, ny%' or location ilike '%, tx%' or location ilike '%, ma%'
      or location ilike '%, wa%' or location ilike '%, il%' or location ilike '%united states%' or location ilike '%, usa%' or location ilike '%, us%'
    );

update public.jobs set region = 'other' where region is null;
