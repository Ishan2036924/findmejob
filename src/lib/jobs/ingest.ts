import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchJobs as fetchJSearchJobs } from './jsearch';
import { fetchGreenhouseJobs, fetchLeverJobs, fetchAshbyJobs } from './ats';
import { CURATED_COMPANIES } from './curated-companies';
import type { RawJob } from './mock-jobs';
import { inferRegion } from './region';
import { classifyRoleFamily } from '@/lib/ai/agents/role-family-classifier-agent';

const CLASSIFY_BATCH_SIZE = 8;

export type IngestResult = {
  totalFetched: number;
  totalUpserted: number;
  bySource: Record<string, number>;
  errors: { source: string; slug?: string; error: string }[];
  durationMs: number;
};

const ATS_BATCH_SIZE = 6; // parallel fetches per ATS group
const JSEARCH_DEFAULT_QUERIES = [
  'software engineer india',
  'data scientist india',
  'machine learning engineer united states',
  'software engineer united states',
];

/**
 * System-wide job ingest. Fetches from JSearch (if key set) + every curated
 * Greenhouse/Lever/Ashby company in parallel batches, then upserts to the
 * jobs table via service-role.
 *
 * Idempotent — safe to run multiple times. (source, source_id) is the conflict
 * key; on collision we update last_seen_at + the JD text in case it changed.
 *
 * Designed to be called by:
 *   - Daily Vercel cron at /api/cron/ingest-jobs
 *   - Future admin debug endpoint
 *   - Per-user refreshFeed() falls back to it (legacy)
 */
export async function ingestJobs(opts?: {
  jsearchQueries?: string[];
}): Promise<IngestResult> {
  const start = Date.now();
  const errors: IngestResult['errors'] = [];
  const allJobs: RawJob[] = [];

  // 1. JSearch (if API key)
  if (process.env.JSEARCH_API_KEY) {
    const queries = opts?.jsearchQueries ?? JSEARCH_DEFAULT_QUERIES;
    for (const query of queries) {
      try {
        const jobs = await fetchJSearchJobs({ query });
        allJobs.push(...jobs);
      } catch (err) {
        errors.push({ source: 'jsearch', error: err instanceof Error ? err.message : String(err) });
      }
    }
  }

  // 2. ATS endpoints (parallel batches per ATS)
  const greenhouse = CURATED_COMPANIES.filter((c) => c.ats === 'greenhouse');
  const lever = CURATED_COMPANIES.filter((c) => c.ats === 'lever');
  const ashby = CURATED_COMPANIES.filter((c) => c.ats === 'ashby');

  async function runBatch<T>(
    items: T[],
    fn: (item: T) => Promise<RawJob[]>,
    label: string,
  ) {
    for (let i = 0; i < items.length; i += ATS_BATCH_SIZE) {
      const batch = items.slice(i, i + ATS_BATCH_SIZE);
      const results = await Promise.allSettled(batch.map(fn));
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
          allJobs.push(...r.value);
        } else {
          const item = batch[idx] as { slug?: string };
          errors.push({
            source: label,
            slug: item.slug,
            error: r.reason instanceof Error ? r.reason.message : String(r.reason),
          });
        }
      });
    }
  }

  await runBatch(greenhouse, (c) => fetchGreenhouseJobs(c.slug, c.name, c.hq_region), 'greenhouse');
  await runBatch(lever, (c) => fetchLeverJobs(c.slug, c.name, c.hq_region), 'lever');
  await runBatch(ashby, (c) => fetchAshbyJobs(c.slug, c.name, c.hq_region), 'ashby');

  // 2.5 Classify role_family for each job before upsert. Mini call ~$0.0003/job.
  // Skips classification if already populated (e.g., future caller pre-filled).
  // Filtering at ingest means the feed + scorer can drop off-family jobs cheaply.
  const toClassify = allJobs.filter((j) => !j.role_family);
  if (toClassify.length > 0) {
    console.info('[ingest] classifying role_family for', toClassify.length, 'jobs');
    for (let i = 0; i < toClassify.length; i += CLASSIFY_BATCH_SIZE) {
      const batch = toClassify.slice(i, i + CLASSIFY_BATCH_SIZE);
      const results = await Promise.all(
        batch.map((j) =>
          classifyRoleFamily({
            title: j.title,
            company: j.company,
            description: j.description,
          })
            .then((r) => (r.output.confidence < 0.5 ? ('other' as const) : r.output.role_family))
            .catch(() => 'other' as const),
        ),
      );
      batch.forEach((j, idx) => {
        j.role_family = results[idx];
      });
    }
  }

  // 3. Upsert (service-role, bypasses RLS — jobs are public-read)
  let upserted = 0;
  if (allJobs.length > 0) {
    const admin = createAdminClient();
    const rows = allJobs.map((j) => ({
      source: j.source,
      source_id: j.source_id,
      source_url: j.source_url,
      title: j.title,
      company: j.company,
      location: j.location,
      description: j.description,
      posted_at: j.posted_at,
      // Belt + suspenders: every fetcher sets region, but if a future source
      // forgets we still infer at the upsert site rather than landing nulls.
      region: j.region ?? inferRegion(j.location),
      role_family: j.role_family ?? null,
      last_seen_at: new Date().toISOString(),
    }));
    const { error } = await admin
      .from('jobs')
      .upsert(rows, { onConflict: 'source,source_id', ignoreDuplicates: false });
    if (error) {
      errors.push({ source: 'db_upsert', error: error.message });
    } else {
      upserted = rows.length;
    }
  }

  const bySource: Record<string, number> = {};
  for (const j of allJobs) bySource[j.source] = (bySource[j.source] ?? 0) + 1;

  return {
    totalFetched: allJobs.length,
    totalUpserted: upserted,
    bySource,
    errors,
    durationMs: Date.now() - start,
  };
}
