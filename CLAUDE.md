---
project: CareerForge
working_dir: /Users/ishansrivastava/Desktop/Projects/Findmejob
phase: 0 (scaffolding) → next is 1 (model research)
slice: pre-Slice-1
version: 0.1.0
last_updated: 2026-04-27
primary_stack: Next.js (App Router) + Supabase + Vercel AI Gateway
max_lines: 200
---

# CLAUDE.md — CareerForge master entry

Every session starts here. Read this file first. It tells you what to read next based on what you're doing.

---

## What CareerForge is (one line)

AI-native career platform: candid rubric-grounded profile assessment + personalized roadmap + verified job aggregation + on-click tailored bundle (resume, cover letter, interview prep, outreach, company brief) per job.

Target user (v1): job seekers and students in India (Delhi NCR primary), expanding global.

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

**Phase:** 0 (scaffolding complete pending review) → Phase 1 (model research) on approval.

**Active slice:** none yet. Slice 1 begins after Phase 2 architecture is approved.

**Last decision:** sliced delivery (5 slices, ~5–6 months solo+Claude), Next.js-only stack, 3-file memory scaffold.

---

## Slicing plan (release map)

The destination is the full vision in the original architecture prompt. The path is sliced.

| Slice | Scope                                                                                  | Est.  |
|-------|----------------------------------------------------------------------------------------|-------|
| 1     | Profile assessment + match score + tailored resume against ONE source (JSearch)         | 4–6w  |
| 2     | Add cover letter + interview Qs + outreach drafts to on-click bundle                    | 3–4w  |
| —     | **Beta opens.** Onboard 20–50 users. Capture outcomes.                                  | —     |
| 3     | Roadmap engine (skill→resource map) + portfolio analysis + company brief                | 4w    |
| 4     | Multi-source ingestion (Greenhouse/Lever/Ashby) + ghost-job detection                   | 4w    |
| 5     | LinkedIn analysis (paste-in / PDF only — NO auto-fetch) + realistic-chance estimator    | 3w    |
| —     | **GA + paid tiers.** Payment structure decided here with real usage data.               | —     |

Deferred and explicitly scoped out of v1 architecture:
- LinkedIn auto-fetch (ToS risk).
- "Realistic chance" estimator until we have outcome data.
- Naukri/Internshala scraping unless aggregator coverage is clearly insufficient.

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
- **Primary LLM:** Anthropic Sonnet 4.6 (with prompt caching) — confirm in Phase 1.
- **Secondary LLM (scoring):** TBD in Phase 1.
- **Resume engine:** LaTeX via Tectonic, edit-via-JSON pattern, compiled in Vercel Sandbox.
- **Background jobs:** Vercel Queues (beta) + cron.
- **Multi-agent orchestration:** Vercel Workflow DevKit (durable, pause/resume, retries).
- **Python-only deps (e.g., JobSpy):** Vercel Sandbox microVM, called from a Next.js handler.
