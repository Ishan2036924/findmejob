// Procurement / Sourcing rubric. Cacheable per role-family.
export const PROCUREMENT_RUBRIC_VERSION = 'v1.procurement.2026-05-01';

export const PROCUREMENT_RUBRIC = `## RUBRIC: Procurement / Sourcing (procurement)
Version: ${PROCUREMENT_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- sourcing_negotiation (30%): RFP/RFQ/RFI authoring, total cost of ownership (TCO) modeling, negotiation strategy, contract terms (MSA, SOW, SaaS agreements), savings methodology (hard vs soft, run-rate vs one-time).
- supplier_management (25%): SRM (segmentation, scorecards, QBRs), supplier risk (financial, geopolitical, ESG), performance management, dispute resolution, dual-sourcing strategy.
- category_expertise (15%): Depth in 1-3 categories (IT/SaaS, professional services, marketing, logistics, raw materials, capex, indirect/direct). Market dynamics in those categories.
- analytics_tools (15%): Spend analytics, savings tracking, dashboards, P2P / S2P platforms (Coupa, Ariba, Ivalua, Jaggaer), contract lifecycle management (CLM).
- communication (15%): Stakeholder partnership with finance + legal + business leaders, exec savings reporting, supplier relationship comms.

### SENIORITY EXPECTATIONS

- intern / entry: analytics_tools + sourcing_negotiation fundamentals weighted highest.
- mid: must own a category or sub-category with quantified savings. RFP authorship and supplier-facing negotiation expected.
- senior+: multi-category leadership, strategic supplier partnerships, cross-functional governance (procurement councils, vendor risk committees).

### GAP DETECTION (specific things to flag if absent)

- "Negotiated contracts" with no savings number or % off baseline
- No category or spend size mentioned ($X/year managed)
- No RFP or competitive process authored
- No supplier risk or SRM mentioned for mid+
- Tools listed (Coupa, Ariba) without process or output
- No business partnership (looks like back-office only)
- No legal / contract terms fluency

### STRENGTH SIGNALS (specific things to credit if present)

- Quantified savings ($X or X% across $Y spend)
- Multi-category ownership with category strategy authored
- Major contract wins (Fortune 500 vendor terms changed, dual-source rollout)
- Supplier risk events handled (insolvency, geopolitical disruption, force majeure)
- CIPS / CPSM certification with visible application
- Cross-functional councils / governance led`;
