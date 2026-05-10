import type { ResumeJson, RoleFamily, Seniority } from '@/lib/ai/schemas/profile';

export type SynthProfile = {
  user_key: 'a' | 'b' | 'c' | 'd';
  email: string;
  target_role_family: RoleFamily;
  target_seniority: Seniority;
  target_location: string;
  resume_json: ResumeJson;
};

export const SYNTH_PROFILES: SynthProfile[] = [
  // ---------------------------------------------------------------------------
  // User A — Mid-level Software Engineer, Bengaluru, 4y at Indian unicorns.
  // ---------------------------------------------------------------------------
  {
    user_key: 'a',
    email: 'synth-a@findmejob.test',
    target_role_family: 'swe',
    target_seniority: 'mid',
    target_location: 'Bengaluru',
    resume_json: {
      contact: {
        name: 'Aarav Mehta',
        email: 'aarav.mehta.synth@findmejob.test',
        phone: '+91 98765 43210',
        location: 'Bengaluru, Karnataka, India',
        links: [
          { label: 'GitHub', url: 'https://github.com/aaravmehta-synth' },
          { label: 'LinkedIn', url: 'https://linkedin.com/in/aaravmehta-synth' },
        ],
      },
      summary:
        'Backend-leaning full-stack engineer with 4 years building payments and fintech infra at Indian unicorns. Comfortable shipping Java/Spring + Python services on Kubernetes, instrumenting them with OpenTelemetry, and on-call for high-throughput transaction systems. Looking for mid-to-senior IC roles where the bar for service reliability is non-trivial.',
      experience: [
        {
          title: 'Software Engineer II',
          company: 'CRED',
          location: 'Bengaluru, India',
          start_date: '2023-08',
          end_date: null,
          bullets: [
            'Owned the rewards-ledger service (Java 17, Spring Boot, Postgres, Kafka) handling ~3M ledger entries/day; cut p99 write latency from 380ms to 95ms via batched Kafka consumers and JDBC batch inserts.',
            'Migrated rewards reconciliation from a nightly Airflow DAG to a streaming Flink job; eliminated a recurring 4-hour SLA breach window and reduced reconciliation lag to under 2 minutes.',
            'Set up service-level OpenTelemetry tracing across 6 internal services, drove adoption with 3 other teams, and authored the org-wide tracing playbook now linked from the eng wiki.',
            'Mentored 2 SDE-1 hires through onboarding; ran weekly system-design pairing sessions covering caching, idempotency, and queue back-pressure.',
          ],
        },
        {
          title: 'Software Engineer',
          company: 'Razorpay',
          location: 'Bengaluru, India',
          start_date: '2021-07',
          end_date: '2023-07',
          bullets: [
            'Built UPI mandate auto-debit reminders pipeline (Python, AWS Lambda, SQS, DynamoDB) that processed ~12M reminders/month with under 0.1% failure rate.',
            'Reduced merchant onboarding API latency by 38% by replacing N+1 Postgres queries with a denormalized read-model materialised via Debezium CDC into Redis.',
            'Wrote the team\'s first chaos-test harness using Toxiproxy in CI; caught two latent retry bugs in payouts before they hit prod.',
            'Acted as on-call primary in a 6-engineer rotation; led 4 production incident reviews and authored 2 RCAs that fed into the platform-wide retry-budget policy.',
          ],
        },
      ],
      education: [
        {
          degree: 'B.E. Information Science and Engineering',
          institution: 'R.V. College of Engineering, Bengaluru',
          start_date: '2017-08',
          end_date: '2021-06',
          bullets: [
            'CGPA: 8.9/10. Coursework: Distributed Systems, Compilers, Database Internals, Computer Networks.',
            'Final-year project: peer-to-peer file index over libp2p in Go (won departmental best-project award).',
          ],
        },
      ],
      projects: [
        {
          name: 'k8s-cron-guard',
          link: 'https://github.com/aaravmehta-synth/k8s-cron-guard',
          bullets: [
            'Open-source Kubernetes controller in Go that prevents overlapping CronJob runs by holding a Lease object; ~190 GitHub stars.',
            'Used in production by 3 teams at CRED to gate idempotency-sensitive batch jobs.',
          ],
        },
        {
          name: 'pg-stat-explorer',
          link: 'https://github.com/aaravmehta-synth/pg-stat-explorer',
          bullets: [
            'CLI tool that diffs pg_stat_statements snapshots and ranks regressed queries by total_exec_time delta.',
            'Wrote a 4,000-word blog post; reached #2 on r/PostgreSQL for 3 days.',
          ],
        },
      ],
      skills: [
        {
          category: 'Languages',
          items: ['Java', 'Python', 'Go', 'TypeScript', 'SQL'],
        },
        {
          category: 'Backend & Infra',
          items: [
            'Spring Boot',
            'FastAPI',
            'Kafka',
            'Postgres',
            'Redis',
            'DynamoDB',
            'Flink',
            'Kubernetes',
            'AWS (Lambda, SQS, ECS, RDS)',
          ],
        },
        {
          category: 'Observability & Tooling',
          items: ['OpenTelemetry', 'Grafana', 'Prometheus', 'Datadog', 'Sentry'],
        },
        {
          category: 'Practices',
          items: [
            'System design',
            'Incident response',
            'Code review',
            'On-call rotations',
            'Mentoring',
          ],
        },
      ],
      certifications: ['AWS Certified Solutions Architect — Associate (2022)'],
    },
  },

  // ---------------------------------------------------------------------------
  // User B — Senior AI/ML Engineer, SF Bay Area, 7y, RAG / LLM agent work.
  // ---------------------------------------------------------------------------
  {
    user_key: 'b',
    email: 'synth-b@findmejob.test',
    target_role_family: 'ai_ml_engineer',
    target_seniority: 'senior',
    target_location: 'San Francisco Bay Area',
    resume_json: {
      contact: {
        name: 'Priya Raman',
        email: 'priya.raman.synth@findmejob.test',
        phone: '+1 (415) 555-0143',
        location: 'San Francisco, CA, USA',
        links: [
          { label: 'GitHub', url: 'https://github.com/priyaraman-synth' },
          { label: 'Google Scholar', url: 'https://scholar.google.com/priya-raman' },
          { label: 'Personal site', url: 'https://priyaraman.dev' },
        ],
      },
      summary:
        'Senior ML engineer with 7 years across NLP and applied LLM systems. Two first-author papers in EMNLP/NAACL on retrieval-augmented generation. Currently shipping production agents at a Series-C AI startup: tool-calling orchestration, eval harness design, and post-training data curation. Looking for senior/staff IC roles owning an LLM product surface end-to-end.',
      experience: [
        {
          title: 'Senior ML Engineer, Agents',
          company: 'Sierra AI',
          location: 'San Francisco, CA',
          start_date: '2024-02',
          end_date: null,
          bullets: [
            'Tech lead on the customer-support agent for two enterprise design partners; raised verified-resolution rate from 41% to 67% via a structured-output JSON enforcement layer + targeted SFT on 8k curated traces.',
            'Designed the eval harness used across the team: 14 task suites, deterministic replay, per-tool error taxonomy. Now runs in CI on every model-update PR.',
            'Wrote post-training data pipeline that auto-mines failed traces, dedupes near-duplicates with MinHash, and routes them to human raters; reduced rater throughput cost by 3.2x.',
            'Mentored 3 engineers; ran the org\'s "agents reading group" (12 attendees, biweekly).',
          ],
        },
        {
          title: 'ML Engineer → Senior ML Engineer',
          company: 'Scale AI',
          location: 'San Francisco, CA',
          start_date: '2021-06',
          end_date: '2024-01',
          bullets: [
            'Owned the embedding-search service powering data curation tools (FAISS + custom rerankers); served 200M queries/month at p95 18ms.',
            'Built and shipped first internal RAG system over 14M annotation guidelines; halved time-to-first-correct-answer for new raters from 9 days to 4.',
            'Co-authored 1 EMNLP paper on contrastive reranking for noisy human-labeled data.',
            'Drove migration of 4 production retrieval pipelines from BM25 to a hybrid dense+sparse setup; +12pp recall@10 on held-out QA set.',
          ],
        },
        {
          title: 'Research Engineer',
          company: 'Allen Institute for AI (AI2)',
          location: 'Seattle, WA',
          start_date: '2019-08',
          end_date: '2021-05',
          bullets: [
            'NAACL 2021 first-author paper on long-document QA via hierarchical retrieval (cited 110+ times).',
            'Released open-source eval suite for retrieval-augmented QA; adopted by 2 follow-up benchmarks.',
            'Built the team\'s first GPU-cluster scheduling helpers in Python + Slurm wrappers.',
          ],
        },
      ],
      education: [
        {
          degree: 'M.S. Computer Science (NLP focus)',
          institution: 'Carnegie Mellon University',
          start_date: '2017-08',
          end_date: '2019-05',
          bullets: ['Advisor: Prof. Graham Neubig. Thesis on cross-lingual transfer for low-resource QA.'],
        },
        {
          degree: 'B.Tech Computer Science',
          institution: 'IIT Madras',
          start_date: '2013-07',
          end_date: '2017-05',
          bullets: ['Institute Silver Medal; CGPA 9.41/10.'],
        },
      ],
      projects: [
        {
          name: 'rag-eval-mini',
          link: 'https://github.com/priyaraman-synth/rag-eval-mini',
          bullets: [
            '450-star open-source toolkit for evaluating RAG systems on faithfulness, answer-completeness, and citation accuracy.',
            'Used in 3 published papers (cited in their methodology sections).',
          ],
        },
        {
          name: 'tool-trace-explorer',
          link: 'https://github.com/priyaraman-synth/tool-trace-explorer',
          bullets: [
            'Web UI for browsing tool-calling agent traces; supports diffing two model versions on identical inputs.',
            'Internal-first, open-sourced after company approval; ~120 stars.',
          ],
        },
      ],
      skills: [
        {
          category: 'ML & NLP',
          items: [
            'PyTorch',
            'Transformers (HF)',
            'LLM fine-tuning (LoRA, QLoRA)',
            'RAG / retrieval',
            'Reranking',
            'Eval design',
            'Tool-calling agents',
          ],
        },
        {
          category: 'Languages',
          items: ['Python', 'TypeScript', 'CUDA (basics)', 'SQL'],
        },
        {
          category: 'Infra',
          items: [
            'Ray',
            'Modal',
            'AWS (S3, EC2 GPU, Bedrock)',
            'GCP Vertex AI',
            'Kubernetes',
            'Weights & Biases',
            'FAISS',
            'Pinecone',
          ],
        },
        {
          category: 'Practices',
          items: [
            'Tech leadership',
            'Paper writing',
            'Hiring panels',
            'Cross-team roadmapping',
          ],
        },
      ],
      certifications: [],
    },
  },

  // ---------------------------------------------------------------------------
  // User C — Junior Product Designer, Mumbai, 1y exp, light portfolio.
  // ---------------------------------------------------------------------------
  {
    user_key: 'c',
    email: 'synth-c@findmejob.test',
    target_role_family: 'design',
    target_seniority: 'entry',
    target_location: 'Mumbai',
    resume_json: {
      contact: {
        name: 'Riya Shah',
        email: 'riya.shah.synth@findmejob.test',
        phone: '+91 98200 55512',
        location: 'Mumbai, Maharashtra, India',
        links: [
          { label: 'Portfolio', url: 'https://riyashah.design' },
          { label: 'LinkedIn', url: 'https://linkedin.com/in/riyashah-synth' },
          { label: 'Behance', url: 'https://behance.net/riyashah-synth' },
        ],
      },
      summary:
        'Junior product designer with one year of internship-to-FT experience at a small Mumbai-based EdTech startup. Comfortable in Figma, basic design-system maintenance, and running unmoderated user tests. Looking for an entry-level product designer role at a place with senior designers I can learn from.',
      experience: [
        {
          title: 'Product Designer (FT, post-internship conversion)',
          company: 'StudyNest',
          location: 'Mumbai, India',
          start_date: '2025-04',
          end_date: null,
          bullets: [
            'Sole designer on the parent-app team; redesigned the weekly progress report screen, lifting parent open-rate on the linked email from 28% to 41% in A/B test (n=4,200 households).',
            'Maintained the team\'s component library in Figma (52 components); wrote the first internal "how to file a design-system change" doc.',
            'Ran 8 unmoderated UserTesting.com sessions on a new onboarding flow; surfaced 4 unique blockers, 3 of which made it into the next sprint.',
          ],
        },
        {
          title: 'Product Design Intern',
          company: 'StudyNest',
          location: 'Mumbai, India',
          start_date: '2024-06',
          end_date: '2025-03',
          bullets: [
            'Shipped 6 small-to-medium feature designs (mostly student-side homework flows) across the 9-month internship.',
            'Pair-designed weekly with the senior designer; got hands-on critique sessions on visual hierarchy and content design.',
            'Built and presented a side-project "design-debt audit" of the marketing site (~20 issues, 12 fixed).',
          ],
        },
      ],
      education: [
        {
          degree: 'B.Des Communication Design',
          institution: 'MIT Institute of Design, Pune',
          start_date: '2020-08',
          end_date: '2024-05',
          bullets: [
            'CGPA: 8.2/10. Capstone: redesign of a regional-language news app for low-bandwidth users.',
          ],
        },
      ],
      projects: [
        {
          name: 'Daily-Tide (concept)',
          link: 'https://riyashah.design/daily-tide',
          bullets: [
            'Concept iOS app for tracking ocean-tide-aware fishing windows for small-scale fishermen on the Konkan coast.',
            'Field-interviewed 4 fishermen in Ratnagiri; documented research-to-shipping flow on portfolio.',
          ],
        },
      ],
      skills: [
        {
          category: 'Tools',
          items: ['Figma', 'FigJam', 'Notion', 'Maze', 'UserTesting.com'],
        },
        {
          category: 'Craft',
          items: [
            'Wireframing',
            'Design systems (basic)',
            'Usability testing',
            'Content design (basic)',
            'Prototyping',
          ],
        },
        {
          category: 'Domain exposure',
          items: ['EdTech', 'Mobile (iOS + Android consumer apps)'],
        },
      ],
      certifications: ['Coursera — Google UX Design Professional Certificate (2023)'],
    },
  },

  // ---------------------------------------------------------------------------
  // User D — Entry-level Data Analyst, Bangalore, ~1y at a small Indian fintech.
  // Light portfolio, tier-2 BTech CS, deliberately not over-polished.
  // ---------------------------------------------------------------------------
  {
    user_key: 'd',
    email: 'synth-d@findmejob.test',
    target_role_family: 'data_ml',
    target_seniority: 'entry',
    target_location: 'Bangalore',
    resume_json: {
      contact: {
        name: 'Karthik Reddy',
        email: 'karthik.reddy.synth@findmejob.test',
        phone: '+91 99012 34567',
        location: 'Bangalore, Karnataka, India',
        links: [
          { label: 'LinkedIn', url: 'https://linkedin.com/in/karthikreddy-synth' },
          { label: 'GitHub', url: 'https://github.com/karthikreddy-synth' },
        ],
      },
      summary:
        'Entry-level data analyst with about a year of experience at a small Bangalore fintech, comfortable with SQL, Python (pandas), and Tableau. Looking for a junior data analyst role on a team with senior analysts I can learn from. Open to BI / product analytics tracks.',
      experience: [
        {
          title: 'Junior Data Analyst',
          company: 'Paywise (small Indian fintech, ~40 people)',
          location: 'Bangalore, India',
          start_date: '2025-07',
          end_date: null,
          bullets: [
            'Owned the weekly sales-ops dashboard in Tableau (8 charts, 4 stakeholders); cut report-prep time from ~3 hours every Monday to ~20 minutes by replacing CSV exports with a Postgres view + scheduled refresh.',
            'Wrote ~30 SQL queries against the production Postgres replica for ad-hoc questions from the sales and ops teams; documented the 8 most-asked queries in a shared Notion page.',
            'Built a basic monthly cohort retention chart in Python (pandas + matplotlib) for the founder; surfaced a retention dip in the ICICI-onboarded cohort that led to a small UX fix.',
          ],
        },
        {
          title: 'Data Analyst Intern',
          company: 'Paywise',
          location: 'Bangalore, India',
          start_date: '2024-12',
          end_date: '2025-06',
          bullets: [
            'Cleaned and joined ~6 months of payments + support-ticket data in Python (pandas); produced a one-pager on top 3 friction points in the refund flow.',
            'Helped the senior analyst migrate 4 Excel-based reports to Google Sheets with IMPORTRANGE + QUERY; reduced manual copy-paste errors flagged in weekly standups.',
            'Sat in on 6 sales-ops calls to understand what numbers the team actually used; rewrote the dashboard column labels based on that feedback.',
          ],
        },
      ],
      education: [
        {
          degree: 'B.Tech Computer Science and Engineering',
          institution: 'Reva University, Bangalore',
          start_date: '2020-08',
          end_date: '2024-06',
          bullets: [
            'CGPA: 7.4/10. Coursework: DBMS, Data Structures, Statistics for Engineers, Intro to Machine Learning.',
            'Final-year project: customer churn prediction on a public telecom dataset (logistic regression + random forest) — 81% accuracy on held-out set.',
          ],
        },
      ],
      projects: [
        {
          name: 'Sales-ops Tableau dashboard (work, anonymized writeup)',
          link: 'https://github.com/karthikreddy-synth/salesops-dashboard-writeup',
          bullets: [
            'CSV-driven Tableau dashboard for the sales-ops team at Paywise (anonymized writeup of the production version).',
            'Documents the 5 charts, the underlying SQL, and the 2 iterations after stakeholder feedback.',
          ],
        },
        {
          name: 'College churn-prediction notebook',
          link: 'https://github.com/karthikreddy-synth/telecom-churn-mini',
          bullets: [
            'Final-year project notebook: pandas EDA + sklearn logistic regression and random forest on a public telecom churn dataset.',
            'Walks through feature engineering (tenure buckets, contract type one-hot) and a simple ROC comparison.',
          ],
        },
      ],
      skills: [
        {
          category: 'Languages & query',
          items: ['SQL (Postgres)', 'Python', 'Excel / Google Sheets formulas'],
        },
        {
          category: 'Libraries & tools',
          items: ['pandas', 'NumPy', 'matplotlib', 'scikit-learn (basic)', 'Tableau', 'Looker Studio (basic)'],
        },
        {
          category: 'Stats & analytics',
          items: [
            'Descriptive statistics',
            'Cohort analysis (basic)',
            'A/B test reading (basic)',
            'Funnel analysis',
          ],
        },
        {
          category: 'Domain exposure',
          items: ['Indian fintech (payments + onboarding)', 'Sales-ops reporting'],
        },
      ],
      certifications: ['Coursera — Google Data Analytics Professional Certificate (2024)'],
    },
  },
];
