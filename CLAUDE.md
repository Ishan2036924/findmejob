---
project: findmejob
working_dir: /Users/ishansrivastava/Desktop/Projects/Findmejob
phase: Slice 3 reshape complete — Phase 7.1 NO-GO by 0.05; 2 small fixes pending
slice: Slice 3 reshape (cost + agentic + attachments + LinkedIn + content safety + role expansion + synth eval)
version: 0.13.0
last_updated: 2026-05-01
production_url: https://findmejob-nu.vercel.app
github_repo: https://github.com/Ishan2036924/findmejob
primary_stack: Next.js (App Router) + Supabase + AI SDK 6 (direct provider SDKs)
max_lines: 220
---

# CLAUDE.md — findmejob master entry

Every session starts here. Read this file first. It tells you what to read next based on what you're doing.

---

## What findmejob is (one line)

AI-native career platform: candid rubric-grounded profile assessment + verified job aggregation + on-demand artifacts (tailored resume, cover letter, interview prep, outreach drafts, company brief) + master career agent (chat) that drives every action via tools + longitudinal analytics + LinkedIn-aware onboarding.

**Target user (v1):** job seekers and students in **India + USA, equal priority.** No primary-vs-secondary market split. Default `target_location` is user-picked at onboarding.

---

## Read-next pointers (by task type)

| Task | Read in order |
|---|---|
| Resuming work after a break | LOG.md (last 5 entries), this file `## Current focus` |
| Synth eval status / what's pending | `scripts/synth/SUMMARY.md` then `scripts/synth/REPORT.md` |
| Architecture / system design | NOTES.md `## Architecture` |
| Domain question (ATS, LaTeX, jobs, rubrics) | NOTES.md `## Domain` |
| Model / provider question | NOTES.md `## Models` |
| Term you don't recognize | NOTES.md `## Glossary` |
| "Why did we decide X?" | LOG.md (search `[DECISION]`) |
| Adding a new role family | `src/lib/ai/prompts/rubrics/` follow `swe.v1.ts` template + register in `index.ts` |

---

## Hard rules (non-negotiable)

1. **Push back, don't please.** No sycophancy. If user's plan has a flaw, say so with reasoning. Senior, not eager.
2. **Follow the user's plan after pushback.** Concerns inline as `[suggestion]`, never silent substitutions. (See memory: `feedback_follow_user_plan.md`.)
3. **User runs commits + pushes himself.** Provide commands; never run `git commit` / `git push`. (See memory: `feedback_user_commits.md`.)
4. **Phase gates are real.** Stop and request approval at the end of every phase.
5. **Token economy.** Structured > prose. Tables/YAML/bullets in memory files.
6. **Append to LOG.md on every decision/build/research/bug/pivot.**
7. **Brutal honesty stays internal.** External copy uses "candid + actionable."
8. **Single stack.** Next.js full-stack on Vercel + Supabase. Python only inside Vercel Sandbox for libs with no JS equivalent.
9. **Direct provider SDKs:** `@ai-sdk/openai` for non-moat (mini), `@ai-sdk/anthropic` for moat (Sonnet). The earlier "Vercel AI Gateway only" rule was relaxed because BYOK direct billing is what the user actually uses. Gateway pattern remains acceptable.
10. **Anti-injection hygiene** for any LLM call that takes user-supplied resume / JD / attachment content (delimiters, role clamping, output schemas).
11. **Zod 4 + LLM structured output** — NO `.optional()` (use `.nullable()`), NO `.int()`, NO `.min/.max` on integers/arrays, NO `z.record()`. (See memory: `feedback_zod_llm_schemas.md`.)
12. **Pull Vercel runtime logs autonomously** via `vercel logs --no-follow --json`. Don't ask user to paste toasts. (See memory: `feedback_vercel_logs.md`.)
13. **Puppeteer for autonomous UI inspection.** Playwright rejected. Snap script at `scripts/snap.mjs`. (See memory: `feedback_no_screenshot_tooling.md`.)

---

## Current focus (2026-05-01)

**Phase:** Slice 3 reshape complete. Phase 7.1 synth eval ran. Verdict: **NO-GO by 0.05** (chat agent 3.45/5 vs 3.50 gate).

**What's shipped end-to-end:**
- All of Slice 1 (assessment + match score + JSearch feed + tailored resume HTML + paste-a-job + applications log)
- All of Slice 2 (per-job artifact buttons + practice mode + multi-source ingest with daily cron + AppShell + chat agent + analytics + PDF upload)
- All of Slice 3 reshape (rate limits + once-daily feed + 19-tool master agent + chat attachments with vision + LinkedIn-aware onboarding + content safety + memory cap + rolling thread summary + 17 role families with rubrics)

**2 pending fixes before beta-ready GO verdict:**
1. **Off-topic refusal** (1/5) — career-agent system prompt missing "decline non-career questions" line. User A produced biryani recipe instead of refusing. ~5min fix.
2. **Assessment latency for senior AI/ML** (1/5) — User B Sonnet assessment took 187s (3× the 60s budget). Investigate prompt-cache hits + consider chunking complex resumes.

**Not committed yet:** the role family expansion (17 active families + 15 new rubrics + match-score & career-agent rubric injection) is on disk but not pushed. User has been pushing commits manually.

**Synth users in DB:** `synth-{a,b,c}@findmejob.test` (password `synth-password-2026`). Cleanup script ready at `scripts/synth/cleanup.ts` — user hasn't run it yet.

---

## Slicing plan (actual delivery, not original plan)

Original 5-slice plan in plan file `/Users/ishansrivastava/.claude/plans/this-is-my-plan-jaunty-swing.md` was reshaped mid-flight. Actual delivery:

| Slice | Status | What it covered |
|---|---|---|
| 1 | ✅ shipped | Assessment + match score + feed + tailored resume + paste-a-job + applications log |
| 2 | ✅ shipped | Per-job artifact buttons + practice + multi-source ingest + AppShell + chat agent + analytics + PDF upload |
| 3 reshape | ✅ shipped | Rate limits + master-agent expansion + attachments+vision + LinkedIn import + content safety + memory hygiene + role family expansion (17 active) |
| Phase 7 | ✅ ran | Synth eval w/ 76-param rubric — exposed 4 critical safety failures |
| Phase 7.1 | ✅ ran | Safety fixes + chat agent grading. Verdict: NO-GO by 0.05 |
| Phase 7.2 (next) | pending | Off-topic refusal + B latency investigation → re-run synth → expected GO |
| Beta opens | pending | After Phase 7.2 GO verdict |
| Slice 4 | unbuilt | Roadmap engine + portfolio analysis (already covered: multi-source, analytics — moved into Slice 2) |
| Slice 5 | unbuilt | Realistic-chance estimator (post-beta data) |

**Permanently deferred:** LinkedIn auto-fetch (ToS); Naukri/Internshala scraping; auto-apply on user's behalf; voice/video practice.

---

## How to start a session (checklist)

1. Read this file.
2. Read `.claude/LOG.md` last 5 entries.
3. Read `scripts/synth/SUMMARY.md` if eval-related work.
4. State in one line what you understand the current state to be and what you're about to do.
5. Wait for confirmation if anything is unclear.

## How to end a session (checklist)

1. Append to `.claude/LOG.md` (one entry per decision/build/research/bug/pivot).
2. Update `.claude/LOG.md` `## Last session` block (overwrite).
3. Update this file's frontmatter (`phase`, `slice`, `version`, `last_updated`) if any changed.
4. Update memory files at `~/.claude/projects/-Users-ishansrivastava-Desktop-Projects-Findmejob/memory/` for any durable feedback or project state changes.
5. Tell the user what files changed and why.

---

## File budget (memory tier)

| File | Max lines | Purpose |
|---|---|---|
| CLAUDE.md (this) | 220 | Entry point, hard rules, current focus, read-next routing |
| .claude/NOTES.md | 600 | Project facts + domain + glossary + models + architecture |
| .claude/LOG.md | 1500 | Append-only log + last-session block (raised from 800 — log is the durable record) |

When NOTES.md crosses 600 lines, propose splitting one well-isolated section.

---

## Stack snapshot (full detail in NOTES.md `## Architecture`)

- **Frontend + API:** Next.js 16 App Router on Vercel (Fluid Compute, Node.js runtime).
- **DB + Auth + Storage:** Supabase (Postgres + RLS + Auth + Storage). Buckets: `resumes`, `chat-attachments`.
- **Primary LLM (moat only):** Anthropic Sonnet 4.5/4.6 — assessment + resume tailoring. Direct via `@ai-sdk/anthropic`. Prompt caching mandatory.
- **Secondary LLM (everything else):** OpenAI GPT-4.1-mini — cover letter, brief, interview Qs, outreach, practice, match score, resume parser, job extractor, **career agent (master), memory distiller, thread summarizer, content moderation**. Direct via `@ai-sdk/openai`. Vision-capable for chat attachments.
- **Resume engine v1:** HTML preview + browser-print PDF (LaTeX/Tectonic deferred post-beta).
- **Background jobs:** Vercel cron (daily ingest at 06:00 IST, also scores all onboarded users).
- **Anti-multi-agent decision:** single tool-using agent with 19 tools (read + write). NOT multi-agent orchestration. The user's "master + subagents" mental model maps to "master agent calls subagent tools" — same UX, simpler implementation.
- **Role families:** 17 active + 1 fallback. Each has a rubric in `src/lib/ai/prompts/rubrics/<slug>.v1.ts` registered in `index.ts`. Rubric injected into assessment + match-score + career-agent (compact form).
- **Content safety:** OpenAI omni-moderation-latest on user input + regex PII pre-check (SSN, credit-card with Luhn, passport, Aadhaar). Hard-blocks: `sexual/minors`, `self-harm/instructions`, `self-harm/intent`, `violence`, `violence/graphic`, `illicit`, `illicit/violent`, `harassment/threatening`, `hate/threatening`.
- **Memory hygiene:** Top 50 memories per turn (env-tunable `MEMORY_CONTEXT_CAP`), ranked by `importance × last_used_at × created_at`. Rolling 2-3-sentence thread summary kicks in past 30 messages.
- **Cost guardrails:** 6 daily caps, env-tunable: chat 50, artifacts 10, practice 20, attachments 10, paste-JD 20, agent-driven refresh 1.
