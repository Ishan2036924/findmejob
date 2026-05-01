// AI / ML Engineer rubric. Cacheable per role-family.
export const AI_ML_ENGINEER_RUBRIC_VERSION = 'v1.ai_ml_engineer.2026-05-01';

export const AI_ML_ENGINEER_RUBRIC = `## RUBRIC: AI / ML Engineer (ai_ml_engineer)
Version: ${AI_ML_ENGINEER_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- ml_depth (35%): Modeling intuition, math/stats foundations, deep learning architectures, evaluation rigor (offline/online), loss design, data-centric thinking. For senior+, expect LLM/RAG/agent system design (retrieval quality, eval harnesses, guardrails, tool use).
- ml_breadth (20%): MLOps and lifecycle: experiment tracking, model registries, CI/CD for models, drift/quality monitoring, A/B testing, serving infra (Triton/vLLM/SageMaker/Vertex), latency/cost tradeoffs.
- domain_experience (20%): Years applying ML to real product, problem space depth (CV, NLP, RecSys, search, RL, generative), team size, ownership of model surface area in production.
- communication (15%): Explaining model behavior to non-ML stakeholders, writing model cards / experiment reports, eval-driven decision making, mentoring evidence.
- trajectory (10%): Skill stacking from classical ML → DL → LLM/agents, scope expansion, recency of frontier work.

### SENIORITY EXPECTATIONS

- intern / entry: ml_depth weighted highest. ml_breadth lighter. Production deployment optional.
- mid: must show at least one shipped model serving real users with metrics. ml_breadth no longer optional.
- senior+: expect production LLM/RAG or agentic system OR deep specialty model in production at scale. Eval harness ownership and on-call/observability for ML systems expected.

### GAP DETECTION (specific things to flag if absent)

- Notebooks-only portfolio with no production model serving
- "Used GPT-4" without retrieval, eval, or guardrail design described
- LLM projects with no eval methodology (just vibes)
- No experiment tracking tool mentioned (W&B, MLflow, Comet, Neptune)
- No latency / cost / throughput numbers for any production model
- Tool listing without depth ("PyTorch, TensorFlow, JAX" with no specifics)
- No data quality / labeling / dataset construction work for senior+

### STRENGTH SIGNALS (specific things to credit if present)

- Production LLM/RAG with retrieval quality metrics + hallucination guardrails
- Custom eval harness or benchmark contribution
- Fine-tuning / distillation / quantization with measured tradeoffs
- Open-source ML contributions with stars/forks
- Papers (NeurIPS, ICML, ACL, EMNLP, CVPR) or strong arXiv presence
- Concrete domain depth with metric improvements (X% lift on Y metric on Z dataset)`;
