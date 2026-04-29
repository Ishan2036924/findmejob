-- =======================================================================
-- Slice 2 Step 5: company-type classification on applications.
-- Adds an enum + nullable column populated post-hoc by the company
-- classifier agent (gpt-4.1-mini) when an application is created.
-- =======================================================================

create type company_type as enum (
  'startup',
  'big_tech',
  'mnc',
  'agency',
  'consultancy',
  'nonprofit',
  'government',
  'other'
);

alter table public.applications
  add column company_type company_type;

create index applications_company_type_idx
  on public.applications (profile_id, company_type)
  where company_type is not null;
