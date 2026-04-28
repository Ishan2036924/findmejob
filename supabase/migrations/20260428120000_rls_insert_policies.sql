-- =======================================================================
-- Add missing INSERT / UPDATE RLS policies for user-owned action tables.
-- Slice 1 schema migration only declared SELECT + DELETE; the server actions
-- that write to these tables (triggerAssessment, future requestTailor) need
-- INSERT permission gated by `auth.uid() = profile_id`.
-- =======================================================================

-- assessments: user can insert their own (server action gates the call).
create policy "assessments_insert_own" on assessments
  for insert with check (auth.uid() = profile_id);

-- generations: user can insert their own (request*) + update their own (status
-- transitions pending -> generating -> success/failed). RLS check on update
-- uses both USING (current row) and WITH CHECK (new row).
create policy "generations_insert_own" on generations
  for insert with check (auth.uid() = profile_id);

create policy "generations_update_own" on generations
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- match_scores stays service-role-only (Slice 5 will add a service-role client
-- for ingestion-time scoring). Not adding policies here.
