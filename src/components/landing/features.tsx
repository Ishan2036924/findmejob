'use client';

import { motion } from 'motion/react';
import { Briefcase, Compass, FileText, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const FEATURES: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: Compass,
    title: 'Candid rubric-grounded assessment',
    description:
      'Sonnet 4.6 reads your resume against the rubric for your role family (17 supported). You get evidence-grounded gaps, strengths, and a candid summary — not a participation trophy.',
  },
  {
    icon: FileText,
    title: 'Multi-step resume tailoring',
    description:
      'JD analyzer → Sonnet tailor → verifier loop. Verifier scored 95/100 across our 4 synth users. Each tailor cites which JD must-haves it addressed.',
  },
  {
    icon: Briefcase,
    title: 'Region + role-family filtered feed',
    description:
      'Match scoring against the rubric for your target role. AI/ML engineers don’t see Sales Consultants. Delhi NCR users don’t see California-only jobs.',
  },
  {
    icon: MessageSquare,
    title: '24-tool agentic chat',
    description:
      'Drop a PDF in chat, ask it to update your resume, generate a cover letter for application #3, summarize your pipeline, save jobs, paste a JD URL — all from one conversation. With persistent memory across threads.',
  },
];

export function Features() {
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
            What the agent can actually do
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            Four primitives, wired together. Each one grounded in your data.
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
      </div>
    </section>
  );
}
