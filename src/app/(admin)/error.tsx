'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin error boundary]', error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-10 sm:px-10 sm:py-16">
      <Alert variant="destructive" className="bg-card/40 backdrop-blur">
        <AlertTriangle className="size-4" />
        <AlertTitle>Admin page error</AlertTitle>
        <AlertDescription>
          {error.message || 'An unexpected error occurred rendering this admin page.'}
          {error.digest ? (
            <span className="mt-2 block font-mono text-[10px] opacity-70">
              ref: {error.digest}
            </span>
          ) : null}
        </AlertDescription>
      </Alert>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Check Vercel runtime logs for the full stack trace.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={reset} variant="default" size="lg" className="gap-2">
          <RefreshCcw className="size-4" strokeWidth={1.5} />
          Try again
        </Button>
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
        >
          Back to admin
        </Link>
      </div>
    </main>
  );
}
