import { config } from 'dotenv';
import { resolve } from 'path';

// Load Vercel-pulled production envs (Anthropic + OpenAI + Supabase service role).
config({ path: resolve(process.cwd(), '.env.synth') });
// Also overlay .env.local in case it has dev overrides.
config({ path: resolve(process.cwd(), '.env.local'), override: false });

import { createClient } from '@supabase/supabase-js';
import { SYNTH_PROFILES } from './profiles';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      `Missing env: NEXT_PUBLIC_SUPABASE_URL=${!!url}, SUPABASE_SERVICE_ROLE_KEY=${!!key}. Did you run 'vercel env pull --environment=production .env.synth'?`,
    );
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const p of SYNTH_PROFILES) {
    // Idempotent: remove pre-existing user with same email.
    const { data: existing, error: listErr } =
      await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) throw new Error(`listUsers failed: ${listErr.message}`);

    const found = existing.users.find((u) => u.email === p.email);
    if (found) {
      console.log(`[seed] removing existing ${p.email} (${found.id})`);
      const { error: delErr } = await admin.auth.admin.deleteUser(found.id);
      if (delErr) {
        console.warn(`[seed] deleteUser warning: ${delErr.message}`);
      }
    }

    // Create user (email_confirm so we can use them immediately).
    const { data, error } = await admin.auth.admin.createUser({
      email: p.email,
      password: 'synth-password-2026',
      email_confirm: true,
      user_metadata: { synth: true, user_key: p.user_key },
    });
    if (error || !data.user) {
      throw new Error(`createUser failed for ${p.email}: ${error?.message}`);
    }
    console.log(`[seed] created ${p.email} -> ${data.user.id}`);

    // The handle_new_user trigger should auto-create the profile row. Upsert
    // the row to populate the synth fields (idempotent either way).
    const profileRow = {
      id: data.user.id,
      target_role_family: p.target_role_family,
      target_seniority: p.target_seniority,
      target_location: p.target_location,
      resume_json: p.resume_json,
      raw_resume_text: JSON.stringify(p.resume_json),
      linkedin_paste: null,
      portfolio_urls: [],
    };
    const { error: upErr } = await admin
      .from('profiles')
      .upsert(profileRow, { onConflict: 'id' });
    if (upErr) {
      throw new Error(`profile upsert failed for ${p.email}: ${upErr.message}`);
    }
    console.log(`[seed] profile populated for ${p.email}`);
  }

  console.log('[seed] done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
