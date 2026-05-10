import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full border border-white/10 bg-card text-muted-foreground">
          <Compass className="size-7" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The link you followed may be broken, or the page may have been moved.
        </p>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'mt-6 gap-2')}
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Back to home
        </Link>
      </div>
    </main>
  );
}
