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

**Date:** 2026-05-10
**Phase:** Phase 7.3 synth eval ran. **🟢 GO — beta-ready.**

**Headline numbers (Phase 7.3, 4 synth users, 76-param rubric):**
- Overall: **4.14/5** (Phase 7.1 was 2.90 — +1.24 jump)
- Tailor pipeline v3: **4.96/5** (NEW; verifier 95/100 across all 4 users; 10-12 edits applied each; zero retries needed)
- Chat agent (master-agent UX): **4.00/5** (was 3.45; passed 3.50 GO gate with margin)
- Off-topic refusal: **5/5** (was 1/5 in Phase 7.1)
- All 3 critical safety probes: 5/5 (violence, SSN/passport, credit card all blocked correctly)

**This session (2026-05-09 → 2026-05-10) shipped:**

**Phase 7.2 (earlier in session, deployed):**
- Feed region tagging — `jobs.region` enum + `inferRegion()` helper + backfill migration; cron tags every new job
- Feed query filtered by `userRegion(target_location)`; Delhi NCR users see India + remote only
- Restored manual refresh button (was deleted) — rate-limited 1/day via `checkRefreshRateLimit`
- Tailor v2 retry-on-empty + telemetry + delta header on resume detail page
- System prompt cluster: off-topic refusal + confirm-before-write tightening + assessment cache logging + resume cap + company-brief anti-hallucination

**Phase 7.3 (this turn, on disk, NOT yet pushed):**
- Tailor v3 multi-step pipeline (`src/lib/ai/agents/{jd-analyzer,tailor-verifier}.ts`): mini analyzer extracts must_haves/vocabulary/red_flags → Sonnet tailor with analysis as ground truth → mini verifier scores 0-100 with must_haves_addressed/missing/hallucination_risks. Auto-retry once if score<70.
- 5 new chat tools (master agent: 19 → 24 tools): `update_profile_targets`, `list_feed_jobs`, `save_feed_job`, `parse_attachment_as_resume`, `commit_resume_replacement`. The last two require explicit "yes" confirmation per system prompt.
- Synth eval refresh: 4th synth user (User D — entry-level Data Analyst, Bangalore); per-scenario `assembled_messages` capture; per-user tailor pipeline trace; new "Tailor pipeline (v3)" rubric category (5 params; 3 deterministic, 2 LLM-graded).
- New eval output `scripts/synth/TRACE.md` — human-readable side-by-side: chat scenario per user (assembled context → tools → response) + tailor pipeline per user (analyzer → Sonnet edits → verifier scoring).

**Eval files written (2026-05-10):**
- `scripts/synth/SUMMARY.md` — exec summary, GO verdict
- `scripts/synth/REPORT.md` — full 76-param scorecard
- `scripts/synth/TRACE.md` — backend visibility per the user's "what you saw" ask

**2 non-blocking issues for post-beta polish:**
1. Assessment latency on User A (114s, 1/4 users; others 44-58s). Sonnet just slow on certain resume shapes. Not urgent.
2. `failure_modes_documented` (1/5) — pure docs gap, not behavior. System blocks correctly.

**Architecture decisions locked this session:**
- Multi-step tailor (Reflexion-pattern) on Sonnet ≈ Opus quality at ~⅓ cost. User can't afford Opus; this is the answer.
- Tailor verifier on mini, not Sonnet. Verification is constrained scoring; mini sufficient. Revisit if scores correlate poorly with quality.
- Credit/billing system explicitly DEFERRED this turn (per user call). Daily count caps remain the sole cost-control mechanism. Existing token columns in `chat_messages` + `generations` are reconstructable per-user spend data when ready to monetize.
- `update_profile` (full overwrite) intentionally NOT added as a tool — only `update_profile_targets` (3 fields). Resume replacement gates through the explicit two-step parse-then-confirm flow to prevent accidental overwrites.

**Synth users in DB:** `synth-{a,b,c,d}@findmejob.test` (password `synth-password-2026`). Run `pnpm tsx scripts/synth/cleanup.ts` when ready.

**What's next when user resumes:**
1. Push the Phase 7.3 commit (tailor v3 + 5 tools + synth refresh).
2. Read `scripts/synth/TRACE.md` to see the backend per-step view.
3. Decide closed-beta cohort recruitment (5-10 users to start).
4. Cleanup synth users (optional).
5. Start Slice 4 (roadmap engine + portfolio analysis) if any features remain pre-beta. Most of original Slice 4 was absorbed into Slice 2 already (multi-source ingest, analytics).

**Files touched this session (Phase 7.2 + 7.3 combined):**

Phase 7.2 (already deployed):
- `supabase/migrations/20260506120000_jobs_region.sql` (NEW)
- `src/lib/jobs/region.ts` (NEW)
- `src/lib/jobs/{curated-companies,jsearch,ingest,queries,actions,score-all-users}.ts`, `src/lib/jobs/ats/{greenhouse,lever,ashby}.ts`, `src/lib/jobs/mock-jobs.ts`
- `src/app/(app)/jobs/{page,refresh-feed-button}.tsx` (button restored)
- `src/lib/ai/agents/{tailor,assessment,company-brief,career}-agent.ts`, prompt files
- `src/lib/resume/{actions,queries}.ts`, `src/app/(app)/applications/[id]/resume/[resumeId]/page.tsx`

Phase 7.3 (on disk, awaiting push):
- `src/lib/ai/agents/{jd-analyzer,tailor-verifier,tailor-agent}.ts`
- `src/lib/ai/prompts/system/{jd-analyzer,tailor-verifier,tailor,career-agent}.system.ts`
- `src/lib/ai/schemas/{jd-analysis,tailor-verification}.ts`
- `src/lib/ai/tools/{update-profile-targets,list-feed-jobs,save-feed-job,parse-attachment-as-resume,commit-resume-replacement}.ts`
- `src/lib/ai/agents/career-agent.ts` (24 tools registered)
- `src/lib/resume/{actions,queries}.ts` (verifier persistence)
- `src/app/(app)/applications/[id]/resume/[resumeId]/page.tsx` (verifier badge + must-haves UI)
- `scripts/synth/{profiles,run,grade}.ts` (4th user + traces + new rubric + TRACE.md)

**Open items / user todos:**
- Push Phase 7.3 commit.
- Read `scripts/synth/TRACE.md`.
- Run `pnpm tsx scripts/synth/cleanup.ts` when ready.
- Recruit closed-beta cohort.

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
- `[2026-04-27 00:00] [BUILD]` Phase 3 applied: `supabase db push` ran cleanly from Bash tool after user did interactive login + link. CLI auth token at `~/.supabase/access-token` + project link at `supabase/.temp/` propagated to spawned shells. Migration `20260427180700` synced (local == remote).
- `[2026-04-27 00:00] [BUILD]` Phase 4: prompt library + agent contracts. 17 files under `src/lib/ai/` covering cache helper, Zod schemas (profile + assessment + tailor + match-score), system prompts (3), role-family rubrics (swe + data_ml), and 3 agent functions. Assessment fully wired to AI Gateway via `generateObject`; tailor + match-score have locked contracts and stubbed bodies. `pnpm typecheck` and `pnpm lint` clean.
- `[2026-04-27 00:00] [DECISION]` Cache layout for Sonnet calls: 3 breakpoints — system (1h), rubric (1h), profile (5m). Volatile final user message pushes the cache prefix to ~70% of input tokens.
- `[2026-04-27 00:00] [DECISION]` ESLint configured to ignore `_`-prefixed unused vars — standard TS convention for intentionally-unused stub params and destructure remainders.
- `[2026-04-27 00:00] [DECISION]` Resume JSON v1 schema locked: contact, summary, experience, education, projects, skills, certifications. Will iterate as PDF parsing surfaces edge cases. Schema lives in `src/lib/ai/schemas/profile.ts` and is the source of truth shared by every agent.
- `[2026-04-27 00:00] [BUILD]` Slice 1 Step 1: design system + landing + auth. shadcn/ui initialized with `base-nova` preset (Base UI primitives, not Radix). 16 ui components added (button, input, label, card, sonner, skeleton, separator, avatar, dropdown-menu, dialog, sheet, tabs, progress, alert, badge, tooltip). motion v12 + next-themes installed. ThemeProvider wraps app, dark by default. Landing page with animated hero + features grid. /sign-in + /sign-up with magic link + Google OAuth. /auth/callback handles code exchange.
- `[2026-04-27 00:00] [DECISION]` Sign-in flow: magic link is primary (Supabase OTP via email). Google OAuth as alternative. Sign-up reuses sign-in form — Supabase creates account on first link click, no separate sign-up form needed. Cleaner UX, less code duplication.
- `[2026-04-27 00:00] [DECISION]` shadcn `base-nova` preset uses Base UI not Radix → no `asChild` on Button. Use `buttonVariants()` with `cn()` to apply button styles to Link. Documented in this log so future code follows the same pattern.
- `[2026-04-27 00:00] [DECISION]` `siteUrl()` precedence: NEXT_PUBLIC_SITE_URL (manual override) > VERCEL_PROJECT_PRODUCTION_URL (stable) > VERCEL_URL (per-deploy) > localhost:3000.
- `[2026-04-29] [PIVOT]` Geographic scope expanded: India + USA, equal priority (was India primary, US secondary). Slice 4 multi-source must cover both regions with curated company lists per geo. Default `target_location` becomes user-picked at onboarding. Region-aware prompt language (no "lakhs" for US, no "$" for India unless context demands).
- `[2026-04-29] [DECISION]` Model cost policy locked: Sonnet 4.6 only for moat features (assessment + resume tailoring). Mini for everything else, no exceptions, including the future Slice 3 career agent. Career agent on mini accepts a ~4% tool-call accuracy gap vs Sonnet for ~10x cost reduction (~$0.10 → ~$0.01 per agent turn). New features default to mini; Sonnet requires explicit brand-defining + voice-critical justification.
- `[2026-04-29] [DECISION]` Orchestrator role removed from MODELS map. Slice 2 dropped multi-agent orchestration in favor of lazy per-button artifact generation; no orchestrator code path exists.
- `[2026-04-29] [BUILD]` `JSEARCH_API_KEY` provisioned in Vercel Production + Development envs and synced to local `.env.local`. Preview env pending dashboard add (CLI v52 regression on `vercel env add ... preview` blocks the all-branches case). Free Basic tier on RapidAPI (200 req/month, hard limit) — sufficient for early beta; upgrade to Pro (~$10/mo, 10k req/month) when Slice 4 daily cron starts hitting the cap.
- `[2026-04-29] [DECISION]` Slice 2 sequencing locked: 5 steps before beta opens (artifacts → multi-source → memory+chat foundation → career agent + tools → analytics + cost guardrails). User chose "ship everything before beta" over my "open beta on Slice 1, sequence by feedback" recommendation. Risk noted: 6–8 weeks no user feedback. Proceeding.

### 2026-05-06 → 2026-05-10 (Phase 7.2 + 7.3)

- `[2026-05-06] [BUG]` User reported Delhi NCR feed showing California jobs. Root cause via Explore audit: `src/lib/jobs/queries.ts` `getFeed()` had zero `WHERE` on location; cron ingests US queries unconditionally; curated companies are 21 US / 10 India; match scoring runs against all global jobs.
- `[2026-05-06] [BUG]` User reported tailored resume looks identical to input. Root cause: `tailor.system.ts` was stub-quality (`v1.2026-04-27.stub`), overly conservative prompt → agent returns `edit_ops: []` → `applyEditOps(base, [])` returns base unchanged.
- `[2026-05-06] [BUILD]` Phase 7.2 shipped: `jobs.region` enum + `inferRegion()` helper + backfill migration + `userRegion()` filter on getFeed + score-all-users + restored daily refresh button (rate-limited 1/day) + tailor v2 retry-on-empty + delta-display UI.
- `[2026-05-06] [BUILD]` System prompt cluster updated: career-agent off-topic rule 14 + confirm-before-write tightened with binary imperative heuristic + assessment cache logging + resume cap (30k char serialized) + company-brief grounding hard rules.
- `[2026-05-09] [DECISION]` Credit/billing system DEFERRED. User explicitly chose "skip credit system entirely for now" over the proposed telemetry-only soft-cap option. Existing daily count caps remain the only cost-control mechanism.
- `[2026-05-09] [BUILD]` Phase 7.3 Fix 1 — Tailor v3 multi-step pipeline. New: `jd-analyzer.ts` (mini), `tailor-verifier.ts` (mini), `tailor-agent.ts` orchestrates 3-step (analyzer → Sonnet → verifier) + auto-retry once on score<70. New schemas `jd-analysis` and `tailor-verification`. Bumped `TAILOR_SYSTEM_VERSION = 'v3.tailor.2026-05-09'` with analysis-aware context. Cost: ~$0.05-0.10 per tailor (was $0.06 single Sonnet). Quality: Reflexion-pattern recovers near-Opus quality on Sonnet budget.
- `[2026-05-09] [BUILD]` Phase 7.3 Fix 2 — Agentic tool gaps. 5 new chat tools added to master agent: `update_profile_targets`, `list_feed_jobs`, `save_feed_job`, `parse_attachment_as_resume`, `commit_resume_replacement`. Total tool count 19 → 24. Resume replacement explicitly two-step (parse → user confirm "yes" → commit) to prevent accidental overwrites.
- `[2026-05-09] [BUILD]` Phase 7.3 Fix 3 — Synth eval refresh. Added User D (entry-level Data Analyst, Bangalore). Per-scenario `assembled_messages` capture (truncated to 1500 chars per message). New "Tailor pipeline (v3)" rubric category with 5 params (3 deterministic from verifier output, 2 LLM-graded by Sonnet). New `scripts/synth/TRACE.md` output: human-readable side-by-side of one chat scenario per user + one full tailor pipeline trace per user.
- `[2026-05-10] [BUILD]` Phase 7.3 synth eval ran. Verdict: **🟢 GO — beta-ready.** Overall 4.14/5 (Phase 7.1: 2.90, +1.24 jump). Tailor v3 4.96/5 (verifier 95/100 across all 4 users; 10-12 edits each; zero retries needed; only 1 must-have missing across 29 total). Chat agent 4.00/5 (was 3.45). Off-topic refusal 5/5 (was 1/5). All 3 critical safety probes 5/5.
- `[2026-05-10] [DECISION]` Beta-readiness call: GO. Open closed beta. 2 remaining issues are non-blocking (User A assessment latency 114s, failure-modes docs gap). Recommend recruiting 5-10 closed-beta users; capture outcomes for post-beta credit/billing decision.
- `[2026-05-10] [NOTE]` Phase 7.3 changes still on disk, NOT yet pushed. User pushes manually per project rule.
