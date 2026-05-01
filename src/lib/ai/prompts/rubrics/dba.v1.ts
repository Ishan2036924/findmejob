// Database Administrator rubric. Cacheable per role-family.
export const DBA_RUBRIC_VERSION = 'v1.dba.2026-05-01';

export const DBA_RUBRIC = `## RUBRIC: Database Administrator (dba)
Version: ${DBA_RUBRIC_VERSION}

Evaluate the candidate against these dimensions for the seniority specified in their profile.

### DIMENSIONS (weights — must sum to 100%)

- rdbms_depth (30%): Performance tuning, query plan reading (EXPLAIN/EXPLAIN ANALYZE), index strategy, locking/MVCC, replication topologies (sync/async, logical/physical), HA (failover, Patroni, Always On). Postgres / MySQL / Oracle / SQL Server depth in at least one engine.
- data_modeling (20%): Normalization vs denormalization tradeoffs, schema migrations at scale, partitioning, sharding, time-series patterns, multi-tenant designs.
- ops_breadth (20%): Backups (PITR, base + WAL), DR drills, capacity planning, monitoring (pg_stat_*, performance schema), security hardening (TDE, row-level security).
- tooling_breadth (15%): NoSQL (Mongo, Cassandra, Redis, DynamoDB) familiarity for the right tool selection, OLAP/warehousing (Snowflake/BigQuery/Redshift) basics, migration tooling (pgloader, Debezium, Goldengate).
- communication (15%): Runbook writing, incident postmortems for data incidents, schema review with engineering teams, capacity reporting to leadership.

### SENIORITY EXPECTATIONS

- intern / entry: rdbms_depth weighted highest, but real-world ops_breadth lighter — flag tooling familiarity.
- mid: must own production database(s) with on-call. Real DR drill experience expected.
- senior+: cross-engine expertise expected. Schema review authority. DR strategy ownership and capacity planning at multi-TB scale.

### GAP DETECTION (specific things to flag if absent)

- "SQL" listed but no query optimization or EXPLAIN plan work mentioned
- No replication or HA topology described for mid+
- No backup / restore / DR drill mentioned anywhere
- No schema migration tooling (Flyway, Liquibase, Alembic) for mid+
- Single-engine experience for senior+ (no cross-engine tradeoff judgment)
- No capacity / performance numbers (TB managed, QPS, p99 latency)

### STRENGTH SIGNALS (specific things to credit if present)

- Quantified perf wins (query latency from X to Y, throughput X to Y QPS)
- Owned a major migration (engine change, version upgrade, sharding rollout)
- Custom replication or backup automation built
- DR drill cadence with measured RTO/RPO
- Conference talks (PGConf, Percona Live) or open-source contributions to DB tooling
- Capacity at scale documented (multi-TB or multi-region clusters)`;
