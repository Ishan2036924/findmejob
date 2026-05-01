// Product Manager rubric. Cacheable per role-family.
export const PRODUCT_RUBRIC_VERSION = 'v1.product.2026-05-01';

export const PRODUCT_RUBRIC = `## RUBRIC: Product Manager (product)
Version: ${PRODUCT_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- discovery_strategy (25%): User research rigor (interviews, JTBD, surveys), prioritization frameworks used in practice (RICE, opportunity sizing, weighted scoring), product vision authoring, market/competitive analysis.
- execution (25%): Delivery cadence, metrics ownership (north star + counter-metrics), stakeholder management, sprint/roadmap discipline, launch and rollout planning, post-launch iteration.
- technical_fluency (15%): API/data model literacy, ability to write technical specs, system tradeoff judgment, pairing with engineering on architecture decisions, AI/ML product fluency for current roles.
- business_acumen (15%): P&L thinking, pricing/packaging, growth loops, cost-of-acquisition vs lifetime-value, B2B vs B2C economics, GTM partnership.
- communication (20%): PRD quality, stakeholder updates, exec narrative writing, cross-functional alignment, conflict resolution.

### SENIORITY EXPECTATIONS

- intern / entry: discovery_strategy + communication weighted highest. Business acumen lighter.
- mid: must own a product surface end-to-end with metric movement. Stakeholder mgmt at director level expected.
- senior+: 0→1 launches expected OR major surface ownership at scale. Team leadership (mentoring APMs/PMs) expected. Strategy authority with VP-level partnership.

### GAP DETECTION (specific things to flag if absent)

- "Launched a product" with no metric, user count, or revenue impact
- No user research mentioned (only secondhand insights)
- No prioritization framework or tradeoff-call described
- Roadmap-keeper only (no discovery or strategy authoring)
- No A/B test or experiment ownership
- Tools listing (Jira, Figma) with no PRDs or strategy docs cited
- No cross-functional ownership (only engineering partner)

### STRENGTH SIGNALS (specific things to credit if present)

- 0→1 launch with concrete revenue / user / engagement numbers
- Killed or sunset a product responsibly (with rationale)
- Authored a strategy doc that shaped roadmap at the org level
- Cross-functional leadership (eng + design + GTM + legal)
- Quantified metric impact (X% activation lift, $Y revenue, Z% retention)
- Mentorship of other PMs or APMs explicitly mentioned`;
