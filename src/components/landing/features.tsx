'use client';

import { motion } from 'motion/react';
import { CheckCircle2, FileText, Sparkles, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const FEATURES: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: Sparkles,
    title: 'Candid assessment',
    description:
      'Rubric-grounded scoring with evidence pulled directly from your resume. Specific gaps, specific strengths.',
  },
  {
    icon: Target,
    title: 'Match scoring',
    description:
      'Every job in your feed gets a 0–100 fit score with reasoning, gaps, and overlaps. No mystery, no fluff.',
  },
  {
    icon: FileText,
    title: 'Tailored resumes',
    description:
      'One click per job. We rewrite your resume to match the JD without inventing experience you don’t have.',
  },
  {
    icon: CheckCircle2,
    title: 'Verified listings',
    description:
      'Trust scores filter ghost jobs and stale postings. The feed shows roles actually being filled.',
  },
];

export function Features() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Built around four primitives
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          Each one is a complete piece of the loop. The product is the loop.
        </p>
      </motion.div>

      <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0.001, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{
              duration: 0.5,
              delay: i * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="group relative rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur transition-colors duration-300 hover:border-white/20 hover:bg-card/60"
          >
            <div className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <f.icon className="size-4 text-foreground/80" strokeWidth={1.5} />
            </div>
            <h3 className="mt-5 text-base font-medium tracking-tight">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
