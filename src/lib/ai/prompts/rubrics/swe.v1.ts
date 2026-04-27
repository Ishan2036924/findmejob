// Software Engineer rubric. Cacheable per role-family. Bump version when
// dimension weights or descriptions change.
export const SWE_RUBRIC_VERSION = 'v1.swe.2026-04-27';

export const SWE_RUBRIC = `## RUBRIC: Software Engineer (swe)
Version: ${SWE_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights)

- technical_depth (30%): Algorithms, data structures, system design, language fundamentals, performance/correctness reasoning. Senior+ should show distributed systems familiarity.
- engineering_breadth (25%): Testing (unit/integration/e2e), CI/CD, code review practices, observability/logging/metrics, source control hygiene.
- domain_experience (20%): Years of professional experience, project complexity (LOC, users, throughput), team size, ownership scope.
- communication (15%): Resume writing quality (action verbs, quantification, clarity), evidence of cross-team collaboration or stakeholder mgmt, documentation in projects.
- trajectory (10%): Career progression signals (promotions, expanded scope, skill stacking), recency of growth.

### SENIORITY EXPECTATIONS

- intern / entry: technical_depth weighted highest in your judgment. engineering_breadth lighter. domain_experience near zero — don't penalize for absence.
- mid: balanced across dimensions. trajectory matters more.
- senior+: leadership signals expected. system design depth required for full score on technical_depth. mentoring evidence expected.

### GAP DETECTION (specific things to flag if absent)

- No quantified impact in any bullet (used "led", "built", "improved" without numbers)
- No system design or architecture mentions for senior+
- No production-scale or load-bearing experience mentioned
- No tests / CI / observability mentioned anywhere
- Skills section lists tools without context — no "used X to do Y"
- Frequent role changes (<12 months) without clear progression
- Gaps in employment without explanation visible in resume

### STRENGTH SIGNALS (specific things to credit if present)

- Specific, quantified outcomes (X% improvement, N users, $Y revenue)
- Open-source contributions (with links if provided)
- Tech blog or conference talks
- Owned full-stack projects end-to-end
- Mentorship or interview-running explicitly mentioned
- Depth-over-breadth signal in their stack (deep expertise vs. tool collection)`;
