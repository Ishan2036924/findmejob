'use client';

import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const LIVE: string[] = [
  '17 role families with calibrated rubrics',
  'Multi-step resume tailoring (analyzer + Sonnet + verifier)',
  'Match scoring with region + role-family filter',
  '24-tool agentic chat with persistent memory',
  'Vision attachments (drop a PDF in chat)',
  'Per-job artifact generation (cover letter / brief / interview Qs / outreach)',
  'Application tracker + analytics',
  'LinkedIn-aware onboarding',
];

const COMING: string[] = [
  'More job sources — JSearch Pro, Adzuna, RemoteOK aggregation',
  'Auto-apply assistant',
  'Multi-resume management (one per role family)',
  'GitHub portfolio analysis',
  'Roadmap engine (skill → resource map based on your gaps)',
  'Realistic-chance estimator (calibrated on real outcomes)',
  'Email digest of new high-match jobs',
];

export function Roadmap() {
  return (
    <section className="relative border-t border-white/5 px-6 py-16 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Built today / Coming next
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            Honest about what works and what&rsquo;s on the way. No imaginary features.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Live today */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur sm:p-8"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live today
              </span>
            </div>
            <ul className="mt-5 space-y-3">
              {LIVE.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-emerald-400"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Coming soon */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur sm:p-8"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                Coming soon
              </span>
            </div>
            <ul className="mt-5 space-y-3">
              {COMING.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  <ArrowRight
                    className="mt-0.5 size-4 shrink-0 text-amber-300"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
