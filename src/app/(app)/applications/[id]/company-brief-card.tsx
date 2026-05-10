'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  ChevronDown,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateCompanyBrief } from '@/lib/artifacts/actions';
import type { CompanyBriefOutput } from '@/lib/ai/schemas/company-brief';
import { cn } from '@/lib/utils';

type Props = {
  applicationId: string;
  initialOutput: CompanyBriefOutput | null;
};

export function CompanyBriefCard({ applicationId, initialOutput }: Props) {
  const router = useRouter();
  const output = initialOutput;
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  function fire() {
    startTransition(async () => {
      const result = await generateCompanyBrief(applicationId);
      if (!result.ok) {
        toast.error(result.message ?? result.error);
        return;
      }
      router.refresh();
      toast.success('Company brief ready');
      setExpanded(true);
    });
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
          <Building2 className="size-3.5 text-foreground/80" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium tracking-tight">Company brief</h3>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            Signals, questions to ask, red flags.
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
                <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-background/40 p-3 text-xs leading-relaxed">
                  <Section title="What they do">
                    <p>{output.what_they_do}</p>
                  </Section>
                  {output.signals_from_jd.length > 0 && (
                    <Section title="Signals from the JD">
                      <ul className="ml-4 list-disc space-y-1">
                        {output.signals_from_jd.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </Section>
                  )}
                  {output.questions_to_ask.length > 0 && (
                    <Section title="Questions to ask">
                      <ul className="ml-4 list-disc space-y-1">
                        {output.questions_to_ask.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </Section>
                  )}
                  {output.red_flags.length > 0 && (
                    <Section title="Red flags" tone="amber">
                      <ul className="ml-4 list-disc space-y-1">
                        {output.red_flags.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </Section>
                  )}
                </div>
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

function Section({
  title,
  children,
  tone,
}: {
  title: string;
  children: React.ReactNode;
  tone?: 'amber';
}) {
  return (
    <div className="flex flex-col gap-1">
      <p
        className={cn(
          'text-[10px] uppercase tracking-wider',
          tone === 'amber' ? 'text-amber-300/80' : 'text-muted-foreground',
        )}
      >
        {title}
      </p>
      <div className="text-foreground/90">{children}</div>
    </div>
  );
}
