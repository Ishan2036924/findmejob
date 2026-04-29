import 'server-only';
import type { RawJob } from '../mock-jobs';
import { stripHtml } from '../strip-html';

type AshbyJob = {
  id: string;
  title: string;
  jobUrl: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
  locationName?: string;
  publishedAt?: string;
  updatedAt?: string;
};

const FETCH_TIMEOUT_MS = 12_000;

/**
 * Fetch jobs from a company's public Ashby job board.
 * Endpoint: https://api.ashbyhq.com/posting-api/job-board/{slug}
 * Public, no auth, free.
 */
export async function fetchAshbyJobs(
  slug: string,
  companyName: string,
): Promise<RawJob[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=false`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) {
      console.error('[ashby] fetch failed', { slug, status: res.status });
      return [];
    }
    const json = (await res.json()) as { jobs?: AshbyJob[] };
    return (json.jobs ?? []).map((j) => ({
      source: 'ashby' as const,
      source_id: j.id,
      source_url: j.jobUrl,
      title: j.title,
      company: companyName,
      location: j.locationName ?? 'Unknown',
      description: j.descriptionPlain ?? (j.descriptionHtml ? stripHtml(j.descriptionHtml) : ''),
      posted_at: j.publishedAt ?? j.updatedAt ?? new Date().toISOString(),
    }));
  } catch (err) {
    console.error('[ashby] threw', { slug, err: err instanceof Error ? err.message : err });
    return [];
  } finally {
    clearTimeout(timer);
  }
}
