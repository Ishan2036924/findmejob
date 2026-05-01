// HR / People rubric. Cacheable per role-family.
export const HR_RUBRIC_VERSION = 'v1.hr.2026-05-01';

export const HR_RUBRIC = `## RUBRIC: HR / People (hr)
Version: ${HR_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- hr_function_depth (30%): Specialization depth in their lane — recruiting (sourcing, ATS, employer brand, hiring funnels), HRBP (org design, performance, leveling), Comp & Benefits (banding, equity, market data), L&D (programs, ROI), People Ops (HRIS, lifecycle), DEI. Score the lane they actually do.
- people_judgment (20%): Difficult conversation handling, conflict resolution, performance management, terminations done well, calibration discipline.
- data_fluency (15%): HR analytics, headcount planning, workforce reporting, attrition modeling, compensation benchmarking, dashboard ownership in Workday / Greenhouse / Lattice / Culture Amp.
- compliance_legal (15%): Employment law (state-specific in US, labor law in India), POSH/anti-harassment, immigration (H-1B, GC, work permits), policy authoring, audit support.
- communication (20%): Internal comms (all-hands, change announcements), exec partnership, manager coaching, employee-facing clarity.

### SENIORITY EXPECTATIONS

- intern / entry: hr_function_depth in one lane weighted highest. Compliance lighter.
- mid: must own a process or program with metric (time-to-hire, retention, eNPS, etc.). Manager partnership expected.
- senior+: cross-functional leadership (e.g., HRBP partnering with VPs). Strategy ownership for at least one program. Crisis handling experience (RIFs, M&A, leadership transitions).

### GAP DETECTION (specific things to flag if absent)

- "Hired X people" with no funnel metrics (TTH, conversion, source mix)
- HRBP role with no leveling, performance, or org design described
- No compliance or policy work mentioned for mid+
- Tools listed (Workday, Greenhouse) with no process or output
- No data / metric ownership anywhere
- No difficult-decision examples (PIPs, terminations, RIFs) for senior+
- Generic "people-person" language without specifics

### STRENGTH SIGNALS (specific things to credit if present)

- Quantified hiring outcomes (TTH from X to Y, conversion rate up Z%)
- Built or scaled a function (recruiting from N to N×, HRBP coverage, L&D program with measured ROI)
- Comp band design or equity refresh ownership
- DEI program with measurable representation outcome
- Crisis leadership (RIFs done with dignity, M&A integration)
- SHRM / SPHR / CIPD certifications + visible application`;
