import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { getFeed } from '@/lib/jobs/queries';

export const listFeedJobsTool = tool({
  description:
    "List the user's current scored job feed. Returns top matches sorted by match_score. Use when the user asks 'what are my best matches' / 'show me the feed' / 'what jobs do you have for me'.",
  inputSchema: z.object({
    limit: z.number().nullable(),
    min_match_score: z.number().nullable(),
  }),
  execute: async (input) => {
    try {
      const feed = await getFeed();
      const cap = Math.min(25, Math.max(1, Math.round(input.limit ?? 10)));
      let jobs = feed.jobs;
      if (input.min_match_score !== null) {
        const threshold = input.min_match_score;
        jobs = jobs.filter((j) => (j.match?.score ?? 0) >= threshold);
      }
      jobs = jobs.slice(0, cap);

      return {
        ok: true,
        count: jobs.length,
        last_seen_at: feed.lastSeenAt,
        jobs: jobs.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location,
          source: j.source,
          source_url: j.source_url,
          match_score: j.match?.score ?? null,
          top_strength: j.match?.strengths?.[0] ?? null,
          top_gap: j.match?.gaps?.[0] ?? null,
          application_id: j.application_id,
        })),
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'feed query failed',
      };
    }
  },
});
