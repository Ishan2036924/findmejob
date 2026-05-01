// Consulting rubric. Cacheable per role-family.
export const CONSULTING_RUBRIC_VERSION = 'v1.consulting.2026-05-01';

export const CONSULTING_RUBRIC = `## RUBRIC: Consulting (consulting)
Version: ${CONSULTING_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- structured_problem_solving (30%): Issue trees, MECE thinking, hypothesis-driven analysis, pyramid principle, opportunity sizing, market entry / growth / cost frameworks applied to real problems.
- client_communication (25%): Slide writing (lead with so-what, action titles), exec storytelling, workshop facilitation, difficult-message delivery, written deliverable quality.
- domain_breadth (20%): Industry coverage (TMT, FS, healthcare, retail, energy, public sector) and capability coverage (strategy, ops, tech, transformation, M&A, post-merger integration).
- execution_rigor (15%): Project management on engagements, workstream ownership, analyst supervision, deadline discipline, stakeholder mgmt across client + firm.
- trajectory (10%): Promotion velocity (analyst → consultant → manager → SM → partner), engagement scope expansion, firm tenure stability.

### SENIORITY EXPECTATIONS

- intern / entry / analyst: structured_problem_solving + execution_rigor weighted highest. Domain breadth lighter.
- mid (consultant / SC / manager): must own workstreams or whole engagements. Client-facing presence required.
- senior+ (SM / principal / partner): business development (sold work), engagement leadership, multi-engagement portfolio, mentorship of managers / consultants.

### GAP DETECTION (specific things to flag if absent)

- "Worked on consulting projects" with no industry, client size, or outcome described
- No framework or methodology evidence (vague "analyzed", "advised")
- No quantified client impact (cost saved, revenue unlocked, time reduced)
- No exec presentation or workshop facilitation for mid+
- No business development for SM+ (sold work, RFP wins)
- No mentorship of junior consultants for senior+
- Frequent firm switches without progression

### STRENGTH SIGNALS (specific things to credit if present)

- Quantified client outcomes ($X savings, Y% revenue lift, Z weeks faster)
- Marquee client engagements (Fortune 500, government, named brands)
- Sold work for SM+ ($X TCV, N follow-on engagements)
- Authored thought leadership (firm publications, articles, speaking)
- Cross-industry breadth at senior+ (3+ industries with depth in each)
- Firm-internal leadership (recruiting, training, practice building)`;
