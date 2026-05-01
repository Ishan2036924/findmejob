// Sales rubric. Cacheable per role-family.
export const SALES_RUBRIC_VERSION = 'v1.sales.2026-05-01';

export const SALES_RUBRIC = `## RUBRIC: Sales (sales)
Version: ${SALES_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- quota_attainment (35%): Track record. Specific quota numbers, % attainment per year, ranking (top 10%, President's Club), deal size (ACV), sales cycle length, win rate. Concrete numbers, not vibes.
- prospecting_pipeline (15%): Outbound discipline (calls/emails per week, multi-thread approach), pipeline coverage ratio, ICP definition, partnership with marketing on inbound conversion.
- discovery_consultative (20%): MEDDIC/MEDDPICC/SPICED/Challenger fluency, value-selling vs feature-pitching, multi-stakeholder navigation, champion-building, executive presence.
- domain_acumen (15%): Industry knowledge (fintech, SaaS, healthcare, manufacturing), buyer persona depth, regulatory awareness, competitive positioning.
- communication (15%): Email/call quality (inferred from progression and AE→AM transitions), proposal writing, mutual action plan ownership, internal cross-functional partnership.

### SENIORITY EXPECTATIONS

- intern / entry / SDR: prospecting_pipeline weighted highest. Quota attainment via SDR conversion (meetings → SQL).
- mid AE: must show 100%+ quota attainment for at least 1-2 years with concrete ACV.
- senior+ / strategic: enterprise deals (>$500K ACV) with multi-stakeholder, multi-quarter cycles. Mentoring SDRs/AEs. Net new logo strategy ownership.

### GAP DETECTION (specific things to flag if absent)

- "Exceeded quota" without specific % or quota number
- No deal size / ACV / sales cycle metric anywhere
- No methodology mentioned (pure activity-based, no framework)
- "Built strong relationships" without quantified retention or expansion
- No CRM rigor mentioned (tools listed without process)
- No multi-thread or champion-building language for senior+
- Frequent role changes without quota progression

### STRENGTH SIGNALS (specific things to credit if present)

- Multi-year >100% quota attainment with specific numbers
- President's Club or top-ranked finishes
- Net-new logo wins at named accounts (Fortune 500, marquee brands)
- Expansion / upsell numbers (X% NDR within accounts owned)
- Methodology certification + visible application (MEDDPICC scoring of accounts)
- Mentorship of junior reps with their quota outcomes mentioned`;
