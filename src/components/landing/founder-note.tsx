'use client';

import { motion } from 'motion/react';

export function FounderNote() {
  return (
    <section className="relative border-t border-white/5 px-6 py-16 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur sm:p-8"
        >
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-sm"
            >
              IS
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Ishan</span>
              <span className="text-xs text-muted-foreground">Solo founder</span>
            </div>
          </div>

          <h2 className="mt-6 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Built by a solo student. Tell me what sucks.
          </h2>

          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hi — I&rsquo;m Ishan. I&rsquo;m a solo student building findmejob. The job sources are limited right now (JSearch free tier + 31 curated companies). The agent will say things you disagree with. Some flows will feel rough.{' '}
            <span className="font-medium text-foreground">I want brutally honest feedback</span> — what&rsquo;s broken, what&rsquo;s missing, what&rsquo;s confusing. There&rsquo;s a feedback button after you sign in, or hit reply on the LinkedIn post. Every piece of feedback shapes the next push.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
