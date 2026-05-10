import { redirect } from 'next/navigation';
import { listMemories } from '@/lib/memory/queries';
import { getCurrentUserProfile } from '@/lib/profile/queries';
import { Badge } from '@/components/ui/badge';
import { AddMemoryDialog } from './add-memory-dialog';
import { DeleteMemoryButton } from './delete-memory-button';

export const metadata = { title: 'Memory · Settings · findmejob' };

const KIND_BADGE: Record<string, string> = {
  preference: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  fact: 'bg-zinc-400/10 text-zinc-300 border-zinc-400/30',
  history: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  goal: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
};

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400e3);
  if (days <= 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default async function MemoryPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect('/sign-in');

  const memories = await listMemories();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Agent memory
          </span>
          <h1 className="text-balance text-2xl font-semibold tracking-tight">
            What the agent remembers about you
          </h1>
          <p className="text-sm text-muted-foreground">
            Durable facts injected into every conversation. Your career agent
            uses these alongside your profile + application history.
          </p>
        </div>
        <AddMemoryDialog />
      </div>

      {memories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-card/30 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No memories yet. Tell the agent things like &quot;remember that I
            prefer concise answers&quot; and they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {memories.map((m) => (
            <li
              key={m.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-card/40 p-4 backdrop-blur"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                      KIND_BADGE[m.kind] ?? ''
                    }`}
                  >
                    {m.kind}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {m.source}
                  </Badge>
                  <span className="font-mono text-[10px] text-muted-foreground/70">
                    {relativeDate(m.created_at)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {m.content}
                </p>
                {m.context && (
                  <p className="text-xs text-muted-foreground/70 italic">
                    {m.context}
                  </p>
                )}
              </div>
              <DeleteMemoryButton id={m.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
