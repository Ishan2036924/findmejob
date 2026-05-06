// Region inference for job postings + user target locations.
//
// Used at ingest time (every fetcher tags jobs.region) and at read time
// (feed query + per-user scorer filter to user's region ∪ 'remote').
//
// Heuristic-only: word-boundary regex against the location string. Falls
// back to a hint (company HQ region or JSearch query region) when location
// text is empty or unclassifiable. SQL backfill in
// supabase/migrations/20260506120000_jobs_region.sql mirrors these patterns.

export type JobRegion = 'india' | 'us' | 'remote' | 'other';

const INDIA_PATTERNS: RegExp[] = [
  /\bdelhi\b/i, /\bncr\b/i, /\bgurgaon\b/i, /\bgurugram\b/i, /\bnoida\b/i, /\bfaridabad\b/i, /\bghaziabad\b/i,
  /\bmumbai\b/i, /\bbombay\b/i, /\bpune\b/i, /\bbengaluru\b/i, /\bbangalore\b/i, /\bhyderabad\b/i,
  /\bchennai\b/i, /\bkolkata\b/i, /\bahmedabad\b/i, /\bjaipur\b/i, /\bkochi\b/i, /\bcoimbatore\b/i,
  /,\s*india\b/i, /^india\b/i, /\bindia$/i,
];

const US_PATTERNS: RegExp[] = [
  /\bsan francisco\b/i, /\bbay area\b/i, /\bnew york\b/i, /\bnyc\b/i, /\bboston\b/i, /\bseattle\b/i,
  /\baustin\b/i, /\bchicago\b/i, /\blos angeles\b/i, /\bdenver\b/i, /\batlanta\b/i, /\bwashington\b/i,
  /\bportland\b/i, /\bminneapolis\b/i, /\bdallas\b/i, /\bhouston\b/i, /\bphiladelphia\b/i, /\bmiami\b/i,
  /,\s*(?:ca|ny|tx|ma|wa|il|co|ga|or|mn|fl|pa|nc|va|nj)\b/i,
  /\bunited states\b/i, /,\s*us(?:a)?\b/i,
];

const REMOTE_PATTERNS: RegExp[] = [/\bremote\b/i, /\banywhere\b/i, /\bworldwide\b/i];

/**
 * Classify a job posting's location into a region enum.
 * `hqRegionFallback` lets ATS fetchers default unclassifiable rows to the
 * company's HQ region, and JSearch use the query country as a hint.
 */
export function inferRegion(location: string | null | undefined, hqRegionFallback?: JobRegion): JobRegion {
  const text = (location ?? '').trim();
  if (!text) return hqRegionFallback ?? 'remote';
  if (REMOTE_PATTERNS.some((r) => r.test(text))) return 'remote';
  if (INDIA_PATTERNS.some((r) => r.test(text))) return 'india';
  if (US_PATTERNS.some((r) => r.test(text))) return 'us';
  return hqRegionFallback ?? 'other';
}

/**
 * Resolve a profile's `target_location` to a region for filtering the feed.
 * "Remote" alone is too generic to gate on (the user is open to anything),
 * so we degrade it to 'other' which means "no region filter".
 */
export function userRegion(targetLocation: string | null | undefined): JobRegion {
  if (!targetLocation) return 'other';
  const r = inferRegion(targetLocation);
  if (r === 'remote') return 'other';
  return r;
}
