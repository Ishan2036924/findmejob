import 'server-only';
import { MOCK_JOBS, type RawJob } from './mock-jobs';
import { inferRegion, type JobRegion } from './region';

const JSEARCH_HOST = 'jsearch.p.rapidapi.com';

type JSearchHit = {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city?: string | null;
  job_country?: string | null;
  job_description: string;
  job_apply_link?: string | null;
  job_posted_at_datetime_utc?: string | null;
};

/**
 * Fetch jobs from JSearch (RapidAPI) for the given query + location.
 * Falls back to MOCK_JOBS when JSEARCH_API_KEY is unset — useful for dev,
 * for early beta, and as a safety net if the upstream is down.
 *
 * Wire to live JSearch by setting JSEARCH_API_KEY in Vercel envs (Free tier
 * on RapidAPI is 50 req/day — enough for daily ingestion).
 */
/** Best-effort inference of the JSearch query's intended region. */
function regionHintFromQuery(query: string): JobRegion | undefined {
  const q = query.toLowerCase();
  if (q.includes('india')) return 'india';
  if (q.includes('united states') || q.includes(' usa') || q.includes(' us ')) return 'us';
  return undefined;
}

/** Map a JSearch query to the country code we send to RapidAPI. */
function countryCodeFromQuery(query: string): string {
  const hint = regionHintFromQuery(query);
  if (hint === 'us') return 'us';
  return 'in';
}

export async function fetchJobs(opts: {
  query: string; // e.g. "data scientist india"
  numPages?: number;
  regionHint?: JobRegion;
}): Promise<RawJob[]> {
  const apiKey = process.env.JSEARCH_API_KEY;
  const hint = opts.regionHint ?? regionHintFromQuery(opts.query);
  if (!apiKey) {
    // MOCK_JOBS already have region tags; return as-is.
    return MOCK_JOBS;
  }

  const url = new URL(`https://${JSEARCH_HOST}/search`);
  url.searchParams.set('query', opts.query);
  url.searchParams.set('country', countryCodeFromQuery(opts.query));
  url.searchParams.set('page', '1');
  url.searchParams.set('num_pages', String(opts.numPages ?? 1));

  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': JSEARCH_HOST,
    },
    // JSearch responses are stable for the day; cache 1h.
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error('[jsearch] fetch failed', { status: res.status, query: opts.query });
    return MOCK_JOBS;
  }

  const json = (await res.json()) as { data?: JSearchHit[] };
  return (json.data ?? []).map((hit) => transform(hit, hint));
}

function transform(hit: JSearchHit, regionHint?: JobRegion): RawJob {
  const location =
    [hit.job_city, hit.job_country].filter(Boolean).join(', ') ||
    (regionHint === 'us' ? 'United States' : 'India');
  return {
    source: 'jsearch',
    source_id: hit.job_id,
    source_url: hit.job_apply_link ?? '',
    title: hit.job_title,
    company: hit.employer_name,
    location,
    description: hit.job_description,
    posted_at: hit.job_posted_at_datetime_utc ?? new Date().toISOString(),
    region: inferRegion(location, regionHint),
  };
}
