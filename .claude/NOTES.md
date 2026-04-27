---
file: NOTES.md
purpose: Combined long-term memory — project, domain, glossary, models, architecture
max_lines: 600
last_updated: 2026-04-27
sections: [Project, Differentiators, Constraints, Stack, Domain, Glossary, Models, Architecture, Lessons]
---

# NOTES.md

Single source of long-term, slowly-changing knowledge. Sectioned. Read only the section you need. Split a section into its own file when it crosses ~250 lines AND has clear topical isolation.

---

## Project

| Key            | Value                                                                  |
|----------------|------------------------------------------------------------------------|
| Working name   | CareerForge (placeholder; real name TBD)                               |
| One-line pitch | AI-native career platform: candid assessment + roadmap + verified jobs + on-click tailored bundle |
| Target user v1 | Job seekers and students in India, Delhi NCR primary                   |
| Solo or team   | Solo developer + Claude Code as force multiplier                       |
| Timeline       | No hard deadline; "build until working, then onboard, then paid"       |
| Monetization   | Free during beta; paid tiers post-beta; structure TBD                  |
| Distribution   | Direct-to-user web app                                                 |

## Differentiators (the moat — protect in every design decision)

1. Candid, rubric-grounded profile assessment — not generic LLM flattery.
2. Personalized roadmap with curated free YouTube + paid certification mappings.
3. Multi-source job aggregation with a legitimacy/trust scoring layer (filter ghost jobs).
4. One-click tailored bundle per job: resume, cover letter, interview Qs, outreach drafts, company brief.
5. Profile-vs-role match score + (post-beta only) realistic-chance estimate based on aggregated outcomes.
6. Portfolio + LinkedIn analysis as part of the assessment — paste-in / PDF only, no auto-fetch.
7. Recommended next steps (projects, courses, certifications, networking) tied to specific gaps.

## Constraints

- **Solo dev.** Surface area minimization is the single biggest predictor of shipping.
- **Free beta.** Cost ceiling matters; aggressive prompt caching from day one.
- **India-first.** Job source coverage of Indian roles (JSearch India filter for Slice 1; Greenhouse/Lever/Ashby ATS adds in Slice 4).
- **LinkedIn ToS.** Auto-fetch is off-limits. Paste-in / user-supplied PDF only.
- **Naukri/Internshala scraping.** Off-limits in v1; revisit only if aggregator coverage proves clearly insufficient.

## Stack

(See CLAUDE.md `## Stack snapshot` for the canonical list. This section explains *why* each choice was made; the choices themselves live there.)

- **Next.js full-stack on Vercel:** chosen over the originally-proposed Next.js + FastAPI/Render split because solo-dev ops surface dominates everything else. Fluid Compute removes the "you need Python for backend" assumption (300s timeout, full Node.js, instance reuse).
- **Vercel AI Gateway:** chosen as the LLM abstraction so we can swap secondary models per-call without code changes. Critical because we *will* A/B test scoring models.
- **Vercel Workflow DevKit:** chosen for the on-click multi-agent bundle. Durable, pause/resume, retries, crash-safe orchestration. Saves ~3 weeks of infra work vs. building this on a queue + state machine ourselves.
- **Vercel Sandbox:** chosen for any Python-only deps (JobSpy primarily). Single Render worker is the fallback if Sandbox cold-start or pricing becomes a problem.
- **Supabase:** Postgres + Auth + RLS + Storage in one. Standard pick. RLS is the security boundary for resume PII.
- **Tectonic for LaTeX:** chosen over a hosted LaTeX service for cost control + offline-friendliness. Compiled inside Vercel Sandbox.

---

## Domain

### ATS (Applicant Tracking Systems)

- ATS systems parse resumes into structured fields. They penalize: tables, columns, headers/footers with key info, images, fancy fonts, embedded text-in-graphics.
- ATS-friendly resumes: single column, standard fonts (Latin Modern, Computer Modern, Helvetica, Times), section headings ATS expects ("Experience", "Education", "Skills"), bullet points (not nested deeply), reverse-chronological.
- Most major ATS (Greenhouse, Lever, Ashby, Workday) have public schemas / endpoints for jobs (ingestion-friendly). Naukri/Internshala do not.
- **Schema.org JobPosting** is the de-facto canonical job schema. Our internal `jobs` row should be ingestible to/from this.

### Ghost jobs (jobs that aren't real or aren't actively being filled)

Common indicators (rule-based first pass):
- Listed for >60 days without re-posting.
- Same listing copy across many companies (paste-bot networks).
- Vague JD with no concrete responsibilities or stack.
- Recruiter-of-record domain doesn't match company domain.
- Same recruiter posts >50 listings/week across unrelated industries.
- "Always hiring" pages without team-size signals.

LLM second pass evaluates the listing text against above signals + provides a trust score 0–100 with a reasoning string the user can see.

### India job-market specifics

- ITES vs product company patterns differ substantially (ITES = service-economy English-skill-heavy; product = engineering-skill-heavy). Resume tailoring should detect role family.
- Common role families in NCR: SDE/SWE, Data/ML, Product, Design, DevOps/SRE, Sales, Marketing, Ops, Finance, HR.
- Salary signals are noisy in India listings — many list ranges in lakhs/annum, some omit entirely. Our match score must not over-weight salary alignment.

### LaTeX in our pipeline (gotchas)

- Tectonic is the compiler. Single binary, no `tlmgr` mess.
- We do **not** generate raw LaTeX from an LLM. We use the **edit-via-JSON pattern**: a stable LaTeX template + a JSON document representing the resume + a deterministic transformer that fills the template.
- LLM only emits **structured edit instructions** (e.g., `{ "section": "experience", "index": 2, "field": "bullet1", "new_value": "..." }`) which a typed reducer applies.
- This pattern eliminates the entire class of LaTeX-syntax bugs from LLM output.
- Compilation happens in Vercel Sandbox (microVM), result PDF stored in Supabase Storage.
- Templates: start with one ATS-friendly single-column template. Two more in Slice 3 (one mid-density, one design-leaning).

### LinkedIn boundaries

- We do **not** scrape, automate fetch, or use undocumented APIs against LinkedIn.
- We **do** accept user-pasted profile text or user-uploaded LinkedIn-exported PDFs ("Save to PDF" feature on LinkedIn).
- All LinkedIn analysis features clearly indicate "paste your profile" or "upload exported PDF" in UI copy.

---

## Glossary

| Term                  | Definition                                                                                       |
|-----------------------|--------------------------------------------------------------------------------------------------|
| Slice                 | A vertical, end-to-end usable feature increment that ships independently. We have 5 of them.     |
| Bundle                | The on-click set of artifacts generated for a single (user, job) pair.                           |
| On-click bundle       | Triggered when user clicks a job in the feed; assembles bundle artifacts in parallel.            |
| Match score           | 0–100 score representing skills/role/experience overlap between profile and JD. Computed by secondary LLM. |
| Trust score           | 0–100 score representing legitimacy of a job listing. Rules + LLM hybrid.                        |
| Realistic chance      | Estimate of probability of getting interview/offer for a role. Deferred to post-beta when outcome data exists. |
| Edit-via-JSON         | Resume engineering pattern: stable template + JSON state + LLM emits edit ops, never raw LaTeX.  |
| Rubric                | Structured scoring criteria the assessment engine grades against, per role family.               |
| Role family           | Coarse-grained job category: SWE, Data/ML, Product, Design, DevOps, Sales, Marketing, etc.       |
| Fluid Compute         | Vercel's default function runtime; instance reuse, 300s timeout, full Node.js, near-zero cold start. |
| AI Gateway            | Vercel's unified LLM proxy. We call models via `provider/model` strings (e.g., `anthropic/claude-sonnet-4-6`). |
| Workflow DevKit       | Vercel WDK — durable workflow runtime with pause/resume, retries, crash-safe state.              |
| Sandbox               | Vercel Sandbox — ephemeral microVM for running untrusted or Python-only code.                     |
| Tectonic              | Self-contained LaTeX compiler used for resume PDF generation.                                    |
| RLS                   | Row-Level Security in Postgres/Supabase — our user-isolation security boundary.                  |
| JSearch               | RapidAPI-fronted job aggregator; v1 sole job source.                                             |
| JobSpy                | Python library that scrapes multiple job boards; runs in Vercel Sandbox if/when needed.          |
| ATS                   | Applicant Tracking System (Greenhouse, Lever, Ashby, Workday, etc.).                             |

---

## Models

Filled 2026-04-27 (Phase 1). Revisit when (a) we have real scoring-prompt traffic to calibrate against, or (b) any provider drops headline pricing >25%.

### Routing layer: Vercel AI Gateway (confirmed)

All LLM calls go through Vercel AI Gateway via plain `provider/model` strings. Reasons:
- **Zero markup** — passthrough pricing identical to upstream provider list price.
- **Automatic failover** between providers; per-provider timeouts configurable.
- **One-line model swaps** without code changes — critical because we *will* A/B test scoring models in Slice 1.
- **BYOK supported** — we can plug provider keys directly if we ever want to bypass gateway billing.
- **Unified dashboard** — single place to watch token spend across providers.

Implementation: `model: 'provider/model-id'` in AI SDK calls (e.g., `model: 'anthropic/claude-sonnet-4-6'`). Default global provider via `globalThis.AI_SDK_DEFAULT_PROVIDER` in `instrumentation.ts`.

### Workload → model mapping (locked 2026-04-27)

| Workload                                                            | Model                            | Why                                                                                                       |
|---------------------------------------------------------------------|----------------------------------|-----------------------------------------------------------------------------------------------------------|
| **Orchestrator** (multi-tool routing in Vercel Workflow DevKit)     | `anthropic/claude-sonnet-4-6`    | SOTA non-reasoning tool use; lowest tool-call hallucination rate. The orchestrator's wrong call cascades — accuracy matters more than cost. |
| **Profile assessment** (the moat — rubric-grounded, candid voice)   | `anthropic/claude-sonnet-4-6`    | Multi-section rubric depth + naturally calibrated "candid without mean" voice + grounded evidence extraction. |
| **Resume tailoring** (edit-via-JSON, coherence-critical)            | `anthropic/claude-sonnet-4-6`    | Cross-section coherence (voice, dates, quantification) is where mini fails most visibly. The resume is the most-shared artifact — quality is brand. |
| Everything else: cover letter, interview Qs, outreach, company brief, roadmap synthesis, job match scoring, ghost-job classification, light extraction | `openai/gpt-4.1-mini` | Best-in-class strict JSON schema. Reliability over Flash-Lite chosen by user (see Lessons). 1M context, $0.40/$1.60 per 1M. |
| Embeddings (defer until Slice 1 implementation)                     | TBD — Voyage v4 or `openai/text-embedding-3-large` | Decide when we know corpus size + recall targets.                                                      |

**Why we did NOT default to Gemini 2.5 Flash-Lite for scoring** (user override 2026-04-27): Flash-Lite is ~4× cheaper but its strict-JSON reliability lags GPT-4.1 mini. User judged the quality risk not worth the savings at beta scale. Held in reserve via AI Gateway — one-line swap available if production-scale cost on mini becomes the bottleneck (revisit trigger documented below).

### Comparison table (April 2026, per 1M tokens via AI Gateway list price)

| Model                            | Input $   | Output $   | Context  | Notes                                                                  |
|----------------------------------|-----------|------------|----------|------------------------------------------------------------------------|
| `anthropic/claude-sonnet-4-6`    | $3.00     | $15.00     | 1M       | Cache read $0.30 (10% of input). Batch API halves all costs.           |
| `anthropic/claude-haiku-4-5`     | $1.00     | $5.00      | 1M       | **Excluded per user constraint.** Listed for reference only.           |
| `google/gemini-2.5-flash`        | $0.30     | $2.50      | 1M       | Released Jun 2025. GA.                                                 |
| `google/gemini-2.5-flash-lite`   | **$0.10** | **$0.40**  | 1M       | Released Jul 2025. GA. ~328 tok/s (fastest cheap class).               |
| `openai/gpt-4o-mini`             | $0.15     | $0.60      | 128K     | Older; superseded by 4.1-mini for our needs.                           |
| `openai/gpt-4.1-mini`            | $0.40     | $1.60      | 1M       | Strongest strict-JSON output in class.                                 |
| `deepseek/deepseek-v3.2`         | $0.28     | $0.42      | 163K     | Cache hit $0.028/M (very cheap repeat). Strong reasoning. JSON mode less mature. |
| `deepseek/deepseek-v4`           | ~$0.30    | ~$0.50     | larger   | Mar 2026 release. Likely promoted to fallback later if quality holds.  |
| `mistral/mistral-small-3.1`      | $0.20     | $0.60      | varies   | Solid mid-tier; no decisive edge over Flash-Lite for our workload.     |
| `xai/grok-3-mini`                | $0.30     | $0.50      | 128K     | Fine, no decisive edge.                                                |
| `qwen/qwen-3-32b`                | $0.70     | $2.80      | varies   | Too expensive for the workload.                                        |

### Per-bundle cost (revised after 2026-04-27 split)

Per on-click bundle (one user clicks one job → orchestrator + 5 sub-agents):

| Component                                | Model            | Cost per call (no cache) |
|------------------------------------------|------------------|--------------------------|
| Orchestrator (~3K in / 500 out)          | Sonnet 4.6       | ~$0.017                  |
| Resume tailoring (~5K in / 2K out)       | Sonnet 4.6       | ~$0.045                  |
| Cover letter (~3K in / 1K out)           | GPT-4.1 mini     | ~$0.0028                 |
| Interview Qs (~3K in / 1.5K out)         | GPT-4.1 mini     | ~$0.0036                 |
| Outreach drafts (~2K in / 0.5K out)      | GPT-4.1 mini     | ~$0.0016                 |
| Company brief (~3K in / 1K out)          | GPT-4.1 mini     | ~$0.0028                 |
| **Total per bundle (no cache)**          |                  | **~$0.073**              |
| **Total per bundle (with caching)**      |                  | **~$0.040**              |

### Per-user-month estimates

| User profile                   | Bundles/mo | Scoring calls/mo | Assessment | Sonnet $ | Mini $ | **Total cached** |
|--------------------------------|------------|------------------|------------|----------|--------|------------------|
| Light beta user                | 30         | 1,500            | 1×         | ~$2.20   | ~$0.30 | **~$2.50**       |
| Heavy beta user                | 200        | 4,500            | 2×         | ~$13.50  | ~$1.80 | **~$15.30**      |

### Aggregate cost projections

| Stage                                        | LLM cost/month       |
|----------------------------------------------|----------------------|
| Beta — 50 users mixed usage                  | ~$300–500            |
| Beta — 50 heavy users                        | ~$700–900            |
| Production — 1,000 users mixed               | ~$8,000–10,000       |
| Production — 1,000 users with heavy usage    | ~$15,000–19,000      |

Implication: free beta is fine on this stack. Paid tiers must be live before crossing ~500 active users — that's the cost-discipline line.

### Caching strategy (must be wired Slice 1)

Every Sonnet call uses prompt caching aggressively:
- **System prompts + rubrics** (cached, change rarely) → 10% of input cost on cache hits.
- **User profile** (cached for 5min/1hr per session) → 10% on cache hits.
- **Few-shot examples + role-family templates** (cached) → 10% on cache hits.
- Only the **JD + edit instructions** are fresh tokens.

Target: 70%+ of input tokens served from cache. Effective Sonnet input cost drops from $3 → ~$1.10 per 1M.

For mini: OpenAI's automatic prompt caching kicks in on prefix matches >1024 tokens, no SDK changes needed.

### Revisit triggers

- **Production-scale cost on mini exceeds budget** — swap mini scoring/classification calls to `google/gemini-2.5-flash-lite` (one-line change via AI Gateway). At 1,000 users this saves ~$5K/mo on scoring alone.
- **Mini quality dips on coherence-light tasks** — promote a slice (e.g., interview Qs) back to Sonnet.
- **DeepSeek V4 / Gemini 3.x Flash-Lite GA pricing drops** below current floor — re-evaluate scoring default.
- **Sonnet drift on assessment** (rare) — investigate prompt before swapping.
- **OpenAI raises mini pricing** — Flash-Lite waiting in reserve.

### What we deliberately did NOT pick, and why

- **Haiku 4.5** — excluded per your standing constraint. Pricing also poor for the workload.
- **Gemini 2.5 Flash-Lite as default** — 4× cheaper than mini for scoring/classification, but user judged JSON reliability gap not worth the savings at beta scale. Held in reserve.
- **All-Sonnet** — quality-maximalist; rejected on cost (~$10/user/mo cached vs ~$3.50 split).
- **All-mini for heavyweight** — would compromise assessment + resume quality, the moat features. Brand risk too high.
- **DeepSeek V3.2/V4** — strong reasoning, cheap on cache hits, but JSON-mode reliability lags Google/OpenAI. "Promote candidate" only.
- **Qwen3 32B** — too expensive; no decisive edge.
- **Mistral Small / Grok 3 Mini** — fine, no decisive advantage. Skipped to avoid provider sprawl.
- **Direct provider SDKs** — only when a provider-specific feature demands it (e.g., Anthropic computer-use, citations, extended-thinking control). Default = AI Gateway `provider/model` strings.

### Confidence + revisit triggers

- **Cost ranking:** very high confidence. Public list prices, all sourced.
- **Quality match for scoring:** medium confidence. Depends on rubric specifics. We'll know after the Slice 1 shadow run.
- **Revisit when:** any default provider drops headline price >25%; or shadow drift exceeds the 5-point/10% threshold; or a new sub-$0.10 input-price GA model lands; or Anthropic releases a sub-Haiku tier.

### Sources

- [Vercel AI Gateway pricing docs](https://vercel.com/docs/ai-gateway/pricing)
- [Vercel AI Gateway models & providers](https://vercel.com/docs/ai-gateway/models-and-providers)
- [Anthropic Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Claude API Pricing Guide 2026 (devtk)](https://devtk.ai/en/blog/claude-api-pricing-guide-2026/)
- [Gemini API pricing (Google AI for Devs)](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini 2.5 Flash-Lite GA announcement](https://developers.googleblog.com/en/gemini-25-flash-lite-is-now-stable-and-generally-available/)
- [OpenAI API pricing](https://openai.com/api/pricing/)
- [GPT-4.1 mini pricing (pricepertoken)](https://pricepertoken.com/pricing-page/model/openai-gpt-4.1)
- [DeepSeek API pricing docs](https://api-docs.deepseek.com/quick_start/pricing)
- [Artificial Analysis leaderboard](https://artificialanalysis.ai/leaderboards/models)

---

## Architecture

*Filled in Phase 2 (scoped to Slice 1 only).*

Will cover: data model, API surface for Slice 1, agent orchestration for resume tailoring, caching strategy (prompt cache + JD parse cache + profile cache), cost model at 100 users, one Mermaid component diagram, brutal-honesty review.

Skipped here, planned in respective slices: ghost-job detection (Slice 4), roadmap engine (Slice 3), LinkedIn analysis (Slice 5), realistic-chance estimator (Slice 5), multi-source ingestion (Slice 4), full observability deep-dive (post-beta).

---

## Lessons learned

*Append-only. Each entry: short rule + when/why discovered.*

- **2026-04-27 — Sonnet only for moat features, mini for everything else.** Sonnet 4.6 is decisively better on (1) multi-section rubrics, (2) cross-artifact coherence, (3) "candid not mean" voice, (4) tool-call accuracy. Everywhere else, GPT-4.1 mini wins on cost without visible quality loss. The 3 moat tasks (assessment, resume tailoring, orchestrator) define brand — don't cheap them. Everything else is supporting cast.
- **2026-04-27 — User preference: GPT-4.1 mini over Gemini Flash-Lite for scoring.** User judged Flash-Lite's JSON reliability inferior. Cost cost: ~4× ($6.5K/mo vs $1.6K/mo at 1k users). Acceptable in beta; revisit at production scale.
- **2026-04-27 — Prompt caching is non-optional from Slice 1.** Without it, Sonnet costs ~3× more. Architect every Sonnet call so system prompt + rubrics + profile are cacheable prefixes; only JD/edit-instructions are fresh.
- **2026-04-27 — Vercel CLI v52 regression on Preview env adds.** `vercel env add NAME preview --value VALUE --yes` returns `git_branch_required` despite the docs/help showing this exact form. Workaround: use the Vercel dashboard's "Copy to other environments" UI. Revisit when CLI updates. (Logged in LOG.md.)
- **2026-04-27 — On macOS without sudo or homebrew, install global npm packages to `~/.npm-global`.** `corepack enable` fails on `/usr/local/bin` symlink writes; standard `npm install -g` also fails. Configure `npm config set prefix ~/.npm-global` and append PATH to `~/.zshrc`. One-time setup, persists across shells.
- **2026-04-27 — `AI_GATEWAY_API_KEY` is auto-injected by Vercel runtime.** No manual provisioning needed. For local dev, `vercel env pull` gives a `VERCEL_OIDC_TOKEN` that the AI SDK gateway provider falls back to. Single source of truth: don't add `AI_GATEWAY_API_KEY` to `.env.local` manually.
