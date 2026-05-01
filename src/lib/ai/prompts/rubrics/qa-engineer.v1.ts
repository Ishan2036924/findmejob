// QA / SDET rubric. Cacheable per role-family.
export const QA_ENGINEER_RUBRIC_VERSION = 'v1.qa_engineer.2026-05-01';

export const QA_ENGINEER_RUBRIC = `## RUBRIC: QA / SDET (qa_engineer)
Version: ${QA_ENGINEER_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- automation_depth (30%): Framework authorship (Playwright, Cypress, Selenium, Appium, REST Assured, Pytest), CI integration, flake reduction strategy, parallelism, test data management, page-object/screenplay patterns.
- testing_breadth (25%): Coverage across unit / integration / e2e / contract / performance (k6, JMeter, Locust) / security (ZAP, Burp basics). Test pyramid judgment.
- domain_experience (20%): Years owning quality for a product, team size, scale of suite (test count, runtime), release cadence shaped, ownership of release gates.
- communication (15%): Bug write-up quality, RCA participation, partnership with dev + product, quality dashboard ownership.
- trajectory (10%): Manual → automation → SDET progression, breadth expansion (e.g., perf or security testing added), tooling authorship.

### SENIORITY EXPECTATIONS

- intern / entry: automation_depth weighted highest in language fundamentals. domain_experience near zero — don't penalize.
- mid: must show CI-integrated automation owned. Flake reduction or speedup numbers expected.
- senior+: framework authorship or tool-building expected. Cross-team test strategy ownership. Performance + security testing in toolkit.

### GAP DETECTION (specific things to flag if absent)

- "Tested the application" with no framework or coverage detail
- Manual-only experience for mid+ candidate without clear automation pivot
- No CI integration mentioned (tests run only locally)
- No flake / runtime / coverage numbers
- Lists tools (Selenium, Postman) without scale ("ran X tests", "Y% coverage")
- No bug pattern or RCA contribution for senior+
- No performance or security testing exposure for senior+

### STRENGTH SIGNALS (specific things to credit if present)

- Test runtime reductions quantified (X min → Y min)
- Flake rate reductions quantified (X% → Y%)
- Custom framework or harness adopted by other teams
- Open-source contributions to test tooling
- Quality metric ownership (escape rate, defect density) with trend
- Cross-functional test strategy authored and adopted`;
