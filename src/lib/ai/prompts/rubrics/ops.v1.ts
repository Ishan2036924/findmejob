// Operations rubric. Cacheable per role-family.
export const OPS_RUBRIC_VERSION = 'v1.ops.2026-05-01';

export const OPS_RUBRIC = `## RUBRIC: Operations (ops)
Version: ${OPS_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- process_design (25%): Workflow mapping, bottleneck identification, SOP authoring, change management, automation candidate selection, RACI clarity.
- analytics_rigor (25%): SQL fluency, dashboard ownership (Looker, Tableau, Sigma, Mode), decision-support analyses, opportunity sizing, forecasting basics.
- cross_functional_execution (20%): Project management discipline, stakeholder alignment across functions (sales/marketing/eng/finance), program ownership end-to-end, vendor management.
- domain_experience (15%): BizOps vs RevOps vs GTM Ops vs Strategy Ops vs Customer Ops — depth in their lane. Industry context (SaaS, fintech, marketplaces, e-commerce).
- communication (15%): Exec memos, leadership-readout writing, stakeholder briefings, root-cause writeups.

### SENIORITY EXPECTATIONS

- intern / entry: analytics_rigor + process_design weighted highest. Cross-functional execution lighter.
- mid: must own a recurring process or program with measurable impact. SQL non-negotiable for analytics-heavy ops roles.
- senior+: cross-org program ownership. Mentoring of analysts/PMs. Strategy partnership with CXO-level leaders.

### GAP DETECTION (specific things to flag if absent)

- "Improved efficiency" with no metric or % improvement
- No SQL evidence for analytics-heavy ops roles
- "Project managed X" with no scope, timeline, or stakeholder count
- No tooling depth (just listing Asana, Notion, JIRA without process)
- No cross-functional partnership described
- No quantified ROI on programs owned for mid+
- No domain specificity (generic "operations" without lane)

### STRENGTH SIGNALS (specific things to credit if present)

- Quantified efficiency wins (cycle time X → Y, cost X → Y)
- Owned a transformation initiative end-to-end with measurable outcome
- SQL + dashboard authorship adopted by leadership
- Built a function from scratch (RevOps, BizOps) at a company
- Mentorship or hiring leadership in ops
- Domain expertise (e.g., 5+ years in SaaS GTM Ops)`;
