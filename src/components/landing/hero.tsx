'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Ambient gradient — anchored top-center, soft falloff */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu blur-3xl"
      >
        <div
          className="relative left-1/2 aspect-square w-[44rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-fuchsia-500/10 opacity-60"
          style={{ clipPath: 'circle(50% at 50% 50%)' }}
        />
      </div>

      {/* Subtle grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />

      <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 sm:pt-40 sm:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Now in private beta · India + USA
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 text-balance text-5xl font-semibold tracking-tight sm:text-6xl"
        >
          An AI career agent that <span className="text-muted-foreground">actually knows you.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Not another chatbot. findmejob has access to your resume, your applications, every match score, every artifact you&rsquo;ve generated. From one chat, it can assess you candidly, tailor your resume, draft cover letters, track your pipeline, and push back on bad ideas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/sign-up"
            className={cn(buttonVariants({ size: 'lg' }), 'group min-w-40 h-11 px-6 text-base')}
          >
            Get started
            <ArrowRight className="ml-1 size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#compare"
            className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'min-w-40 h-11 px-6 text-base')}
          >
            How it&rsquo;s different
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
