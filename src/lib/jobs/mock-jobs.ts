// Sample jobs used as a fallback when JSEARCH_API_KEY is unset and during
// local dev. 12 listings — 6 Data/ML, 6 SWE — India-focused, mid-range
// seniority. Realistic enough to exercise the match-scoring agent.

import type { JobRegion } from './region';
import type { RoleFamily } from '@/lib/ai/schemas/profile';

export type RawJob = {
  source: 'jsearch' | 'greenhouse' | 'lever' | 'ashby';
  source_id: string;
  source_url: string;
  title: string;
  company: string;
  location: string;
  description: string;
  posted_at: string; // ISO
  region: JobRegion;
  role_family?: RoleFamily | null; // populated by classifier at ingest time
};

const now = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400e3).toISOString();

export const MOCK_JOBS: RawJob[] = [
  {
    source: 'jsearch',
    source_id: 'mock-ml-001',
    source_url: 'https://example.com/jobs/mock-ml-001',
    title: 'Machine Learning Engineer',
    company: 'Razorpay',
    location: 'Bengaluru, India',
    posted_at: daysAgo(2),
    region: 'india',
    description: `We're hiring an ML Engineer for our risk and fraud team. You'll own production ML models that score every transaction in <50ms.

Responsibilities:
- Train, deploy, and monitor classification + anomaly-detection models
- Build data pipelines in Spark / Airflow over our Snowflake warehouse
- Set up MLflow for experiment tracking and model registry
- Partner with Risk Operations to translate model outputs into ops workflows

Requirements:
- 3+ years applied ML in production (not just notebooks)
- Strong SQL — you write window functions without looking up syntax
- Python ML stack (scikit-learn, PyTorch or TF, Pandas)
- Comfort with serving frameworks (FastAPI, Triton, or SageMaker)
- Bonus: experience with imbalanced classification, calibration

We don't care about your degree. Show us shipped models.`,
  },
  {
    source: 'jsearch',
    source_id: 'mock-ml-002',
    source_url: 'https://example.com/jobs/mock-ml-002',
    title: 'Senior NLP Engineer',
    company: 'Sarvam AI',
    location: 'Bengaluru, India',
    posted_at: daysAgo(4),
    region: 'india',
    description: `Senior NLP Engineer to work on Indic-language LLMs and RAG systems for enterprise clients.

You'll:
- Fine-tune transformer architectures (LLaMA, Mistral variants) for Hindi / Tamil / Bengali
- Build retrieval-augmented generation pipelines with FAISS or pgvector
- Run evaluations on retrieval metrics (MRR, NDCG, hit-rate) and generation quality
- Collaborate with product to ship enterprise chatbots (Life Sciences, BFSI domains welcome)

Requirements:
- 5+ years in NLP, with at least 2 years on transformer-based architectures
- Hugging Face Transformers fluency
- RAG production experience — chunking strategies, embedding choices, evaluation
- Strong written English; ability to explain systems to non-technical stakeholders

Open-source contributions or papers a strong plus.`,
  },
  {
    source: 'jsearch',
    source_id: 'mock-ml-003',
    source_url: 'https://example.com/jobs/mock-ml-003',
    title: 'Data Scientist (Mid-Level)',
    company: 'Swiggy',
    location: 'Bengaluru, India',
    posted_at: daysAgo(1),
    region: 'india',
    description: `Data Scientist on the supply team. Optimize courier dispatch and pricing.

Day to day:
- Build forecasting models for delivery demand by hex / hour
- A/B test pricing experiments with proper power analysis
- Write SQL queries against our warehouse to slice marketplace metrics
- Present findings to ops leadership

Must have:
- 2-5 years of applied data science work
- SQL fluency — CTEs, window functions, query optimization
- Python (Pandas, statsmodels, scikit-learn)
- Strong statistical foundations (you know what a power calculation is)
- Ability to translate ambiguous business questions into experiments

Nice to have: Spark / dbt experience, time-series modeling.`,
  },
  {
    source: 'jsearch',
    source_id: 'mock-ml-004',
    source_url: 'https://example.com/jobs/mock-ml-004',
    title: 'MLOps Engineer',
    company: 'Cred',
    location: 'Bengaluru, India',
    posted_at: daysAgo(7),
    region: 'india',
    description: `MLOps engineer to build the platform our ML team uses to ship models.

You'll own:
- Model serving infrastructure (currently Triton + KServe on EKS)
- Experiment tracking (MLflow) and model registry
- Drift detection and automated retraining pipelines
- CI/CD for ML — testing, deployment, rollback

Requirements:
- 4+ years infra / platform engineering
- Strong Kubernetes (you've debugged real K8s incidents)
- Docker, Terraform, AWS or GCP
- Familiarity with ML lifecycle — what data scientists need from a platform
- Python + Go preferred

We're a small team. You'll have a real seat at the architecture table.`,
  },
  {
    source: 'jsearch',
    source_id: 'mock-ml-005',
    source_url: 'https://example.com/jobs/mock-ml-005',
    title: 'Applied Scientist — Recommendations',
    company: 'Flipkart',
    location: 'Bengaluru, India',
    posted_at: daysAgo(3),
    region: 'india',
    description: `Applied Scientist on the home-page recommendation team. Drive metrics that move the needle for 400M+ users.

Scope:
- Improve our ranker beyond gradient-boosted trees — explore two-tower models, sequential rec
- Run online A/B experiments with proper holdout design
- Publish learnings (internal and external — we encourage conference submissions)
- Mentor junior data scientists

Must have:
- Mid-to-senior experience in recommender systems or large-scale ranking
- Comfort with offline evaluation (NDCG, MAP) AND online A/B causal inference
- PyTorch or TF for production training
- SQL on petabyte-scale warehouses

KaggleMaster, paper authorships, or open-source contributions in RecSys are strong signals.`,
  },
  {
    source: 'jsearch',
    source_id: 'mock-ml-006',
    source_url: 'https://example.com/jobs/mock-ml-006',
    title: 'AI Engineer',
    company: 'Postman',
    location: 'Remote, India',
    posted_at: daysAgo(5),
    region: 'remote',
    description: `AI Engineer to build LLM features into Postman — agents that write API tests, generate docs, debug failed runs.

You'll:
- Wire up LLM-powered workflows using OpenAI / Anthropic APIs
- Build evals and guardrails — we hate flaky AI features
- Design prompts and tool-use schemas
- Ship features end-to-end with our product team

Requirements:
- 2+ years building production LLM features (not just one prototype)
- Comfort with TypeScript / Node OR Python
- Prompt engineering experience — caching, few-shot, structured output
- You've shipped at least one feature where an LLM is the core, not a wrapper

We're remote-first across India. Strong async writing required.`,
  },
  {
    source: 'jsearch',
    source_id: 'mock-swe-001',
    source_url: 'https://example.com/jobs/mock-swe-001',
    title: 'Senior Backend Engineer',
    company: 'Razorpay',
    location: 'Bengaluru, India',
    posted_at: daysAgo(2),
    region: 'india',
    description: `Senior backend engineer on the payments platform team. We process 1B+ transactions a year.

You'll work on:
- High-throughput payment APIs in Go (some legacy in Java)
- Distributed systems problems — idempotency, exactly-once delivery, sharding
- Postgres at scale (read replicas, partitioning, vacuum tuning)
- Kafka pipelines for downstream services

Requirements:
- 5+ years backend, ideally in fintech or high-volume systems
- Strong Go OR Java; willingness to use both
- Real production debugging chops — you've fixed a P0 in your career
- System design instincts (DB choice, caching strategies, queue design)

We move fast and we ship.`,
  },
  {
    source: 'jsearch',
    source_id: 'mock-swe-002',
    source_url: 'https://example.com/jobs/mock-swe-002',
    title: 'Full-Stack Engineer (Mid-Level)',
    company: 'Zerodha',
    location: 'Bengaluru, India',
    posted_at: daysAgo(6),
    region: 'india',
    description: `Full-stack engineer for our trading platform. You'll work on Kite — used by millions of retail traders.

Stack: Go backend, React frontend, PostgreSQL, Redis. Real-time market data over WebSockets.

You'll:
- Build new product features end-to-end (order placement, charting, alerts)
- Optimize for low latency — milliseconds matter on the trading floor
- Write tests, do code reviews, mentor juniors

Requirements:
- 3-5 years full-stack experience
- Solid React + TypeScript — you write hooks correctly the first time
- Backend in Go or a serious language (no Node-only resumes please)
- SQL fluency
- Security awareness — financial systems have stricter requirements

We're small (~50 engineers), profitable, and we don't do meetings for fun.`,
  },
  {
    source: 'jsearch',
    source_id: 'mock-swe-003',
    source_url: 'https://example.com/jobs/mock-swe-003',
    title: 'Frontend Engineer — Design Systems',
    company: 'Postman',
    location: 'Bengaluru, India',
    posted_at: daysAgo(3),
    region: 'india',
    description: `Frontend engineer on our design systems team. Build the components every product team uses.

What we work on:
- A React component library shipped via private npm
- Tooling — Storybook, visual regression, accessibility audits
- Migrations across the org from legacy components to new ones
- Tight collab with design (Figma) and product

Requirements:
- 4+ years frontend, ideally with at least 1 year on a design-system or shared-component team
- Deep React (hooks, context, Suspense, server components)
- Strong CSS — you understand cascade, layout, accessibility
- TypeScript — strict mode, generics
- Accessibility seriousness (you've fixed real a11y issues, not just run axe-core once)

Bonus: open source design-system contributions, Radix or Base UI experience.`,
  },
  {
    source: 'jsearch',
    source_id: 'mock-swe-004',
    source_url: 'https://example.com/jobs/mock-swe-004',
    title: 'Software Engineer (Backend)',
    company: 'Zomato',
    location: 'Gurugram, India',
    posted_at: daysAgo(1),
    region: 'india',
    description: `Backend engineer on the consumer ordering team. Build the systems that power 100M+ users' food orders.

What you'll do:
- Java + Spring Boot services on Kubernetes
- Owning a service end-to-end (design → deploy → observability → on-call)
- Cassandra, Redis, RabbitMQ in the stack
- Performance tuning under real load

Requirements:
- 2-4 years professional backend experience
- Strong Java + Spring (or willingness to learn fast — we'll consider strong Go/Python folks)
- SQL + at least one NoSQL (Cassandra, Mongo, Dynamo)
- You've debugged production incidents
- Good written communication — we do RFCs for major changes

DSA fundamentals matter. Be ready to discuss your approach to a system design problem.`,
  },
  {
    source: 'jsearch',
    source_id: 'mock-swe-005',
    source_url: 'https://example.com/jobs/mock-swe-005',
    title: 'Staff Engineer — Platform',
    company: 'Atlassian',
    location: 'Bengaluru, India',
    posted_at: daysAgo(8),
    region: 'india',
    description: `Staff engineer on the platform team. Set technical direction for our internal developer platform.

Scope:
- Design + drive multi-quarter platform initiatives
- Mentor 4-6 senior engineers
- Write RFCs that shape eng-wide architecture decisions
- Partner with EM on roadmap and team growth

You should have:
- 8+ years experience, with at least 3 in a senior+ IC role
- Track record of shipping platform-scale projects (multi-team, multi-quarter)
- Distributed systems depth — you've designed for failure modes, not just happy path
- Influence skills — you can move others' priorities through good docs and 1:1s
- Bonus: developer-platform, internal tooling, or DX background

This is a high-bar staff role. We expect ambiguity-handling and strong written communication.`,
  },
  {
    source: 'jsearch',
    source_id: 'mock-swe-006',
    source_url: 'https://example.com/jobs/mock-swe-006',
    title: 'Software Engineer (Junior)',
    company: 'CRED',
    location: 'Bengaluru, India',
    posted_at: now(),
    region: 'india',
    description: `Junior backend engineer. We hire smart engineers early in their careers and grow them fast.

You'll learn:
- Go services on Kubernetes
- Postgres + Redis at high scale
- Strong testing culture (we believe in tests, not just rituals)
- Observability — Datadog, structured logging
- Code review as a craft

We're looking for:
- 0-2 years experience (CS degree, bootcamp grad, or self-taught)
- Strong fundamentals — DSA, OOP, basic distributed systems concepts
- ONE language deep, not many shallow
- Curiosity — you've built side projects, contributed to OSS, or shipped a freelance project

Show us your GitHub. We want to see actual code.`,
  },
];
