import 'server-only';
import type { ResumeJson } from '@/lib/ai/schemas/profile';

/**
 * Pure deterministic merge of an existing resume_json with a LinkedIn-derived
 * resume_json (PDF export or pasted text → resume parser).
 *
 * Merge rules:
 *   - contact: prefer base if non-empty; fall back to linkedin per field.
 *   - summary: prefer linkedin if base is empty / <50 chars; else keep base.
 *   - experience: union by `(company || '') + '|' + (title || '')`
 *     case-insensitive. When both sources have the same role, prefer
 *     linkedin's dates and base's bullets/location (resumes tend to have
 *     crisper bullets; LinkedIn tends to have accurate dates).
 *   - education: same union rule on `(institution || '') + '|' + (degree || '')`.
 *   - projects: keep base; append any linkedin items not already present (by name).
 *   - skills: per category from base, union items (case-insensitive dedupe).
 *     Categories only present in linkedin are appended.
 *   - certifications: union, case-insensitive dedupe.
 *
 * No I/O, no logging — caller decides what to do with the result.
 */

function lower(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

function pickContact(
  base: ResumeJson['contact'],
  linkedin: ResumeJson['contact'],
): ResumeJson['contact'] {
  const linksByUrl = new Map<string, { label: string; url: string }>();
  for (const l of base.links ?? []) {
    if (l.url) linksByUrl.set(lower(l.url), l);
  }
  for (const l of linkedin.links ?? []) {
    const key = lower(l.url);
    if (key && !linksByUrl.has(key)) linksByUrl.set(key, l);
  }
  return {
    name: base.name?.trim() ? base.name : linkedin.name,
    email: base.email?.trim() ? base.email : linkedin.email,
    phone: base.phone?.trim() ? base.phone : linkedin.phone,
    location: base.location?.trim() ? base.location : linkedin.location,
    links: Array.from(linksByUrl.values()),
  };
}

function pickSummary(base: string | null, linkedin: string | null): string | null {
  const baseTrim = (base ?? '').trim();
  if (baseTrim.length >= 50) return base;
  return linkedin?.trim() ? linkedin : base;
}

function mergeExperience(
  base: ResumeJson['experience'],
  linkedin: ResumeJson['experience'],
): ResumeJson['experience'] {
  const key = (e: ResumeJson['experience'][number]) =>
    `${lower(e.company)}|${lower(e.title)}`;

  const byKey = new Map<string, ResumeJson['experience'][number]>();
  for (const e of base) byKey.set(key(e), e);
  for (const e of linkedin) {
    const k = key(e);
    const existing = byKey.get(k);
    if (!existing) {
      byKey.set(k, e);
      continue;
    }
    // Both sources have this role: prefer linkedin dates, base bullets/location.
    byKey.set(k, {
      title: existing.title || e.title,
      company: existing.company || e.company,
      location: existing.location ?? e.location,
      start_date: e.start_date || existing.start_date,
      end_date: e.end_date ?? existing.end_date,
      bullets: existing.bullets.length > 0 ? existing.bullets : e.bullets,
    });
  }
  return Array.from(byKey.values());
}

function mergeEducation(
  base: ResumeJson['education'],
  linkedin: ResumeJson['education'],
): ResumeJson['education'] {
  const key = (e: ResumeJson['education'][number]) =>
    `${lower(e.institution)}|${lower(e.degree)}`;

  const byKey = new Map<string, ResumeJson['education'][number]>();
  for (const e of base) byKey.set(key(e), e);
  for (const e of linkedin) {
    const k = key(e);
    const existing = byKey.get(k);
    if (!existing) {
      byKey.set(k, e);
      continue;
    }
    byKey.set(k, {
      degree: existing.degree || e.degree,
      institution: existing.institution || e.institution,
      start_date: e.start_date ?? existing.start_date,
      end_date: e.end_date ?? existing.end_date,
      bullets: existing.bullets.length > 0 ? existing.bullets : e.bullets,
    });
  }
  return Array.from(byKey.values());
}

function mergeProjects(
  base: ResumeJson['projects'],
  linkedin: ResumeJson['projects'],
): ResumeJson['projects'] {
  const seen = new Set(base.map((p) => lower(p.name)));
  const extras = linkedin.filter((p) => !seen.has(lower(p.name)));
  return [...base, ...extras];
}

function mergeSkills(
  base: ResumeJson['skills'],
  linkedin: ResumeJson['skills'],
): ResumeJson['skills'] {
  const byCategory = new Map<string, { category: string; items: string[] }>();
  for (const s of base) {
    byCategory.set(lower(s.category), { category: s.category, items: [...s.items] });
  }
  for (const s of linkedin) {
    const k = lower(s.category);
    const existing = byCategory.get(k);
    if (!existing) {
      byCategory.set(k, { category: s.category, items: [...s.items] });
      continue;
    }
    const seen = new Set(existing.items.map((i) => lower(i)));
    for (const item of s.items) {
      if (!seen.has(lower(item))) {
        existing.items.push(item);
        seen.add(lower(item));
      }
    }
  }
  return Array.from(byCategory.values());
}

function mergeCertifications(base: string[], linkedin: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const c of [...base, ...linkedin]) {
    const k = lower(c);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}

export function mergeResumeWithLinkedin(
  base: ResumeJson,
  linkedin: ResumeJson,
): ResumeJson {
  return {
    contact: pickContact(base.contact, linkedin.contact),
    summary: pickSummary(base.summary, linkedin.summary),
    experience: mergeExperience(base.experience, linkedin.experience),
    education: mergeEducation(base.education, linkedin.education),
    projects: mergeProjects(base.projects, linkedin.projects),
    skills: mergeSkills(base.skills, linkedin.skills),
    certifications: mergeCertifications(base.certifications, linkedin.certifications),
  };
}
