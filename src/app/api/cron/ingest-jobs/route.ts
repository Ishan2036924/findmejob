import { NextResponse, type NextRequest } from 'next/server';
import { ingestJobs } from '@/lib/jobs/ingest';

// Vercel cron sends Authorization: Bearer ${CRON_SECRET} when CRON_SECRET is
// set on the project. We reject otherwise — both for direct browser hits and
// for any non-cron caller.

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min — full ingest with ~30 ATS calls + JSearch

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    console.error('[cron/ingest-jobs] CRON_SECRET is not set; refusing to run.');
    return NextResponse.json(
      { ok: false, error: 'CRON_SECRET not configured.' },
      { status: 500 },
    );
  }

  if (auth !== `Bearer ${expected}`) {
    console.warn('[cron/ingest-jobs] unauthorized hit', {
      hasAuth: !!auth,
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await ingestJobs();
    console.log('[cron/ingest-jobs] success', {
      totalFetched: result.totalFetched,
      totalUpserted: result.totalUpserted,
      bySource: result.bySource,
      errorCount: result.errors.length,
      durationMs: result.durationMs,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[cron/ingest-jobs] threw', {
      error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
    });
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'unknown' },
      { status: 500 },
    );
  }
}
