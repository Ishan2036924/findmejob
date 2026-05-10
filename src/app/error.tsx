'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[root error boundary]', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="bg-card/40 backdrop-blur">
          <AlertTriangle className="size-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {error.message || 'An unexpected error occurred. Try refreshing the page.'}
            {error.digest ? (
              <span className="mt-2 block font-mono text-[10px] opacity-70">
                ref: {error.digest}
              </span>
            ) : null}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex gap-2">
          <Button onClick={reset} variant="default" size="lg" className="gap-2">
            <RefreshCcw className="size-4" strokeWidth={1.5} />
            Try again
          </Button>
          <Button
            onClick={() => {
              window.location.href = '/';
            }}
            variant="outline"
            size="lg"
          >
            Go home
          </Button>
        </div>
      </div>
    </main>
  );
}
