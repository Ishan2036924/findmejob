import Link from 'next/link';
import { Hero } from '@/components/landing/hero';
import { Comparison } from '@/components/landing/comparison';
import { Features } from '@/components/landing/features';
import { Roadmap } from '@/components/landing/roadmap';
import { FounderNote } from '@/components/landing/founder-note';

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col">
      <header className="absolute inset-x-0 top-0 z-10 flex h-16 items-center justify-between px-6 sm:px-10">
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-tight text-foreground/90 hover:text-foreground"
        >
          findmejob
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/sign-in"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-foreground px-3 py-1.5 text-background transition-colors hover:bg-foreground/90"
          >
            Get started
          </Link>
        </nav>
      </header>

      <Hero />
      <Comparison />
      <Features />
      <Roadmap />
      <FounderNote />

      <footer className="mt-auto border-t border-white/5 px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">findmejob</span>
          <span>Solo student build · India + USA</span>
        </div>
      </footer>
    </main>
  );
}
