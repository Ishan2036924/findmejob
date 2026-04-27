import type { ModelMessage } from 'ai';

export type CacheTTL = '5m' | '1h';

/**
 * Mark a message as a prompt-cache breakpoint for Anthropic. Anthropic caches
 * everything up to and including the marked block. Up to 4 breakpoints per
 * request — order them from most stable (1h TTL) to least (5m TTL).
 *
 * For OpenAI / Gemini, this is a no-op — those providers handle caching
 * automatically based on prefix length.
 */
export function cached(message: ModelMessage, ttl: CacheTTL = '5m'): ModelMessage {
  const existing = (message as { providerOptions?: Record<string, unknown> }).providerOptions ?? {};
  const existingAnthropic = (existing.anthropic as Record<string, unknown> | undefined) ?? {};

  return {
    ...message,
    providerOptions: {
      ...existing,
      anthropic: {
        ...existingAnthropic,
        cacheControl: { type: 'ephemeral', ttl },
      },
    },
  } as ModelMessage;
}

/**
 * Extract Anthropic cache hit/miss stats from the providerMetadata returned by
 * generateText / generateObject. Returns 0 for both if not Anthropic / not
 * present. Use this to log effective cache hit rate per call.
 */
export function extractCacheStats(providerMetadata: unknown): {
  cacheReadTokens: number;
  cacheWriteTokens: number;
} {
  const meta = providerMetadata as { anthropic?: Record<string, unknown> } | undefined;
  const anthropic = meta?.anthropic ?? {};
  return {
    cacheReadTokens: Number(anthropic.cacheReadInputTokens ?? 0),
    cacheWriteTokens: Number(anthropic.cacheCreationInputTokens ?? 0),
  };
}
