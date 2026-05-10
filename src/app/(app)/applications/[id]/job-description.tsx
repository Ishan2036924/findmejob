'use client';

import { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const PREVIEW_CHARS = 600;

export function JobDescription({
  description,
  isPasted,
}: {
  description: string;
  isPasted: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const showToggle = description.length > PREVIEW_CHARS;
  const visible =
    expanded || !showToggle ? description : description.slice(0, PREVIEW_CHARS).trimEnd() + '…';

  return (
    <section className="rounded-2xl border border-white/10 bg-card/30 p-5 backdrop-blur sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="size-3.5 text-muted-foreground/70" strokeWidth={1.5} />
          <h2 className="text-sm font-medium tracking-tight">Job description</h2>
        </div>
        {isPasted && (
          <span className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-indigo-300">
            Pasted by you
          </span>
        )}
      </div>

      <pre
        className={cn(
          'mt-4 overflow-x-auto whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground/90',
        )}
      >
        {visible}
      </pre>

      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : 'Read more'}
          <ChevronDown
            className={cn('size-3.5 transition-transform', expanded && 'rotate-180')}
            strokeWidth={1.5}
          />
        </button>
      )}
    </section>
  );
}
