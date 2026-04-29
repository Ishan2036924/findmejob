import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { classifyCompany } from '@/lib/ai/agents/company-classifier';

const MIN_CONFIDENCE = 0.4;

/**
 * Fire-and-forget company-type classification for a freshly created
 * application. Caller should NOT await — this is invoked with `void`.
 *
 * Reads job fields, runs the classifier, then writes
 * applications.company_type via the admin client (RLS bypass — the row is
 * already owned by the user, this is just a post-hoc enrichment write).
 *
 * Silently swallows all errors. Confidence < 0.4 → leave NULL.
 */
export async function enqueueCompanyClassification(applicationId: string): Promise<void> {
  try {
    const admin = createAdminClient();

    const { data: app, error: appErr } = await admin
      .from('applications')
      .select('id, job_id')
      .eq('id', applicationId)
      .maybeSingle();

    if (appErr || !app) {
      console.error('[classify] application lookup failed', { applicationId, appErr });
      return;
    }

    const { data: job, error: jobErr } = await admin
      .from('jobs')
      .select('title, company, description')
      .eq('id', app.job_id)
      .maybeSingle();

    if (jobErr || !job) {
      console.error('[classify] job lookup failed', { jobId: app.job_id, jobErr });
      return;
    }

    const { companyType, confidence } = await classifyCompany({
      company: job.company,
      jobTitle: job.title,
      jobDescription: job.description ?? '',
    });

    if (confidence < MIN_CONFIDENCE) {
      // Low confidence — leave NULL rather than poison analytics.
      return;
    }

    const { error: updErr } = await admin
      .from('applications')
      .update({ company_type: companyType })
      .eq('id', applicationId);

    if (updErr) {
      console.error('[classify] update failed', { applicationId, updErr });
    }
  } catch (err) {
    console.error('[classify] unexpected failure', { applicationId, err });
  }
}
