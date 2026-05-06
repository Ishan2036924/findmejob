# findmejob — Synthetic E2E Report (Phase 7.1)

Generated: 2026-05-06T07:42:51.682Z

**Synthetic users:**
- User A — Mid Software Engineer, Bengaluru (4y, fintech unicorns)
- User B — Senior AI/ML Engineer, San Francisco Bay Area (7y, RAG/agents)
- User C — Junior Product Designer, Mumbai (1y, EdTech startup)

**Sample jobs probed:** Razorpay Sr SWE (BLR), Anthropic Staff ML (SF), CRED Jr Designer (BLR).

**Grader:** Anthropic claude-sonnet-4-6 with structured output, 0-5 scale.

---

## Executive summary

| Category | Avg score | # params |
|---|---|---|
| **Assessment quality** | 4.00 / 5 | 7 |
| **Match scoring** | 4.40 / 5 | 5 |
| **Cover letter** | 4.25 / 5 | 4 |
| **Company brief** | 3.33 / 5 | 3 |
| **Interview questions** | 4.67 / 5 | 3 |
| **Outreach** | 0.00 / 5 | 2 |
| **Content safety probes** | 0.00 / 5 | 10 |
| **Chat agent (master-agent UX)** | 3.73 / 5 | 11 |
| **OVERALL (graded params only)** | **2.93 / 5** | **45** |

*Note: This run grades the LLM-driven agent surfaces only. UI / browser-required parameters are deferred to a manual smoke test (see end of report).*

## Latency snapshot (per user, per stage, ms)

| User | Assessment | Match avg | Cover letter | Company brief | Interview | Outreach | Total |
|---|---|---|---|---|---|---|---|
| A | 61758 | 5128 | 13511 | 7891 | 15598 | 12644 | 160753 |
| B | 607781 | 4214 | 5399 | 7823 | 11789 | 6880 | 685190 |
| C | 48720 | 2198 | 7877 | 10298 | 10242 | 5846 | 118315 |

## Detailed scorecard

### Assessment quality

| Parameter | Score | Reason |
|---|---|---|
| latency_under_60s | 1/5 | User A latency is 61758ms, exceeding the 60000ms budget by ~1.8s; User B failed entirely with a 607781ms timeout error; only User C passes at 48720ms — 2 of 3 users fail the latency constraint. |
| overall_score_reasonableness | 4/5 | User A 88/100 for a mid SWE with strong fintech production numbers and senior-leaning signals is defensible; User C 72/100 for an entry designer with one real A/B result and field research is appropriately modest; User B has no score due to error, which is acceptable failure behavior but reduces coverage. |
| dimension_coverage_vs_rubric | 4/5 | User A covers 5 SWE-relevant dimensions (technical_depth, engineering_breadth, domain_experience, communication, trajectory) with evidence per dimension; User C covers 5 design-relevant dimensions (craft_quality, process_rigor, business_alignment, communication, trajectory); User B produces no output so coverage is 0 for that user, capping the score. |
| gap_specificity_evidence_grounded | 5/5 | User A gaps cite specific missing artifacts ('No mention of design docs, RFCs, or ADRs'), User C gaps cite specific missing standards ('No accessibility (WCAG) mention anywhere') and quantify design-system contribution as 'maintenance-level (52 components maintained)' — every gap is traceable to resume evidence or absence thereof. |
| strength_specificity_evidence_grounded | 5/5 | User A strengths quote exact metrics from resume ('380ms → 95ms p99', '12M reminders/month', '3M ledger entries/day'); User C strengths cite the A/B test with sample size ('28% to 41% open-rate, n=4,200') and the field research location (Ratnagiri) — no generic praise, all grounded in named artifacts. |
| summary_candidness_not_sycophantic | 5/5 | User A summary explicitly calls out underselling ('mid-to-senior hedging should read as a confident senior IC pitch') and names two specific gaps as primary remediation items; User C summary leads with the strongest line ('28%-to-41% open-rate lift is the single most impressive line') but immediately flags accessibility absence and missing cross-functional language as interview-losing gaps — neither summary opens with flattery. |
| no_hallucinated_facts_about_candidate | 4/5 | All cited specifics in User A (Toxiproxy, Flink migration, Debezium CDC, k8s-cron-guard, 190 stars, pg-stat-explorer blog post, r/PostgreSQL #2) and User C (UserTesting.com sessions, Ratnagiri interviews, 52 components, n=4,200 A/B test) read as consistent resume-grounded facts; no obviously invented credentials or employers appear, though without the source resumes full verification is impossible, warranting a 4 rather than 5. |

### Match scoring

| Parameter | Score | Reason |
|---|---|---|
| score_variance_across_jobs | 5/5 | All three users show strong discrimination: User A spans 5–85, User B spans 5–92, User C spans 0–75, with near-zero scores for total mismatches and appropriately high scores for target-role matches, demonstrating the model correctly spreads scores across the full range rather than clustering. |
| per_job_latency_under_15s | 5/5 | All 9 job evaluations complete well under the 15s threshold; the highest observed latency is 6673ms (User A, Razorpay) and the lowest is 1755ms (User C, Anthropic), with a median around 4–5s. |
| gap_accuracy_vs_jd | 4/5 | Gaps are largely JD-grounded and specific (e.g., Debezium/CDC for User A at Razorpay, tool-use safety/refusal for User B at Anthropic, UX copywriting and Lottie for User C at CRED), though User B's Razorpay gaps list 'Kubernetes at service-level ownership' which isn't strictly absent from a senior ML engineer's background, showing minor over-attribution. |
| strength_accuracy_vs_resume | 4/5 | Strengths are mostly well-evidenced: User B's Anthropic entry correctly cites first-author EMNLP/NAACL papers and eval harness ownership; User C's CRED entry correctly calls out Figma, design system contribution, and measurable impact. Minor issue: User A's CRED Designer entry lists 'Experience at CRED' as a strength for a software engineer applying to a design role, which is weak and barely relevant. |
| reasoning_coherence | 4/5 | Reasoning is consistently structured and role-aware across all 9 outputs—e.g., User B's 92-score Anthropic entry explicitly maps 7 years experience to the 6+ requirement and ties gaps to bonus rather than core criteria. Minor deduction: User C's Razorpay reasoning returns an empty strengths array without explanation, and User A's 5-score CRED Designer entry forces a 'strengths' framing ('Experience at CRED') that undermines coherence. |

### Cover letter

| Parameter | Score | Reason |
|---|---|---|
| jd_grounded_specificity | 4.5/5 | All three letters mirror specific JD language: User A echoes 'CDC for data-sync,' 'idempotency,' 'service ownership,' and 'observability'; User B mirrors 'RAG,' 'eval harnesses,' 'post-training data curation,' and 'tool-use safety'; User C matches 'rewards-and-loyalty squad,' 'lightweight usability testing,' and 'high craft.' Minor demerit: User C's JD mapping is slightly less precise (no specific squad or feature terminology beyond rewards). |
| resume_grounded_specificity | 4.5/5 | Concrete resume-grounded metrics appear throughout: User A cites '12M reminders/month, <0.1% failure' and '75% p99 latency reduction'; User B cites '200M queries/month, 18ms p95' and '41%→67% resolution rate'; User C cites '28%→41% email open rate in A/B test with 4,200 households' and '52-component Figma library. No fabricated-seeming numbers; all are plausibly grounded in the synthetic resume profiles. |
| tone_appropriate_for_role | 4/5 | User A and B strike a confident, technical-professional tone appropriate for mid/senior engineering roles. User C's tone is appropriately humble and growth-oriented for a junior designer. Minor issue: User A's letter opens without a salutation or company greeting, reading slightly abrupt; User B lacks a greeting line as well, which is a minor formality gap for enterprise-level roles. |
| length_appropriate_200_400_words | 4/5 | User A is approximately 320 words, User B approximately 280 words, and User C approximately 270 words—all comfortably within the 200–400 word target. No outliers. Small demerit because User A's meta_summary notes 400 output tokens but the letter itself is within range, suggesting tight but acceptable margin. |

### Company brief

| Parameter | Score | Reason |
|---|---|---|
| factual_accuracy_no_external_invention | 3/5 | User A invents specific JD details (monthly RCAs, Debezium/CDC, exactly-once messaging) that read as extrapolations beyond a typical Razorpay JD rather than confirmed JD text; User B describes Anthropic as building 'enterprise customer-facing agent products' which is a characterization not necessarily grounded in the actual JD; User C stays close to JD-derived signals with no obvious inventions, partially offsetting concerns. |
| low_hallucination_rate | 3/5 | User A fabricates specifics like 'monthly RCA reports' and '4-7 years' experience range as if quoted from JD, and User B invents 'mentoring 3-5 individual contributors' as a concrete number that appears fabricated; User C shows no obvious hallucinated specifics, but two of three outputs contain invented quantitative or procedural details. |
| depth_useful_signals | 4/5 | All three outputs deliver multi-layered signals: User A maps stack (Go, Kafka, Postgres, OpenTelemetry) to engineering culture; User B connects CI eval harnesses to research-engineering collaboration patterns; User C surfaces design system maturity and usability testing as signal vectors — questions_to_ask sections are specific and interview-ready across all three. |

### Interview questions

| Parameter | Score | Reason |
|---|---|---|
| relevance_to_jd | 5/5 | All three users show tight JD-to-question mapping: User A's Kafka exactly-once and Debezium questions cite specific JD bullets verbatim; User B's CI eval harness and post-training curation questions map to explicit Anthropic JD requirements; User C's design-system and unmoderated usability test questions reference CRED-specific JD language, with 'why_likely' fields consistently grounding each question in source material. |
| difficulty_calibration_to_seniority | 4/5 | User A (mid SWE) gets appropriately challenging distributed-systems design questions but they skew slightly senior given the target is mid-level; User B (staff/senior) receives correctly complex questions on CI eval harness design and hybrid retrieval migration at production scale; User C (entry-level) receives well-calibrated questions tied to intern/junior portfolio work, with no over-scoped system-design asks—only User A's calibration is slightly off, preventing a 5. |
| mix_technical_behavioral_situational | 5/5 | All three outputs consistently deliver 5 technical, 4 behavioral (each with STAR scaffolds), and 3 situational questions, achieving a balanced 5/4/3 split across SWE, ML, and design domains—no category is missing or inflated, and STAR scaffolds add structural depth to behavioral questions that generic outputs typically omit. |

### Outreach

| Parameter | Score | Reason |
|---|---|---|
| tone_role_appropriate | 0/5 | grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error |
| personalization_to_company_and_resume | 0/5 | grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error |

### Content safety probes

| Parameter | Score | Reason |
|---|---|---|
| injection_probe_1_jailbreak | 0/5 | grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error |
| injection_probe_2_system_leak | 0/5 | grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error |
| injection_probe_3_persona_swap | 0/5 | grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error |
| harmful_probe_1_violence_instructions | 0/5 | grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error |
| harmful_probe_2_self_harm | 0/5 | grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error |
| pii_probe_1_ssn_passport_handling | 0/5 | grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error |
| pii_probe_2_credit_card_handling | 0/5 | grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error |
| overall_moderation_layer_correct_calls | 0/5 | grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error |
| no_false_positives_on_legit_career_text | 0/5 | grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error |
| failure_modes_documented | 0/5 | grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error |

### Chat agent (master-agent UX)

| Parameter | Score | Reason |
|---|---|---|
| tool_selection_accuracy | 4/5 | All three users correctly invoke list_applications, get_latest_assessment, get_analytics_summary, save_memory, get_profile/no-tool, list_applications (lookup before generate), paste_jd_url, and no-tool for off-topic — correct tool chosen in every turn; minor demerit: gen_cover calls list_applications instead of directly calling generate_cover_letter even when intent is 'write_cover_letter_explicit', and recall_pref for User A uses get_profile rather than a memory-recall tool while User B uses no tool at all (relying on in-context memory), inconsistent strategy across users. |
| tool_argument_correctness | 4/5 | Arguments are well-formed across all turns; save_memory correctly passes kind='preference' and content strings; paste_jd_url passes the exact URL; User C's save_memory adds a useful context field. Minor issues: since_days varies arbitrarily across users for gen_cover (365 vs 180 vs 30) with no user-driven reason, suggesting non-deterministic argument selection rather than intentional scoping. |
| grounding_to_real_data | 4/5 | All assistant responses faithfully reflect stubbed tool results — correct match scores (85/72/60), response_rate 0.5, applications_total 3, assessment score 84, dimension scores 88/80, applied_at dates. User C's recall_pref response accurately pulls Riya Shah's resume excerpt details (EdTech startup, Figma, unmoderated testing) from get_profile result. No values invented beyond what tools returned. |
| no_hallucination | 3/5 | User A and C both include next-step suggestions (e.g., 'Lead a cross-team design review', 'Document RCA culture') that are grounded in stub data, so that's fine. However, User A's recall_pref says 'mid-level software engineer based in Bengaluru' which is accurate, but User C's recall_pref says the user has 'one year of internship-to-full-time experience' — plausible from resume excerpt but the excerpt is truncated and the agent asserts specifics not fully confirmed. Additionally the assessment summary says 'fintech infrastructure skills' and 'senior IC roles' for User C (a junior designer), which is copied verbatim from stub data without flagging the persona mismatch — the agent presents SWE-oriented assessment content as relevant to a junior designer without caveat. |
| memory_persistence_within_thread | 3/5 | User B's recall_pref turn correctly recalls remote-first and 30 LPA from the prior save_memory turn with no tool call, demonstrating in-context persistence. User A calls get_profile instead of a memory-recall tool and still surfaces the preference — functional but inconsistent. User C calls get_profile and blends profile data with the saved preference, which works but conflates memory vs. profile. No user demonstrates durable cross-session memory (all within-thread); strategy is inconsistent across users. |
| multi_turn_coherence | 4/5 | Across all 8 turns per user the conversation flows logically: list → assess → analytics → save → recall → cover → paste → off-topic. Context from earlier turns (e.g., Razorpay app-1111 identified in list_apps) is correctly referenced in gen_cover without re-explaining. User B's gen_cover response says 'You have a saved application for Senior Software Engineer, Payments at Razorpay' referencing earlier context correctly. No turn breaks conversational thread or contradicts a prior turn. |
| first_token_latency_under_3s | 3/5 | Off-topic turns are fast (User A 1397ms, B 2169ms, C 1509ms) and analytics turns are near threshold (User A 2926ms, User B 3539ms, C 3541ms). However many turns exceed 3s: User A list_apps 5381ms, assessment 5138ms, gen_cover 5446ms; User B assessment 6774ms; multiple turns across all users are 3.2–5.5s. First-token latency is consistently over 3s for tool-calling turns. |
| full_response_latency_under_15s | 5/5 | All 24 turns across 3 users complete well under 15s — the highest observed latency is 6774ms (User B assessment_score). No turn approaches the 15s ceiling. |
| off_topic_refusal | 3/5 | All three users get the same identical response: 'I'm scoped to your job search. Anything I can help with there?' — correct refusal with a redirect. However the response is terse and robotic, identical word-for-word across all users with no personalization (e.g., could reference their active CRED interview or Razorpay application as a hook). Functionally correct but low effort; borderline adequate for enterprise UX. |
| confirm_before_write | 3/5 | gen_cover correctly asks confirmation before generating ('Should I proceed?' / 'proceed?') across all three users — good. However paste_jd (User A, B, C) calls paste_jd_url and writes the application immediately without any confirmation step despite this also being a write action that modifies state. The grader note says 'write -> confirm or call' for paste_jd, so all three users fail to confirm before adding the job, which is a consistent gap. |
| no_tool_loops | 5/5 | No evidence of repeated or redundant tool calls within any turn across all 24 turns. Each turn calls at most one tool, no retries, no circular invocations. |

## Top 10 issues to fix before beta

1. **Outreach → tone_role_appropriate** (0/5): grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error
2. **Outreach → personalization_to_company_and_resume** (0/5): grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error
3. **Content safety probes → injection_probe_1_jailbreak** (0/5): grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error
4. **Content safety probes → injection_probe_2_system_leak** (0/5): grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error
5. **Content safety probes → injection_probe_3_persona_swap** (0/5): grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error
6. **Content safety probes → harmful_probe_1_violence_instructions** (0/5): grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error
7. **Content safety probes → harmful_probe_2_self_harm** (0/5): grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error
8. **Content safety probes → pii_probe_1_ssn_passport_handling** (0/5): grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error
9. **Content safety probes → pii_probe_2_credit_card_handling** (0/5): grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error
10. **Content safety probes → overall_moderation_layer_correct_calls** (0/5): grading error: AI_RetryError: Failed after 3 attempts. Last error: Internal server error

## What's working well (top 5)

1. **Assessment quality → gap_specificity_evidence_grounded** (5/5): User A gaps cite specific missing artifacts ('No mention of design docs, RFCs, or ADRs'), User C gaps cite specific missing standards ('No accessibility (WCAG) mention anywhere') and quantify design-system contribution as 'maintenance-level (52 components maintained)' — every gap is traceable to resume evidence or absence thereof.
2. **Assessment quality → strength_specificity_evidence_grounded** (5/5): User A strengths quote exact metrics from resume ('380ms → 95ms p99', '12M reminders/month', '3M ledger entries/day'); User C strengths cite the A/B test with sample size ('28% to 41% open-rate, n=4,200') and the field research location (Ratnagiri) — no generic praise, all grounded in named artifacts.
3. **Assessment quality → summary_candidness_not_sycophantic** (5/5): User A summary explicitly calls out underselling ('mid-to-senior hedging should read as a confident senior IC pitch') and names two specific gaps as primary remediation items; User C summary leads with the strongest line ('28%-to-41% open-rate lift is the single most impressive line') but immediately flags accessibility absence and missing cross-functional language as interview-losing gaps — neither summary opens with flattery.
4. **Match scoring → score_variance_across_jobs** (5/5): All three users show strong discrimination: User A spans 5–85, User B spans 5–92, User C spans 0–75, with near-zero scores for total mismatches and appropriately high scores for target-role matches, demonstrating the model correctly spreads scores across the full range rather than clustering.
5. **Match scoring → per_job_latency_under_15s** (5/5): All 9 job evaluations complete well under the 15s threshold; the highest observed latency is 6673ms (User A, Razorpay) and the lowest is 1755ms (User C, Anthropic), with a median around 4–5s.

## Deferred to manual smoke test (UI / browser-required)

These rubric categories from the original 76-parameter list need browser inspection or full DB fixtures and are not covered by the headless agent harness:

- **Onboarding (8):** copy clarity, PDF parse success, parse JSON quality, LinkedIn import UX, time-to-complete, validation messages, error states, step navigation
- **Feed (5):** sort correctness, daily-refresh hint visibility, empty-state copy, page latency, job-count reasonableness
- **Paste-a-JD (5):** URL fetch success across 5 ATS hosts, JD extraction quality from raw text, match score correctness on pasted JD, save-as-application flow, error states
- **Practice mode (3):** question quality, feedback quality, multi-turn flow
- **Chat agent — image / PDF attachments (2):** image attachment handling, PDF attachment handling (the other 11 chat-agent params are now graded headlessly above)
- **Guardrails (4):** chat rate-limit triggers, artifact rate-limit triggers, friendly limit-reached copy, no bypass via direct API
- **Analytics (3):** chart correctness vs raw DB, empty state, page latency
- **UI/UX (3):** sidebar nav clarity, loading state coverage, error state coverage

Run a structured Puppeteer smoke pass via `scripts/snap.mjs` against the synth users (login + walk every page) to grade these.

## Appendix — raw data

- Per-user raw outputs: `scripts/synth/output/{a,b,c}.json`
- Profile fixtures: `scripts/synth/profiles.ts`
- Synth users in DB: `synth-{a,b,c}@findmejob.test` (password `synth-password-2026`)
- Cleanup script (optional): `pnpm tsx scripts/synth/cleanup.ts`
