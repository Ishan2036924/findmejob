/**
 * Resolve the canonical site URL for redirects (e.g., OAuth callbacks).
 * Server-side only — uses VERCEL_URL on Vercel and NEXT_PUBLIC_SITE_URL as override.
 */
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  // VERCEL_PROJECT_PRODUCTION_URL is stable across production deploys; VERCEL_URL changes per deploy.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
