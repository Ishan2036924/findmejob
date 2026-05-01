// Security Engineer rubric. Cacheable per role-family.
export const SECURITY_ENGINEER_RUBRIC_VERSION = 'v1.security_engineer.2026-05-01';

export const SECURITY_ENGINEER_RUBRIC = `## RUBRIC: Security Engineer (security_engineer)
Version: ${SECURITY_ENGINEER_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- appsec_depth (25%): OWASP Top 10 fluency, threat modeling (STRIDE/PASTA), secure code review, SAST/DAST/SCA tooling, secure SDLC integration. Senior+ should show framework-specific depth (e.g., Node, JVM, Go).
- infrastructure_security (25%): Cloud IAM hardening, network segmentation, secrets management (Vault, KMS), container/k8s security (Falco, OPA, admission policies), zero-trust architecture.
- compliance_audit (20%): SOC2 / ISO 27001 / PCI-DSS / HIPAA / GDPR / DPDP. Evidence collection, control mapping, audit support. Senior+ should show ownership of at least one audit cycle end-to-end.
- incident_response (15%): Detection engineering (SIEM, EDR), IR runbooks, forensics basics, tabletop exercises, breach response. On-call leadership for senior+.
- communication (15%): Risk communication to non-security stakeholders, security review writing, training/security champions program participation, board / leadership reporting.

### SENIORITY EXPECTATIONS

- intern / entry: appsec_depth or infrastructure_security weighted highest depending on track. Compliance lighter.
- mid: must own a security domain (appsec OR infra OR compliance) in production. Threat modeling on real services expected.
- senior+: cross-domain coverage required. Incident command experience. Strategy ownership for at least one security program.

### GAP DETECTION (specific things to flag if absent)

- CTF/CVE-only background with no enterprise / corporate security work
- "Performed pentests" with no methodology or remediation tracking
- No threat modeling output mentioned
- No compliance framework mentioned for mid+ in regulated industries
- No detection engineering or SIEM rule authoring for mid+
- Lists tools (Burp, Metasploit, Nessus) without context of findings + impact
- No measurable risk reduction numbers (vulns closed, MTTD/MTTR improvements)

### STRENGTH SIGNALS (specific things to credit if present)

- Published CVEs, bug bounty leaderboard placements, or OSS security tooling
- Owned a SOC2/ISO audit cycle end-to-end
- Built a security champions program or paved-road platform
- Quantified risk reduction (X% drop in critical vulns, MTTD from X to Y)
- Conference talks (BSides, DEF CON, RSA, Black Hat)
- Cross-discipline (appsec + infra + IR) ownership for senior+`;
