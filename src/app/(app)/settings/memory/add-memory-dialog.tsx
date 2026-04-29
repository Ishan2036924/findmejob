'use client';

import { useState, useTransition } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { saveMemory } from '@/lib/memory/actions';
import type { MemoryKind } from '@/lib/memory/queries';

const KINDS: { value: MemoryKind; label: string; hint: string }[] = [
  {
    value: 'preference',
    label: 'Preference',
    hint: 'How you want the agent to behave (e.g. "be concise").',
  },
  {
    value: 'fact',
    label: 'Fact',
    hint: 'Stable info about you (e.g. "based in Bangalore").',
  },
  {
    value: 'history',
    label: 'History',
    hint: 'Things that happened (e.g. "interviewed at Stripe").',
  },
  {
    value: 'goal',
    label: 'Goal',
    hint: 'Where you want to go (e.g. "land an SRE role by Q3").',
  },
];

export function AddMemoryDialog() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<MemoryKind>('preference');
  const [content, setContent] = useState('');
  const [pending, startTransition] = useTransition();

  function submit() {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error('Memory content required.');
      return;
    }
    startTransition(async () => {
      try {
        await saveMemory({ kind, content: trimmed });
        toast.success('Memory saved');
        setOpen(false);
        setContent('');
        setKind('preference');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to save memory');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-2">
            <Plus className="size-3.5" strokeWidth={1.5} />
            Add memory
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add a memory</DialogTitle>
          <DialogDescription>
            Durable facts the agent will remember across every conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Kind
          </Label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as MemoryKind)}
            disabled={pending}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground/70">
            {KINDS.find((k) => k.value === kind)?.hint}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Label
            htmlFor="memory-content"
            className="text-xs uppercase tracking-wider text-muted-foreground"
          >
            Content
          </Label>
          <Textarea
            id="memory-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g. Prefer concise answers — bullets, not paragraphs."
            disabled={pending}
            className="min-h-24 resize-y text-sm leading-relaxed"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={pending}
            className="gap-2"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving
              </>
            ) : (
              'Save memory'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
