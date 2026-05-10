import 'server-only';

type ChatMsg = {
  thread_id: string;
  profile_id: string;
  role: 'user' | 'assistant' | 'tool';
  created_at: string;
};

/**
 * For each thread, pair consecutive user → assistant messages and compute the
 * delta in ms. Returns median + p95 across all pairs in the input.
 *
 * Order assumption: input is sorted by (thread_id, created_at asc). If not, we sort first.
 */
export function deriveChatLatencies(messages: ChatMsg[]): {
  count: number;
  median_ms: number;
  p95_ms: number;
} {
  const sorted = [...messages].sort((a, b) => {
    if (a.thread_id !== b.thread_id) return a.thread_id.localeCompare(b.thread_id);
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const deltas: number[] = [];
  let pendingUser: ChatMsg | null = null;
  let currentThread = '';

  for (const m of sorted) {
    if (m.thread_id !== currentThread) {
      currentThread = m.thread_id;
      pendingUser = null;
    }
    if (m.role === 'user') {
      pendingUser = m;
    } else if (m.role === 'assistant' && pendingUser) {
      const delta =
        new Date(m.created_at).getTime() - new Date(pendingUser.created_at).getTime();
      // ignore obvious stalls > 10min (likely overnight gaps, not real latency)
      if (delta > 0 && delta < 600_000) deltas.push(delta);
      pendingUser = null;
    }
  }

  if (deltas.length === 0) return { count: 0, median_ms: 0, p95_ms: 0 };
  deltas.sort((a, b) => a - b);
  const median = deltas[Math.floor(deltas.length / 2)];
  const p95 = deltas[Math.min(deltas.length - 1, Math.floor(deltas.length * 0.95))];
  return { count: deltas.length, median_ms: median, p95_ms: p95 };
}
