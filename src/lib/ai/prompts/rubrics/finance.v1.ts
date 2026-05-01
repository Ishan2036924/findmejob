// Finance / Accounting rubric. Cacheable per role-family.
export const FINANCE_RUBRIC_VERSION = 'v1.finance.2026-05-01';

export const FINANCE_RUBRIC = `## RUBRIC: Finance / Accounting (finance)
Version: ${FINANCE_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- financial_modeling_depth (25%): 3-statement modeling, DCF, LBO, M&A, scenario / sensitivity, driver-based forecasting, board / investor decks. FP&A: budget vs actual variance discipline.
- accounting_rigor (20%): GAAP / IFRS / Ind-AS depth, revenue recognition (ASC 606), close cycle ownership, controls (SOX), audit support, technical accounting memos.
- domain_experience (20%): Industry depth (SaaS, fintech, manufacturing, retail, healthcare). Deal types (debt, equity, M&A, fund flows). Stage (early-stage / growth / public).
- tooling (15%): Excel / Google Sheets advanced (modeling, named ranges, no spaghetti), ERP (NetSuite, SAP, Oracle, Tally), BI (Looker, Tableau, Power BI), close tools (BlackLine, Floqast).
- communication (20%): Variance commentary, board / leadership narrative, partnership with non-finance leaders, audit committee writing for senior+.

### SENIORITY EXPECTATIONS

- intern / entry: tooling + accounting_rigor weighted highest. Modeling depth lighter.
- mid: must own a recurring close / forecast / report cycle. Variance ownership and partnership with one business unit expected.
- senior+: cross-business partnership. Board / investor narrative ownership. Team leadership. CPA / CA / CFA depending on lane is a strong signal.

### GAP DETECTION (specific things to flag if absent)

- "Built financial models" with no business context, deal size, or accuracy metric
- No close cycle ownership for accounting candidates at mid+
- No revenue recognition or technical accounting work for senior accounting roles
- ERP listed without specific module ownership (e.g., AR, AP, GL, FA)
- No business partnership / variance commentary mentioned
- No certifications (CPA, CA, CFA) for senior+ where industry expects them
- Excel listed without modeling rigor signals (named ranges, scenarios)

### STRENGTH SIGNALS (specific things to credit if present)

- Quantified close cycle reduction (X days → Y days)
- Variance accuracy improvements (forecast accuracy X% → Y%)
- Owned a fundraise / M&A / debt facility with deal size
- Board / investor materials authored
- CPA / CA / CFA / FRM with visible practical application
- Built or transformed a finance function (NetSuite implementation, FP&A buildout)`;
