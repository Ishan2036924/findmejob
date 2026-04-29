-- =======================================================================
-- Slice 2 Step 1: extend `generation_kind` enum for the 4 on-demand text
-- artifacts wired into /applications/[id] (cover letter, company brief,
-- interview questions, outreach drafts).
--
-- Practice sessions stay in the dedicated `practice_sessions` table — they
-- are interactive, not single-shot generations.
-- =======================================================================

alter type generation_kind add value if not exists 'cover_letter';
alter type generation_kind add value if not exists 'company_brief';
alter type generation_kind add value if not exists 'interview_questions';
alter type generation_kind add value if not exists 'outreach_drafts';
