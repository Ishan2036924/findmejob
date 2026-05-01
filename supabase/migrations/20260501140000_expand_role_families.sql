-- Add 9 new role family enum values to expand corporate coverage.
-- Existing values: swe, data_ml, product, design, devops, sales, marketing, ops, other.
-- Postgres requires each ADD VALUE in a separate statement; cannot wrap in
-- transaction. Each is idempotent via IF NOT EXISTS.

alter type role_family add value if not exists 'ai_ml_engineer';
alter type role_family add value if not exists 'dba';
alter type role_family add value if not exists 'security_engineer';
alter type role_family add value if not exists 'qa_engineer';
alter type role_family add value if not exists 'hr';
alter type role_family add value if not exists 'finance';
alter type role_family add value if not exists 'procurement';
alter type role_family add value if not exists 'supply_chain';
alter type role_family add value if not exists 'consulting';
