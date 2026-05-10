// One-time app boot. Runs once when the Node.js / Edge runtime starts.
// AI Gateway is the default provider for AI SDK string model IDs — no override needed.
//
// Sentry is initialized here per Next.js 16 instrumentation contract.
// `onRequestError` lets Sentry capture errors thrown in nested React Server
// Components, which the runtime would otherwise swallow.

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
