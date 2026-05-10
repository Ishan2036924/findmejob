'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, MessageSquareWarning, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app error boundary]', error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-10 sm:px-10 sm:py-16">
      <Alert variant="destructive" className="bg-card/40 backdrop-blur">
        <AlertTriangle className="size-4" />
        <AlertTitle>Something went wrong on this page</AlertTitle>
        <AlertDescription>
          {error.message || 'We hit an unexpected error rendering this page.'}
          {error.digest ? (
            <span className="mt-2 block font-mono text-[10px] opacity-70">
              ref: {error.digest}
            </span>
          ) : null}
        </AlertDescription>
      </Alert>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Try refreshing the page. If it keeps happening, please report it through
        the feedback widget so we can fix it.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={reset} variant="default" size="lg" className="gap-2">
          <RefreshCcw className="size-4" strokeWidth={1.5} />
          Try again
        </Button>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
        >
          Back to dashboard
        </Link>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'gap-2')}
        >
          <MessageSquareWarning className="size-4" strokeWidth={1.5} />
          Report this
        </Link>
      </div>
    </main>
  );
}
