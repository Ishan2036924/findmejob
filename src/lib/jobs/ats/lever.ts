import 'server-only';
import type { RawJob } from '../mock-jobs';
import { inferRegion, type JobRegion } from '../region';

type LeverJob = {
  id: string;
  text: string; // job title
  hostedUrl: string;
  categories?: {
    commitment?: string;
    location?: string;
    team?: string;
    department?: string;
  };
  descriptionPlain?: string;
  description?: string;
  additionalPlain?: string;
  additional?: string;
  createdAt?: number; // ms timestamp
};

const FETCH_TIMEOUT_MS = 12_000;

/**
 * Fetch jobs from a company's public Lever postings endpoint.
 * Endpoint: https://api.lever.co/v0/postings/{slug}?mode=json
 * Public, no auth, free.
 */
export async function fetchLeverJobs(
  slug: string,
  companyName: string,
  hqRegion?: JobRegion,
): Promise<RawJob[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error('[lever] fetch failed', { slug, status: res.status });
      return [];
    }
    const json = (await res.json()) as LeverJob[];
    return (json ?? []).map((j) => {
      const description = [j.descriptionPlain ?? j.description ?? '', j.additionalPlain ?? j.additional ?? '']
        .filter(Boolean)
        .join('\n\n');
      const created = j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString();
      const location = j.categories?.location ?? 'Unknown';
      return {
        source: 'lever' as const,
        source_id: j.id,
        source_url: j.hostedUrl,
        title: j.text,
        company: companyName,
        location,
        description,
        posted_at: created,
        region: inferRegion(location, hqRegion),
      };
    });
  } catch (err) {
    console.error('[lever] threw', { slug, err: err instanceof Error ? err.message : err });
    return [];
  } finally {
    clearTimeout(timer);
  }
}
