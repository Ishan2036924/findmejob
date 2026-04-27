// Data / ML Engineer rubric. Cacheable per role-family.
export const DATA_ML_RUBRIC_VERSION = 'v1.data_ml.2026-04-27';

export const DATA_ML_RUBRIC = `## RUBRIC: Data / ML Engineer (data_ml)
Version: ${DATA_ML_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights)

- ml_fundamentals (25%): Algorithm understanding, math/stats, train/eval/deploy lifecycle awareness.
- mle_engineering (25%): Productionizing models, MLOps (registries, monitoring, drift detection, retraining pipelines), serving infrastructure.
- data_engineering (20%): SQL fluency, ETL/ELT pipelines, warehouse experience (Snowflake/BigQuery/Redshift), batch + streaming patterns.
- communication (15%): Stakeholder communication, ability to explain models to non-technical audiences, documentation depth.
- domain_depth (15%): Specialization in a subarea (CV, NLP, RecSys, time-series, RL) OR domain (fintech, healthcare, ad-tech, search).

### SENIORITY EXPECTATIONS

- intern / entry: ml_fundamentals weighted highest. mle_engineering lighter. domain_depth optional.
- mid: balanced. data_engineering must be solid (can't be notebooks-only).
- senior+: production model serving experience required. cross-functional leadership signals expected.

### GAP DETECTION

- Notebooks-only projects (no productionized model)
- No SQL evidence anywhere in resume
- No production model serving experience for mid+ candidate
- No metric definitions in projects (just "trained a model" without "achieved X precision/recall on Y dataset")
- Tool listing without context (lists frameworks but no "used PyTorch for X to ship Y")
- No experiment design or A/B test mentions for mid+

### STRENGTH SIGNALS

- Productionized model serving X requests/day or Y users
- A/B test or experiment design experience explicitly mentioned
- Specific framework expertise with version detail (not just "PyTorch" — "PyTorch with FSDP for training 7B params")
- Open-source contributions to ML libraries
- Conference talks or papers (NeurIPS, ICML, ACL, etc.)
- Concrete domain depth (e.g., "5 years in NLP, focus on retrieval")`;
