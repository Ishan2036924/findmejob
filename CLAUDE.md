---
project: findmejob
working_dir: /Users/ishansrivastava/Desktop/Projects/Findmejob
phase: Slice 1 build — Steps 1-5 shipped; Step 6 in progress
slice: Slice 1 in progress (paste-a-job + applications shipping in Step 6c, LaTeX/PDF in 6a)
version: 0.7.0
last_updated: 2026-04-29
production_url: https://findmejob-nu.vercel.app
github_repo: https://github.com/Ishan2036924/findmejob
primary_stack: Next.js (App Router) + Supabase + Vercel AI Gateway
max_lines: 200
---

# CLAUDE.md — CareerForge master entry

Every session starts here. Read this file first. It tells you what to read next based on what you're doing.

---

## What CareerForge is (one line)

AI-native career platform: candid rubric-grounded profile assessment + personalized roadmap + verified job aggregation + per-job on-demand artifacts (tailored resume, cover letter, interview prep, outreach drafts, company brief) + personalized career agent with full longitudinal context of the user's job-search history.

**Target user (v1):** job seekers and students in **India + USA, equal priority.** No primary-vs-secondary market split. Default `target_location` is user-picked at onboarding.

---

## Read-next pointers (by task type)

| Task                                     | Read in order                                                 |
|------------------------------------------|---------------------------------------------------------------|
| Resuming work after a break              | LOG.md (last 5 entries)                                       |
| **Writing any Next.js code**             | `AGENTS.md`, then `node_modules/next/dist/docs/` per topic    |
| Architecture / system design             | NOTES.md `## Architecture` (Phase 2+ only)                    |
| Domain question (ATS, LaTeX, jobs)       | NOTES.md `## Domain`                                          |
| Model / provider question                | NOTES.md `## Models`                                          |
| Term you don't recognize                 | NOTES.md `## Glossary`                                        |
| "Why did we decide X?"                   | LOG.md (search `[DECISION]`)                                  |
| New slice planning                       | This file `## Slicing plan` + LOG.md last DECISION            |

If a section reference points to a file that doesn't exist or is empty, that section hasn't been built yet — note it and ask before assuming.

---

## Hard rules (non-negotiable)

1. **Push back, don't please.** No sycophancy. If the user's plan has a flaw, say so with reasoning. Senior, not eager.
2. **Phase gates are real.** Stop and request approval at the end of every phase. Do not skip ahead.
3. **Token economy is sacred.** Structured > prose. Tables/YAML/bullets. No fluffy paragraphs in memory files. Every file states its max length; propose a split when crossed.
4. **Append to LOG.md on every decision, build, research, bug, pivot.** Format below.
5. **Update LOG.md `## Last session` block at session end** before closing.
6. **Brutal honesty stays internal.** Do not reuse the word "brutal" in user-facing copy or UI — call it "candid + actionable" externally.
7. **No code in Phase 0/1.** Architecture and research only.
8. **Single stack.** Next.js full-stack on Vercel. Python only inside Vercel Sandbox for libs with no JS equivalent (e.g. JobSpy). No FastAPI server.
9. **Models default through Vercel AI Gateway** using `provider/model` strings — never hardcode SDK provider packages unless explicitly required.
10. **Anti-injection hygiene** for any LLM call that takes user-supplied resume / JD content (delimiters, role clamping, output schemas).

---

## Current focus

**Phase:** Slice 1 build, Step 6.

**Shipped:** auth, onboarding, assessment (Sonnet), feed (JSearch with mock fallback), match scoring (mini), live at https://findmejob-nu.vercel.app.

**In flight:** Step 6 expansion to ship paste-a-job + applications log (formerly Slice 3) alongside the tailored resume PDF (originally just 6a). Order: 6c (applications shell) → 6b (paste-a-job) → 6a (LaTeX/Tectonic/Sandbox PDF).

**Last decision (2026-04-29):** lazy per-button artifact generation, not eager bundles. Per-job dashboard at /applications/[id] has artifact buttons (cover letter, company brief, interview Qs, outreach, practice). Each is its own server action + DB row. Saves tokens on artifacts users don't ask for. Application tracker becomes the SHELL of Slice 2, not a separate Slice 3 feature.

---

## Slicing plan (release map)

The destination is the full vision in the original architecture prompt. The path is sliced.

| Slice | Scope                                                                                                                                | Est.  |
|-------|--------------------------------------------------------------------------------------------------------------------------------------|-------|
| 1     | Assessment + match score + JSearch feed + tailored resume PDF + **paste-a-job (URL/JD) + applications log**                         | 5–6w  |
| 2     | **Per-job dashboard** w/ on-demand artifact buttons: cover letter, company brief, interview Qs, outreach, **practice mode** (mock-Q&A) | 3–4w  |
| —     | **Beta opens.** Onboard 20–50 users. Capture outcomes.                                                                              | —     |
| 3     | Roadmap engine (skill→resource map) + portfolio analysis + **application analytics** ("top 3 gaps across applied JDs")              | 4w    |
| 4     | **Daily cron ingestion** + multi-source (Greenhouse/Lever/Ashby/AngelList + JSearch India + US) + curated US/India company list + ghost-job detection | 4w    |
| 5     | LinkedIn analysis (paste-in only) + realistic-chance estimator (calibrated post-data)                                                | 3w    |
| —     | **GA + paid tiers.** Payment structure decided here with real usage data.                                                            | —     |

Deferred and explicitly scoped out of v1:
- LinkedIn auto-fetch (ToS risk).
- "Realistic chance" estimator until beta gives outcome data to calibrate.
- Naukri/Internshala/Cutshort scraping. Aggregators only.
- Auto-apply on user's behalf. Never (abuse risk).
- Voice / video practice. Post-GA.

**On-demand vs eager:** every Slice 2 artifact (cover letter, brief, interview Qs, outreach) is generated by an explicit user click on the per-job dashboard, not auto-generated. Users only spend tokens on what they actually want.

---

## How to start a session (checklist)

1. Read this file.
2. Read `.claude/LOG.md` last 5 entries.
3. State in one line what you understand the current state to be and what you're about to do.
4. Wait for confirmation if anything is unclear.

## How to end a session (checklist)

1. Append to `.claude/LOG.md` (one entry per decision/build/research/bug/pivot).
2. Update `.claude/LOG.md` `## Last session` block (overwrite).
3. Update this file's frontmatter (`phase`, `slice`, `version`, `last_updated`) if any changed.
4. Tell the user what files changed and why.

---

## File budget (memory tier)

| File                  | Max lines | Purpose                                                     |
|-----------------------|-----------|-------------------------------------------------------------|
| CLAUDE.md (this)      | 200       | Entry point, hard rules, current focus, read-next routing.  |
| .claude/NOTES.md      | 600       | Project facts + domain + glossary + models + architecture.  |
| .claude/LOG.md        | 800       | Append-only log + last-session block.                       |

When NOTES.md crosses 600 lines, propose splitting one well-isolated section into its own file (e.g., `.claude/ARCHITECTURE.md`). Do not split before that — premature.

---

## Stack snapshot (full detail in NOTES.md `## Architecture`)

- **Frontend + API:** Next.js App Router on Vercel (Fluid Compute).
- **DB + Auth + Storage:** Supabase (Postgres + RLS + Auth + Storage).
- **LLM routing:** Vercel AI Gateway (`provider/model` strings).
- **Primary LLM:** Anthropic Sonnet 4.6 — moat features ONLY (profile assessment + resume tailoring). BYOK direct via `@ai-sdk/anthropic`. Prompt caching mandatory.
- **Secondary LLM:** OpenAI GPT-4.1 mini — everything else, no exceptions: cover letter, company brief, interview Qs, outreach drafts, practice mode, roadmap, match scoring, resume parsing, job extraction, **career agent (Slice 3)**, memory distiller, thread summarizer. BYOK direct via `@ai-sdk/openai`. New features default here.
- **Resume engine:** LaTeX via Tectonic, edit-via-JSON pattern, compiled in Vercel Sandbox.
- **Background jobs:** Vercel Queues (beta) + cron.
- **Multi-agent orchestration:** Vercel Workflow DevKit (durable, pause/resume, retries).
- **Python-only deps (e.g., JobSpy):** Vercel Sandbox microVM, called from a Next.js handler.
