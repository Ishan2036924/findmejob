import 'server-only';
import { MOCK_JOBS, type RawJob } from './mock-jobs';

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
export async function fetchJobs(opts: {
  query: string; // e.g. "data scientist india"
  numPages?: number;
}): Promise<RawJob[]> {
  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) {
    return MOCK_JOBS;
  }

  const url = new URL(`https://${JSEARCH_HOST}/search`);
  url.searchParams.set('query', opts.query);
  url.searchParams.set('country', 'in');
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
  return (json.data ?? []).map(transform);
}

function transform(hit: JSearchHit): RawJob {
  const location = [hit.job_city, hit.job_country].filter(Boolean).join(', ') || 'India';
  return {
    source: 'jsearch',
    source_id: hit.job_id,
    source_url: hit.job_apply_link ?? '',
    title: hit.job_title,
    company: hit.employer_name,
    location,
    description: hit.job_description,
    posted_at: hit.job_posted_at_datetime_utc ?? new Date().toISOString(),
  };
}
