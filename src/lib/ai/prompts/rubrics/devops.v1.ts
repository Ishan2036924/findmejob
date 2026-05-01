// DevOps / SRE / Cloud rubric. Cacheable per role-family.
export const DEVOPS_RUBRIC_VERSION = 'v1.devops.2026-05-01';

export const DEVOPS_RUBRIC = `## RUBRIC: DevOps / SRE / Cloud (devops)
Version: ${DEVOPS_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- infra_depth (30%): Cloud (AWS/GCP/Azure) primitives, Kubernetes, networking (VPC, DNS, TLS, load balancers), IaC (Terraform/Pulumi/CDK), security baseline (IAM, secrets, network policies). Senior+ should show multi-region or multi-cloud architecture decisions.
- reliability_breadth (25%): Observability (metrics/logs/traces — Prometheus/Grafana/Datadog/OTel), SLO/SLI definition, error budget thinking, incident response, postmortem writing, capacity planning.
- automation (20%): CI/CD pipelines (GitHub Actions/CircleCI/Argo/Tekton), GitOps (Argo CD/Flux), scripting (bash/Python/Go), runbook automation, cost optimization scripts.
- domain_experience (15%): Years on-call, scale operated (req/s, data volume, fleet size), team size, blast radius of changes owned.
- communication (10%): Postmortems, runbooks, RFC quality, cross-team partnership with eng + security + product.

### SENIORITY EXPECTATIONS

- intern / entry: infra_depth weighted highest. On-call expected to be light/shadow.
- mid: must own services in production with SLOs. CI/CD authorship expected.
- senior+: multi-region or multi-cloud familiarity. Incident command experience. On-call leadership and rotation design. Cost ownership with measurable savings.

### GAP DETECTION (specific things to flag if absent)

- "Set up CI/CD" without specifics (no tool, no pipeline complexity, no cycle time metric)
- Cloud listed but no service-level depth ("AWS" with no specific services)
- No SLO/SLI/error-budget language anywhere
- No on-call / incident response mention for mid+
- Terraform listed but no module ownership or state management mentioned
- Kubernetes listed without any operator/CRD/network policy depth for senior+
- No cost or capacity numbers anywhere

### STRENGTH SIGNALS (specific things to credit if present)

- Owned migration (on-prem → cloud, EC2 → k8s, monolith → microservices) with cycle time / cost numbers
- Authored or led an incident response practice / on-call rotation redesign
- Open-source contributions to k8s operators, Terraform providers, observability tools
- Custom platform / internal developer platform built and adopted
- Concrete SLO improvements (X% → Y% availability with Z error budget)
- Cost savings quantified ($X/month or X% reduction)`;
