import { type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  framework: 'nextjs',
  crons: [
    // Daily multi-source job ingest — JSearch + curated Greenhouse/Lever/Ashby.
    // 00:30 UTC = 06:00 IST = 20:30 PT (previous day) = 23:30 ET (previous day).
    // Catches India morning + previous US business-day end-of-day postings.
    {
      path: '/api/cron/ingest-jobs',
      schedule: '30 0 * * *',
    },
  ],
};
