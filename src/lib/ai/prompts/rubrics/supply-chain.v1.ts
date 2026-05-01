// Supply Chain rubric. Cacheable per role-family.
export const SUPPLY_CHAIN_RUBRIC_VERSION = 'v1.supply_chain.2026-05-01';

export const SUPPLY_CHAIN_RUBRIC = `## RUBRIC: Supply Chain (supply_chain)
Version: ${SUPPLY_CHAIN_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- planning_forecasting (25%): Demand planning, S&OP / IBP cadence ownership, statistical + judgmental forecasting, MAPE / bias tracking, inventory policy (safety stock, ROP, EOQ), MRP fluency.
- logistics_execution (25%): Inbound + outbound logistics, freight modes (LTL, FTL, ocean, air), 3PL/4PL management, customs/trade compliance, network design, last-mile.
- analytics_systems (20%): SAP (MM, SD, WM, APO/IBP), Oracle, Manhattan, Blue Yonder, Kinaxis. SQL / Excel / Power BI for spend, OTIF, fill rate. Data discipline.
- domain_experience (15%): Industry depth (CPG, retail, e-commerce, manufacturing, pharma, automotive). Stage (startup vs Fortune 500 scale). Geographic scope.
- communication (15%): Cross-functional partnership (sales + finance + ops), exec readouts on KPIs, supplier-facing comms, escalation handling.

### SENIORITY EXPECTATIONS

- intern / entry: analytics_systems + planning_forecasting fundamentals weighted highest.
- mid: must own a planning / logistics function with measurable KPI (OTIF, fill rate, inventory turns, MAPE).
- senior+: network or S&OP leadership, multi-region scope, transformation experience (ERP rollout, network redesign), team leadership.

### GAP DETECTION (specific things to flag if absent)

- "Managed supply chain" with no KPI (OTIF, fill rate, MAPE, inventory days)
- No ERP module ownership specified
- No forecasting accuracy or bias number
- No inventory or working capital impact mentioned
- Logistics listed without modes / lanes / 3PL specifics
- No SQL or analytics tooling depth for mid+
- No cross-functional partnership described

### STRENGTH SIGNALS (specific things to credit if present)

- Quantified KPI improvements (OTIF X% → Y%, MAPE X% → Y%, inventory days X → Y)
- ERP rollout or transformation owned end-to-end
- Network redesign with cost savings or service improvement
- S&OP / IBP cadence built or owned
- APICS CPIM / CSCP / CLTD with visible application
- Crisis handling (COVID disruptions, supplier failure, port congestion) with measurable response`;
