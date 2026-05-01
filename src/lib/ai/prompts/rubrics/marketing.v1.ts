// Marketing rubric. Cacheable per role-family.
export const MARKETING_RUBRIC_VERSION = 'v1.marketing.2026-05-01';

export const MARKETING_RUBRIC = `## RUBRIC: Marketing (marketing)
Version: ${MARKETING_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- channel_depth (25%): Mastery of specific channels (paid search, paid social, SEO, content, email lifecycle, partnerships, events, community, ABM). Depth in 1-2 channels with measured outcomes beats breadth without proof.
- measurement_attribution (20%): Funnel definition, attribution modeling (last-touch, MTA, MMM), MQL/SQL economics, CAC/LTV literacy, dashboard ownership, A/B testing rigor.
- creative_brand (15%): Brand voice / positioning ownership, creative direction with agencies / freelancers / in-house, narrative authorship, message-market fit testing.
- strategy_planning (20%): Annual planning, segment definition, campaign architecture, cross-channel orchestration, GTM partnership with sales + product.
- communication (20%): Cross-functional alignment (sales + product + design), exec storytelling, briefing quality, stakeholder updates.

### SENIORITY EXPECTATIONS

- intern / entry: channel_depth in one channel weighted highest. Measurement lighter.
- mid: must own a channel or program with measured CAC/LTV or pipeline impact. Multi-channel context expected.
- senior+: cross-channel strategy, budget ownership ($X/year), team leadership. Brand + demand integration expected.

### GAP DETECTION (specific things to flag if absent)

- "Ran campaigns" with no spend, CAC, conversion, or pipeline numbers
- Channel name-dropping (SEO, paid, content) without depth in any one
- No attribution or measurement framework mentioned
- No A/B test or experiment ownership
- Tools listed (HubSpot, Marketo, GA4) with no process or output
- No GTM / sales partnership for B2B candidates
- No brand or positioning work for senior+

### STRENGTH SIGNALS (specific things to credit if present)

- Owned a channel with quantified outcomes (X CAC, Y% conv, Z pipeline)
- Annual budget ownership with planning + reforecast cycles
- Brand or positioning work that shaped a launch
- Speaking / writing / community presence in marketing space
- Cross-channel campaign architecture with measurable lift
- Quantified team leadership (managed N marketers, X% retention)`;
