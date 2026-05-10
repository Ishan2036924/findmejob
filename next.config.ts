import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  /* config options here */
};

// Sentry SDK v10 collapsed previously-separate "build" and "runtime" options
// into one bag passed as the second arg.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? '',
  project: process.env.SENTRY_PROJECT ?? '',
  silent: !process.env.CI,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Don't ship the noisy Sentry build logger to prod bundles.
  disableLogger: true,
  // Upload a wider client bundle so RSC payloads symbolicate cleanly.
  widenClientFileUpload: true,
  // Delete uploaded source maps from the public bundle to keep them server-only.
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  // Tunnel browser → Sentry through our origin so adblockers don't drop events.
  tunnelRoute: '/monitoring',
});
