import 'server-only';
import type { RawJob } from '../mock-jobs';
import { stripHtml } from '../strip-html';
import { inferRegion, type JobRegion } from '../region';

type GreenhouseJob = {
  id: number;
  title: string;
  content?: string;
  absolute_url: string;
  location?: { name: string };
  updated_at: string;
};

const FETCH_TIMEOUT_MS = 12_000;

/**
 * Fetch jobs from a company's public Greenhouse board.
 * Endpoint: https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true
 * Public, no auth, free.
 */
export async function fetchGreenhouseJobs(
  slug: string,
  companyName: string,
  hqRegion?: JobRegion,
): Promise<RawJob[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) {
      console.error('[greenhouse] fetch failed', { slug, status: res.status });
      return [];
    }
    const json = (await res.json()) as { jobs?: GreenhouseJob[] };
    return (json.jobs ?? []).map((j) => {
      const location = j.location?.name ?? 'Unknown';
      return {
        source: 'greenhouse' as const,
        source_id: String(j.id),
        source_url: j.absolute_url,
        title: j.title,
        company: companyName,
        location,
        description: j.content ? stripHtml(j.content) : '',
        posted_at: j.updated_at,
        region: inferRegion(location, hqRegion),
      };
    });
  } catch (err) {
    console.error('[greenhouse] threw', { slug, err: err instanceof Error ? err.message : err });
    return [];
  } finally {
    clearTimeout(timer);
  }
}
