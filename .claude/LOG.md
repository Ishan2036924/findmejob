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
**Phase:** 1 (model research) — completed pending user review. Phase 0 also completed earlier this session.

**What got done in Phase 1:**
- Live web research: April 2026 pricing/benchmarks/latency for Claude Sonnet/Haiku, Gemini 2.5 Flash + Flash-Lite, GPT-4o mini, GPT-4.1 mini, DeepSeek V3.2/V4, Mistral Small 3.1, Grok 3 Mini, Qwen3 32B.
- Vercel AI Gateway confirmed as routing layer: zero markup, automatic failover, `provider/model` strings, BYOK supported.
- NOTES.md `## Models` section filled: workload→model mapping, comparison table, scoring cost model at 4.5M calls/month, A/B + drift policy, what we did NOT pick and why, sources.

**Recommendation locked (post-pivot 2026-04-27):**
- Sonnet 4.6 — orchestrator + profile assessment + resume tailoring (the 3 moat tasks).
- GPT-4.1 mini — everything else: cover letter, interview Qs, outreach, company brief, roadmap, job match scoring, ghost-job classification, light extraction.
- Gemini Flash-Lite — held in reserve via AI Gateway; one-line swap when production cost on mini scoring becomes the bottleneck.
- Embeddings — deferred to Slice 1 implementation.
- **Prompt caching mandatory** from Slice 1; structure every Sonnet call so system + rubrics + profile are stable cacheable prefixes.

**What's next (on approval):**
- Phase 1.5: Infra + CI/CD setup. Install Vercel + Supabase CLIs (pnpm too); `gh repo create` private; Next.js scaffold; Vercel project link; Supabase project create + link; env var wiring (AI Gateway key + Anthropic, Google, OpenAI fallback keys); `vercel.ts` config; basic GH Actions for lint/typecheck on PR; Vercel git integration handles preview/prod deploys.

**Open questions:**
- Real product name (still using "CareerForge" placeholder).
- Confirm: are we OK with Vercel git integration handling deploys (no GH Actions deploy step needed)?

**Files touched this session:**
- Phase 0: created CLAUDE.md, .claude/NOTES.md, .claude/LOG.md, .gitignore, README.md, git init.
- Phase 1: edited .claude/NOTES.md `## Models` section (replaced placeholder with full table + cost model + sources).

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
