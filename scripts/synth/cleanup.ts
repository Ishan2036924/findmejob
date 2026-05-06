import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.synth') });
config({ path: resolve(process.cwd(), '.env.local'), override: false });

import { createClient } from '@supabase/supabase-js';
import { SYNTH_PROFILES } from './profiles';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  for (const p of SYNTH_PROFILES) {
    const found = existing?.users.find((u) => u.email === p.email);
    if (found) {
      console.log(`[cleanup] deleting ${p.email} (${found.id})`);
      const { error } = await admin.auth.admin.deleteUser(found.id);
      if (error) console.warn(`[cleanup] ${p.email}: ${error.message}`);
    } else {
      console.log(`[cleanup] no user found for ${p.email}`);
    }
  }

  console.log('[cleanup] done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
