'use client';

import { useTransition } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteMemory } from '@/lib/memory/actions';

export function DeleteMemoryButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          try {
            await deleteMemory(id);
            toast.success('Memory deleted');
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to delete');
          }
        })
      }
      disabled={pending}
      aria-label="Delete memory"
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
      ) : (
        <Trash2 className="size-3.5" strokeWidth={1.5} />
      )}
    </button>
  );
}
