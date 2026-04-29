import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client using the service-role key. Bypasses RLS.
 * Use sparingly — only for system-level writes (job ingest, match-score
 * inserts, generation status updates) where the calling server action
 * has already authenticated the user.
 *
 * NEVER call this from a Client Component or expose its return value to
 * the browser.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Required for admin Supabase operations.',
    );
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
