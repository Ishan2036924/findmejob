'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Loader2, RefreshCw, Send, Sparkles } from 'lucide-react';
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
        toast.error(result.error);
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

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-card/40 p-5 backdrop-blur transition-all',
        output
          ? 'border-emerald-400/20 bg-emerald-400/[0.03]'
          : 'border-white/10 hover:border-white/20',
        expanded && 'sm:col-span-2 lg:col-span-3',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <Send className="size-4 text-foreground/80" strokeWidth={1.5} />
        </div>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider',
            output
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300/90'
              : 'border-white/10 bg-white/5 text-muted-foreground',
          )}
        >
          {output ? '3 ready' : 'On demand'}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-medium tracking-tight">Outreach drafts</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Three short messages: recruiter, hiring manager, referral. Edit + paste.
        </p>
      </div>

      {!output && (
        <button
          type="button"
          disabled={pending}
          onClick={fire}
          className={cn(
            'mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            pending
              ? 'border-white/10 bg-white/5 text-muted-foreground'
              : 'border-foreground/30 bg-foreground/10 text-foreground hover:bg-foreground/20',
          )}
        >
          {pending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> Working
            </>
          ) : (
            <>
              <Sparkles className="size-3.5" strokeWidth={1.5} /> Generate
            </>
          )}
        </button>
      )}

      {output && (
        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-left text-xs italic text-muted-foreground hover:text-foreground"
          >
            {expanded ? '— hide drafts —' : `— ${output.meta_summary} (click to expand)`}
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
                <Tabs defaultValue="recruiter" className="rounded-lg border border-white/10 bg-background/40 p-4">
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
                        <p className="rounded border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium">
                          {draft.subject}
                        </p>
                        <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Body</p>
                        <pre className="whitespace-pre-wrap rounded border border-white/10 bg-white/5 px-3 py-2 font-sans text-xs leading-relaxed text-foreground/90">
                          {draft.body}
                        </pre>
                        <button
                          type="button"
                          onClick={() => copyDraft(t.key, fullText)}
                          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-foreground transition-colors hover:bg-white/10"
                        >
                          {copiedKey === t.key ? (
                            <>
                              <Check className="size-3" strokeWidth={2} /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" strokeWidth={1.5} /> Copy subject + body
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
            className="inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
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
        </div>
      )}
    </div>
  );
}
