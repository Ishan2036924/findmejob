import * as Sentry from '@sentry/nextjs';

/**
 * Optional wrapper for server actions that should report exceptions to Sentry
 * with a stable `scope` tag. The action's signature is preserved — just wrap
 * the body.
 *
 * Usage:
 *   export async function tailorResume(input: Input) {
 *     return withSentry('tailor-resume', async () => {
 *       // ... action body ...
 *     });
 *   }
 *
 * Sentry's Next.js instrumentation already captures unhandled errors from API
 * routes, RSCs, and server actions automatically — this helper exists for
 * cases where we want to add a scope tag for filtering, or want to ensure
 * capture even if a path is missed by the auto-instrumentation.
 */
export async function withSentry<T>(scope: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    Sentry.captureException(err, { tags: { scope } });
    throw err;
  }
}
