---
file: LOG.md
purpose: Append-only session + decision log + last-session block
max_lines: 800
format: "[YYYY-MM-DD HH:MM] [type] one-line summary"
types: [DECISION, BUILD, RESEARCH, BUG, REFACTOR, PIVOT, NOTE]
---

# LOG.md

Append-only. Newest at the bottom. The `## Last session` block at the top is overwritten each session for fast resumption.

---

## Last session

**Date:** 2026-04-27
**Phase:** 3 (Slice 1 schema migration) — **written; awaiting application via `supabase db push`**. Phases 0, 1, 1.5, 2 completed earlier same session.

**Production state:**
- App: https://findmejob-nu.vercel.app (HTTP 200, Next.js scaffold rendering)
- GitHub: https://github.com/Ishan2036624/findmejob (private, main branch, Vercel GH App connected)
- Vercel project: `ishan2036924s-projects/findmejob` (`prj_DPBwJ33VqJqPBgYl60bEhbeP8e16`)
- First production deploy: `dpl_2Cy8QFymKzheyKwJrmhCiVaCcX3y`, READY in 42s

**Stack delivered:**
- Next.js 16.2.4 (App Router, Turbopack), React 19.2.4, Tailwind 4.2.4, TS strict.
- AI SDK 6.0.168 + `@ai-sdk/gateway` 3.0.104 (workload→model map at `src/lib/ai/models.ts`).
- Supabase SSR 0.10.2 + supabase-js 2.104.1 (browser + server clients + auth-refresh middleware).
- `vercel.ts` typed config via `@vercel/config` 0.2.1.
- GH Actions CI (`.github/workflows/ci.yml`) — lint + typecheck on PR + push-to-main.
- Vercel git integration → auto preview deploys on PR, auto prod deploys on main push.

**Env state:**
- Vercel: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set on Production + Development. Preview pending user dashboard action (CLI v52 regression on preview-without-branch).
- Local: `.env.local` populated by `vercel env pull` (Supabase URL + anon + Vercel OIDC token for AI Gateway local dev).
- Pending user action: `vercel env add SUPABASE_SERVICE_ROLE_KEY` interactively (secret never goes through chat transcript).

**Local toolchain set up:**
- npm prefix → `~/.npm-global` (PATH appended to `~/.zshrc`).
- Vercel CLI 52.0.0, pnpm 10.33.2 installed globally there.
- gh CLI authenticated with workflow scope.
- Vercel CLI logged in as `ishan2036924`.
- Vercel MCP authorized (`list_teams` works; `get_project` returns 403 on personal scope — known quirk).

**What's next:**
- User runs `pnpm exec supabase login` + `link --project-ref afuwanatfhcaqejryixc` + `db push` to apply migration.
- Then Phase 4: prompt library skeleton + AI Gateway client wrappers + first agent contract (assessment).

**Open items / user todos:**
- Add `SUPABASE_SERVICE_ROLE_KEY` via `vercel env add` (interactive).
- Copy URL + anon key to Preview environment via Vercel dashboard.
- Real product name (still using "findmejob" / "CareerForge" placeholders).

**Files touched this session:**
- Phase 0/1: CLAUDE.md, .claude/NOTES.md, .claude/LOG.md, .gitignore, README.md, AGENTS.md.
- Phase 1.5 Stage A: full Next.js scaffold + src/instrumentation.ts, src/middleware.ts, src/lib/ai/models.ts, src/lib/supabase/{client,server,middleware}.ts, vercel.ts, .env.example, .github/workflows/ci.yml, package.json scripts.
- Phase 1.5 Stage B/C: .vercel/project.json (gitignored), .env.local (gitignored), Vercel env vars on Production + Development.

---

## Entries

### 2026-04-27

- `[2026-04-27 00:00] [DECISION]` Sliced delivery (5 slices, ~5–6 months solo+Claude) replaces big-bang of original prompt. End state = full vision; path = incremental. Approved by user.
- `[2026-04-27 00:00] [DECISION]` Single stack: Next.js full-stack on Vercel. Original FastAPI+Render split rejected on solo-dev ops-surface grounds. Python-only libs (JobSpy) run in Vercel Sandbox.
- `[2026-04-27 00:00] [DECISION]` 3-file memory scaffold (CLAUDE.md + NOTES.md + LOG.md) replaces the originally-proposed 11-file scaffold. Splits earned, not pre-allocated.
- `[2026-04-27 00:00] [DECISION]` LLM routing standard: Vercel AI Gateway + `provider/model` strings. No direct provider SDKs unless feature demands.
- `[2026-04-27 00:00] [DECISION]` LinkedIn auto-fetch is permanently off-limits (ToS). Paste-in / user-uploaded PDF only.
- `[2026-04-27 00:00] [DECISION]` Naukri/Internshala scraping deferred indefinitely. Aggregator coverage (JSearch India + ATS endpoints in Slice 4) tried first.
- `[2026-04-27 00:00] [DECISION]` "Realistic chance" estimator deferred to Slice 5 (post-beta), once we have outcome data for calibration. v1 ships skills-overlap %.
- `[2026-04-27 00:00] [DECISION]` "Brutal honesty" stays internal. User-facing copy uses "candid + actionable."
- `[2026-04-27 00:00] [BUILD]` Phase 0 scaffolding: CLAUDE.md, NOTES.md, LOG.md, .gitignore, README.md, git init.
- `[2026-04-27 00:00] [RESEARCH]` Phase 1: surveyed April 2026 secondary-LLM market. Sources: Vercel AI Gateway docs, Anthropic/Google/OpenAI/DeepSeek pricing pages, Artificial Analysis leaderboard. Findings written to NOTES.md `## Models`.
- `[2026-04-27 00:00] [DECISION]` Primary heavyweight model: `anthropic/claude-sonnet-4-6`. Reason: 1M context + 10% cache-read pricing makes repeated profile/system-prompt context essentially free.
- `[2026-04-27 00:00] [DECISION]` Routing through Vercel AI Gateway with `provider/model` strings. Confirmed zero markup, automatic failover, one-line model swaps. `instrumentation.ts` will set `globalThis.AI_SDK_DEFAULT_PROVIDER` if we ever pin a default.
- `[2026-04-27 00:00] [PIVOT]` Revised model split after user pushback on Sonnet cost + "why not all mini": 3-tier mapping. Sonnet 4.6 ONLY for orchestrator + assessment + resume tailoring (the moat). GPT-4.1 mini for everything else (cover letter, interview Qs, outreach, brief, roadmap, scoring, classification, extraction). Gemini Flash-Lite removed as default — held in reserve via AI Gateway. Embeddings deferred to Slice 1.
- `[2026-04-27 00:00] [DECISION]` Why mini over Flash-Lite (user override): user judged Flash-Lite's strict-JSON reliability inferior to mini for scoring. Cost cost: ~4× more at scale ($6.5K/mo vs $1.6K/mo at 1k users). Tolerated in beta; revisit at production scale via one-line gateway swap.
- `[2026-04-27 00:00] [DECISION]` Prompt caching is mandatory from Slice 1. Every Sonnet call must structure prompt as: stable prefix (system + rubrics + profile) followed by volatile suffix (JD + edit instructions). Target ≥70% input tokens served from cache. Reduces Sonnet effective cost ~3×.
- `[2026-04-27 00:00] [DECISION]` Cost-discipline gate: paid tiers must be live before crossing ~500 active users. At 1k users, projected LLM spend is $8K–19K/month depending on usage profile.
- `[2026-04-27 00:00] [NOTE]` Embeddings model deferred to Slice 1 implementation; tentatively Voyage v4 or `openai/text-embedding-3-large`.
- `[2026-04-27 00:00] [BUILD]` Phase 1.5 Stage A: Next.js 16 scaffold (App Router, Turbopack, Tailwind 4, TS strict) + AI SDK 6 + Vercel AI Gateway + Supabase SSR (browser + server + middleware) + `vercel.ts` typed config + GH Actions CI (lint + typecheck). Local commit `95fea0e`. `pnpm typecheck` and `pnpm lint` both clean.
- `[2026-04-27 00:00] [DECISION]` Local toolchain set up under user-writable `~/.npm-global` prefix. PATH appended to `~/.zshrc`. Avoids the `/usr/local` permission issue that blocked `corepack enable`.
- `[2026-04-27 00:00] [BUILD]` Created private GitHub repo `Ishan2036924/findmejob`. Vercel GitHub App installed by user → `vercel git connect` succeeded → auto-deploy pipeline live (PR → preview, main → prod).
- `[2026-04-27 00:00] [BUILD]` Vercel project `ishan2036924s-projects/findmejob` linked. First production deploy ready in 42s at https://findmejob-nu.vercel.app. HTTP 200 verified, middleware not crashing, Turbopack chunks served.
- `[2026-04-27 00:00] [DECISION]` Vercel CLI v52 has a regression on `vercel env add NAME preview --value VALUE --yes` (returns `git_branch_required` even with the documented form). Workaround: configure Preview env vars via dashboard. Documented in NOTES.md Lessons.
- `[2026-04-27 00:00] [DECISION]` `AI_GATEWAY_API_KEY` not separately provisioned — Vercel auto-injects it on deployed envs; local dev uses `VERCEL_OIDC_TOKEN` from `vercel env pull`. Single-source-of-truth for AI auth.
- `[2026-04-27 00:00] [PIVOT]` Project rename: dropped CareerForge placeholder, locked-in name is **findmejob** per user.
- `[2026-04-27 00:00] [BUILD]` Phase 2: Slice 1 architecture written into NOTES.md `## Architecture`. Data model (6 tables: profiles, resumes, jobs, assessments, generations, match_scores). Component Mermaid diagram. Single-pass Sonnet flow for resume tailoring (no Workflow DevKit yet — Slice 2). 3-layer prompt-cache strategy targeting 70%+ hits. Cost model at 100 users: ~$75–80/mo total.
- `[2026-04-27 00:00] [DECISION]` Slice 1 scope ruthlessly cut: only profile assessment + match score + single-source job feed (JSearch India) + on-click tailored resume PDF. Cover letter / interview Qs / outreach / brief / roadmap / multi-source / LinkedIn / ghost-job / "realistic chance" all explicitly Slice 2-5.
- `[2026-04-27 00:00] [DECISION]` Slice 1 match scoring: lazy (compute on feed view), cached permanently per (profile_id, job_id), invalidate on profile resume change. Trade-off: first feed view slow; mitigated by parallel-compute + pagination.
- `[2026-04-27 00:00] [DECISION]` Slice 1 resume tailoring uses single-pass Sonnet + `waitUntil` for background work. No Workflow DevKit / queue. WDK lands in Slice 2 when on-click bundle needs 5+ parallel agents.
- `[2026-04-27 00:00] [DECISION]` Vector embeddings deferred to Slice 4 (ghost-job detection trigger). Slice 1 match scoring is direct LLM, no pgvector.
- `[2026-04-27 00:00] [DECISION]` Slice 1 ships rubrics for SWE + data_ml only. Other role families added based on actual beta signups, not pre-emptively.
- `[2026-04-27 00:00] [DECISION]` PDF parser: `unpdf` (Vercel-friendly, no native deps) with text-paste as first-class fallback. PDF upload is best-effort with explicit "verify extracted fields" step before assessment fires.
- `[2026-04-27 00:00] [BUILD]` Phase 3: Slice 1 schema migration written at `supabase/migrations/20260427180700_slice1_schema.sql`. 6 tables + 7 enums + RLS policies for all + trigger to auto-create profile on signup + updated_at triggers + private `resumes` storage bucket with path-prefix RLS. 249 lines.
- `[2026-04-27 00:00] [DECISION]` Supabase CLI installed as project devDep (npm global install is blocked by Supabase). pnpm 10 ignored postinstall by default; added `pnpm.onlyBuiltDependencies: ["supabase"]` to package.json so the binary download script runs.
- `[2026-04-27 00:00] [DECISION]` Storage bucket path convention: `{user_id}/{resume_id}.pdf`. Path-prefix RLS via `(storage.foldername(name))[1] = auth.uid()::text` keeps each user isolated to their own folder.
- `[2026-04-27 00:00] [DECISION]` Profile creation strategy: trigger on `auth.users` insert (`handle_new_user()`) auto-inserts an empty `profiles` row. App code never has to call `insert into profiles` for new signups.
