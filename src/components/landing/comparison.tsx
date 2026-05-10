'use client';

import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Cell = boolean;

const ROWS: Array<{ capability: string; chatgpt: Cell; builder: Cell; findmejob: Cell }> = [
  { capability: 'Knows your applications', chatgpt: false, builder: false, findmejob: true },
  { capability: 'Reads your resume once', chatgpt: false, builder: true, findmejob: true },
  { capability: 'Tools that act, not just talk', chatgpt: false, builder: false, findmejob: true },
  { capability: 'Tracks every match score', chatgpt: false, builder: false, findmejob: true },
  { capability: 'Honest, not flattery', chatgpt: false, builder: false, findmejob: true },
  { capability: 'Built for one user — you', chatgpt: false, builder: false, findmejob: true },
];

function Mark({ on }: { on: boolean }) {
  return on ? (
    <Check className="size-4 text-emerald-400" strokeWidth={2.25} aria-label="yes" />
  ) : (
    <X className="size-4 text-muted-foreground/60" strokeWidth={2.25} aria-label="no" />
  );
}

export function Comparison() {
  return (
    <section
      id="compare"
      className="relative scroll-mt-24 border-t border-white/5 px-6 py-16 sm:px-10 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Why not just use ChatGPT?
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            ChatGPT doesn&rsquo;t know your applications. Resume builders don&rsquo;t act on your behalf. findmejob does both.
          </p>
        </motion.div>

        {/* Desktop: 3 columns table-style */}
        <div className="mt-12 hidden lg:block">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-2">
            {/* Header row */}
            <div />
            <div className="rounded-t-xl border border-white/10 bg-card/40 px-5 py-4 text-center text-sm font-medium text-foreground/90">
              ChatGPT
            </div>
            <div className="rounded-t-xl border border-white/10 bg-card/40 px-5 py-4 text-center text-sm font-medium text-foreground/90">
              Generic resume builder
            </div>
            <div className="rounded-t-xl border border-indigo-400/40 bg-indigo-500/5 px-5 py-4 text-center text-sm font-semibold text-foreground">
              findmejob
            </div>

            {/* Rows */}
            {ROWS.map((row, idx) => {
              const isLast = idx === ROWS.length - 1;
              return (
                <div key={row.capability} className="contents">
                  <div className="flex items-center px-5 py-3 text-sm text-muted-foreground">
                    {row.capability}
                  </div>
                  <div
                    className={cn(
                      'flex items-center justify-center border-x border-white/10 bg-card/40 px-5 py-3',
                      isLast && 'rounded-b-xl border-b',
                      !isLast && 'border-b border-white/5',
                    )}
                  >
                    <Mark on={row.chatgpt} />
                  </div>
                  <div
                    className={cn(
                      'flex items-center justify-center border-x border-white/10 bg-card/40 px-5 py-3',
                      isLast && 'rounded-b-xl border-b',
                      !isLast && 'border-b border-white/5',
                    )}
                  >
                    <Mark on={row.builder} />
                  </div>
                  <div
                    className={cn(
                      'flex items-center justify-center border-x border-indigo-400/40 bg-indigo-500/5 px-5 py-3',
                      isLast && 'rounded-b-xl border-b',
                      !isLast && 'border-b border-indigo-400/20',
                    )}
                  >
                    <Mark on={row.findmejob} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile / tablet: stacked cards */}
        <div className="mt-10 grid grid-cols-1 gap-4 lg:hidden">
          {[
            { name: 'ChatGPT', cells: ROWS.map((r) => r.chatgpt), highlight: false },
            { name: 'Generic resume builder', cells: ROWS.map((r) => r.builder), highlight: false },
            { name: 'findmejob', cells: ROWS.map((r) => r.findmejob), highlight: true },
          ].map((col) => (
            <div
              key={col.name}
              className={cn(
                'rounded-2xl border bg-card/40 p-6 backdrop-blur',
                col.highlight ? 'border-indigo-400/40 bg-indigo-500/5' : 'border-white/10',
              )}
            >
              <h3
                className={cn(
                  'text-base tracking-tight',
                  col.highlight ? 'font-semibold text-foreground' : 'font-medium text-foreground/90',
                )}
              >
                {col.name}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {ROWS.map((row, i) => (
                  <li key={row.capability} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">{row.capability}</span>
                    <Mark on={col.cells[i]} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
