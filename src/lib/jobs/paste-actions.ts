'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runJobExtractor } from '@/lib/ai/agents/job-extractor-agent';
import { runMatchScore } from '@/lib/ai/agents/match-score-agent';
import { enqueueCompanyClassification } from '@/lib/applications/classify';
import { checkPasteJdRateLimit } from '@/lib/guardrails/rate-limit';
import type { Profile, RoleFamily, Seniority } from '@/lib/ai/schemas/profile';

export type PasteJobResult =
  | { ok: true; applicationId: string }
  | { ok: false; error: string; message?: string };

const FETCH_TIMEOUT_MS = 15_000;
const MAX_HTML_CHARS = 60_000;

async function fetchAndStripHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; findmejob/1.0; +https://findmejob-nu.vercel.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) {
      throw new Error(`Source URL returned ${res.status}.`);
    }
    const html = await res.text();
    // Strip script/style/nav/header/footer + tags. Naive but good enough for LLM extraction.
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.slice(0, MAX_HTML_CHARS);
  } finally {
    clearTimeout(timer);
  }
}

async function persistAndScore(
  extracted: { title: string; company: string; location: string | null; description: string; source_url: string | null },
  user: { id: string },
): Promise<PasteJobResult> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile?.target_role_family || !profile?.target_seniority || !profile?.resume_json) {
    return { ok: false, error: 'Complete onboarding first.' };
  }

  // 1. Insert the job (RLS allows: user_pasted INSERT with created_by = self)
  const sourceId = `paste-${user.id}-${Date.now()}`;
  const { data: job, error: jobErr } = await supabase
    .from('jobs')
    .insert({
      source: 'user_pasted',
      source_id: sourceId,
      source_url: extracted.source_url ?? '',
      title: extracted.title,
      company: extracted.company,
      location: extracted.location,
      description: extracted.description,
      posted_at: new Date().toISOString(),
      created_by: user.id,
    })
    .select('id')
    .single();

  if (jobErr || !job) {
    console.error('[pasteJob] insert job failed', { jobErr });
    return { ok: false, error: jobErr?.message ?? 'Failed to save the job.' };
  }

  // 2. Insert the application
  const { data: app, error: appErr } = await supabase
    .from('applications')
    .insert({ profile_id: user.id, job_id: job.id, status: 'saved' })
    .select('id')
    .single();

  if (appErr || !app) {
    console.error('[pasteJob] insert application failed', { appErr });
    return { ok: false, error: appErr?.message ?? 'Failed to create application.' };
  }

  // 3a. Fire-and-forget company-type classification (don't await).
  void enqueueCompanyClassification(app.id);

  // 3. Fire-and-mostly-wait match score (admin client, bypasses match_scores RLS)
  try {
    const profileForAgent: Profile = {
      target_role_family: profile.target_role_family as RoleFamily,
      target_seniority: profile.target_seniority as Seniority,
      target_location: profile.target_location ?? 'Delhi NCR',
      resume_json: profile.resume_json,
      linkedin_paste: profile.linkedin_paste ?? null,
      portfolio_urls: profile.portfolio_urls ?? [],
    };
    const score = await runMatchScore({
      profile: profileForAgent,
      job: { title: extracted.title, company: extracted.company, description: extracted.description },
    });
    const admin = createAdminClient();
    await admin.from('match_scores').upsert(
      {
        profile_id: user.id,
        job_id: job.id,
        score: Math.round(Math.max(0, Math.min(100, score.output.score))),
        reasoning: score.output.reasoning,
        gaps: score.output.gaps,
        strengths: score.output.strengths,
        model: score.model,
      },
      { onConflict: 'profile_id,job_id' },
    );
  } catch (err) {
    // Score is non-blocking — application is already saved.
    console.error('[pasteJob] match score failed', { err });
  }

  revalidatePath('/applications');
  revalidatePath(`/applications/${app.id}`);
  return { ok: true, applicationId: app.id };
}

export async function pasteJobFromUrl(url: string): Promise<PasteJobResult> {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return { ok: false, error: 'URL must start with http:// or https://' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const rate = await checkPasteJdRateLimit(user.id);
  if (!rate.ok) {
    return { ok: false, error: 'daily_limit_reached', message: rate.message };
  }

  let pageText: string;
  try {
    pageText = await fetchAndStripHtml(trimmed);
  } catch (err) {
    console.error('[pasteJobFromUrl] fetch failed', { err });
    return {
      ok: false,
      error: `Couldn't fetch that URL: ${err instanceof Error ? err.message : 'unknown'}. Try pasting the JD text instead.`,
    };
  }

  if (pageText.length < 200) {
    return {
      ok: false,
      error: 'That page looked empty after stripping. Paste the JD text instead.',
    };
  }

  let extracted;
  try {
    const result = await runJobExtractor({ raw_text: pageText, source_url: trimmed });
    extracted = result.output;
  } catch (err) {
    console.error('[pasteJobFromUrl] extractor failed', { err });
    return {
      ok: false,
      error: `Extraction failed: ${err instanceof Error ? err.message : 'unknown'}.`,
    };
  }

  return persistAndScore(
    {
      title: extracted.title,
      company: extracted.company,
      location: extracted.location,
      description: extracted.description,
      source_url: extracted.source_url ?? trimmed,
    },
    user,
  );
}

export async function pasteJobFromText(jdText: string): Promise<PasteJobResult> {
  const trimmed = jdText.trim();
  if (trimmed.length < 100) {
    return { ok: false, error: 'JD text is too short. Paste at least 100 characters.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const rate = await checkPasteJdRateLimit(user.id);
  if (!rate.ok) {
    return { ok: false, error: 'daily_limit_reached', message: rate.message };
  }

  let extracted;
  try {
    const result = await runJobExtractor({ raw_text: trimmed });
    extracted = result.output;
  } catch (err) {
    console.error('[pasteJobFromText] extractor failed', { err });
    return {
      ok: false,
      error: `Extraction failed: ${err instanceof Error ? err.message : 'unknown'}.`,
    };
  }

  return persistAndScore(
    {
      title: extracted.title,
      company: extracted.company,
      location: extracted.location,
      description: extracted.description,
      source_url: extracted.source_url,
    },
    user,
  );
}
