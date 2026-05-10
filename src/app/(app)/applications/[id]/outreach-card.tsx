'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ChevronDown,
  Copy,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateOutreach } from '@/lib/artifacts/actions';
import type { OutreachOutput } from '@/lib/ai/schemas/outreach';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Props = {
  applicationId: string;
  initialOutput: OutreachOutput | null;
};

const TABS: Array<{
  key: 'recruiter' | 'hiring_manager' | 'referral';
  label: string;
}> = [
  { key: 'recruiter', label: 'Recruiter' },
  { key: 'hiring_manager', label: 'Hiring Mgr' },
  { key: 'referral', label: 'Referral' },
];

export function OutreachCard({ applicationId, initialOutput }: Props) {
  const router = useRouter();
  const output = initialOutput;
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function fire() {
    startTransition(async () => {
      const result = await generateOutreach(applicationId);
      if (!result.ok) {
        toast.error(result.message ?? result.error);
        return;
      }
      router.refresh();
      toast.success('Outreach drafts ready');
      setExpanded(true);
    });
  }

  async function copyDraft(
    key: 'recruiter' | 'hiring_manager' | 'referral',
    text: string,
  ) {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  }

  const ready = !!output;

  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-xl border bg-card/40 p-4 backdrop-blur transition-all',
        ready
          ? 'border-emerald-400/20 bg-emerald-400/[0.03]'
          : 'border-white/10 hover:border-white/20',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <Send className="size-3.5 text-foreground/80" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium tracking-tight">Outreach drafts</h3>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            Recruiter, hiring manager, referral.
          </p>
        </div>
      </div>

      {!ready && (
        <button
          type="button"
          disabled={pending}
          onClick={fire}
          className={cn(
            'mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            pending
              ? 'border-white/10 bg-white/5 text-muted-foreground'
              : 'border-foreground/30 bg-foreground/10 text-foreground hover:bg-foreground/20',
          )}
        >
          {pending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> Generating
            </>
          ) : (
            <>
              <Sparkles className="size-3.5" strokeWidth={1.5} /> Generate
            </>
          )}
        </button>
      )}

      {ready && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-background/40 px-2.5 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            aria-expanded={expanded}
          >
            <span className="line-clamp-1 italic">{output.meta_summary}</span>
            <ChevronDown
              className={cn('size-3.5 shrink-0 transition-transform', expanded && 'rotate-180')}
              strokeWidth={1.5}
            />
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <Tabs defaultValue="recruiter" className="rounded-lg border border-white/10 bg-background/40 p-3">
                  <TabsList className="grid w-full grid-cols-3">
                    {TABS.map((t) => (
                      <TabsTrigger key={t.key} value={t.key} className="text-xs">
                        {t.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {TABS.map((t) => {
                    const draft = output[t.key];
                    const fullText = `Subject: ${draft.subject}\n\n${draft.body}`;
                    return (
                      <TabsContent key={t.key} value={t.key} className="mt-3 flex flex-col gap-2">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Subject</p>
                          <p className="font-mono text-[10px] text-muted-foreground/60">~{draft.length_words}w</p>
                        </div>
                        <p className="rounded border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium">
                          {draft.subject}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Body</p>
                        <pre className="whitespace-pre-wrap rounded border border-white/10 bg-white/5 px-2.5 py-1.5 font-sans text-xs leading-relaxed text-foreground/90">
                          {draft.body}
                        </pre>
                        <button
                          type="button"
                          onClick={() => copyDraft(t.key, fullText)}
                          className="inline-flex items-center gap-1.5 self-start rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-foreground transition-colors hover:bg-white/10"
                        >
                          {copiedKey === t.key ? (
                            <>
                              <Check className="size-3" strokeWidth={2} /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" strokeWidth={1.5} /> Copy
                            </>
                          )}
                        </button>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            disabled={pending}
            onClick={fire}
            className="inline-flex items-center gap-1.5 self-start rounded-md px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {pending ? (
              <>
                <Loader2 className="size-3 animate-spin" /> Regenerating
              </>
            ) : (
              <>
                <RefreshCw className="size-3" strokeWidth={1.5} /> Regenerate
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
