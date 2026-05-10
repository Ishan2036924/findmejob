'use client';

import { motion } from 'motion/react';

const LINKEDIN_URL = 'https://www.linkedin.com/in/ishan-srivastava-7742b121a/';

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

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
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Ishan Srivastava on LinkedIn"
                className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
              >
                IS
              </a>
              <div className="flex flex-col">
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  Ishan Srivastava
                </a>
                <span className="text-xs text-muted-foreground">Solo founder · findmejob</span>
              </div>
            </div>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden shrink-0 items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-white/25 hover:bg-white/10 hover:text-foreground sm:inline-flex"
            >
              <LinkedinIcon className="size-3.5" />
              Connect on LinkedIn
            </a>
          </div>

          <h2 className="mt-6 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Built by a solo student. Tell me what sucks.
          </h2>

          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hi — I&rsquo;m Ishan. I&rsquo;m a solo student building findmejob. The job sources are limited right now (JSearch free tier + 31 curated companies). The agent will say things you disagree with. Some flows will feel rough.{' '}
            <span className="font-medium text-foreground">I want brutally honest feedback</span> — what&rsquo;s broken, what&rsquo;s missing, what&rsquo;s confusing. There&rsquo;s a feedback button after you sign in, or{' '}
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              message me on LinkedIn
            </a>
            . Every piece of feedback shapes the next push.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
