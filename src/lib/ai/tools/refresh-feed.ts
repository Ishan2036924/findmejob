import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
// TODO: Phase 1+2 may rename this to refreshFeedForCurrentUser. If so,
// update this import to that name.
import { refreshFeed } from '@/lib/jobs/actions';

export const refreshFeedTool = tool({
  description:
    'Refresh the user\'s job feed: ingest new postings (if stale) and run match scoring on unscored jobs. Heavily rate-limited (free tier: ~1/day). Only call when the user explicitly asks for new jobs.',
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const result = await refreshFeed();
      if (!result.ok) {
        return { error: result.error };
      }
      return { ingested: result.ingested, scored: result.scored };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
