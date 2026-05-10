import type { ResumeJson } from '@/lib/ai/schemas/profile';

/**
 * Print-optimized server-rendered resume. Designed to look clean both
 * on-screen (dark page chrome around it) and in the browser's print
 * dialog (white paper, black text, ATS-friendly single column).
 *
 * ONE-PAGE HARD CAP (2026-05-10): truncates content at render time so the
 * output fits on a single 8.5×11 page. The tailor prompt also tightens
 * length per-item — these caps are the safety net for resumes that came in
 * long from the start.
 *
 * The document itself is wrapped in `data-resume-paper` so global print CSS
 * can suppress every other element on the page.
 */

// Render-time hard caps. Keep these in sync with the length guidance in
// `src/lib/ai/prompts/system/tailor.system.ts` § ONE-PAGE LENGTH CAP.
const MAX_EXPERIENCE_ENTRIES = 4;
const MAX_BULLETS_PER_EXPERIENCE = 4;
const MAX_PROJECT_ENTRIES = 2;
const MAX_BULLETS_PER_PROJECT = 2;
const MAX_EDUCATION_ENTRIES = 2;
const MAX_BULLETS_PER_EDUCATION = 2;
const MAX_SKILL_CATEGORIES = 5;
const MAX_CERTIFICATIONS = 3;
const MAX_BULLET_CHARS = 220; // ~2 print lines at 10pt; enough margin for vocabulary mirroring
const MAX_SUMMARY_WORDS = 60;

function truncateBullet(s: string): string {
  if (s.length <= MAX_BULLET_CHARS) return s;
  return s.slice(0, MAX_BULLET_CHARS - 1).trimEnd() + '…';
}

function truncateSummary(s: string): string {
  const words = s.trim().split(/\s+/);
  if (words.length <= MAX_SUMMARY_WORDS) return s;
  return words.slice(0, MAX_SUMMARY_WORDS).join(' ').replace(/[.,;:]$/, '') + '…';
}

export function ResumeDocument({ resume }: { resume: ResumeJson }) {
  const c = resume.contact;
  const linksText = c.links.map((l) => l.label || l.url).join(' · ');

  const experience = resume.experience.slice(0, MAX_EXPERIENCE_ENTRIES);
  const projects = resume.projects.slice(0, MAX_PROJECT_ENTRIES);
  const education = resume.education.slice(0, MAX_EDUCATION_ENTRIES);
  const skills = resume.skills.slice(0, MAX_SKILL_CATEGORIES);
  const certifications = resume.certifications.slice(0, MAX_CERTIFICATIONS);

  return (
    <article
      data-resume-paper
      className="mx-auto w-full max-w-[8.5in] bg-white px-12 py-10 text-[10pt] leading-snug text-black shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)] print:max-w-none print:px-[0.6in] print:py-[0.5in] print:shadow-none"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      <header className="text-center">
        <h1 className="text-[20pt] font-semibold tracking-tight">{c.name}</h1>
        <p className="mt-0.5 text-[9pt] text-gray-700">
          {[c.email, c.phone, c.location].filter(Boolean).join(' · ')}
        </p>
        {linksText && <p className="text-[9pt] text-gray-700">{linksText}</p>}
      </header>

      {resume.summary && (
        <Section title="Summary">
          <p className="text-justify">{truncateSummary(resume.summary)}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Experience">
          {experience.map((exp, i) => {
            const bullets = exp.bullets.slice(0, MAX_BULLETS_PER_EXPERIENCE);
            return (
              <div key={i} className="mb-2 break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-semibold">
                    {exp.title} · <span className="font-normal italic">{exp.company}</span>
                  </p>
                  <p className="text-[9pt] text-gray-700">
                    {[exp.start_date, exp.end_date ?? 'Present'].filter(Boolean).join(' – ')}
                    {exp.location ? ` · ${exp.location}` : ''}
                  </p>
                </div>
                {bullets.length > 0 && (
                  <ul className="ml-5 mt-0.5 list-disc">
                    {bullets.map((b, j) => (
                      <li key={j} className="mb-0">
                        {truncateBullet(b)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((p, i) => {
            const bullets = p.bullets.slice(0, MAX_BULLETS_PER_PROJECT);
            return (
              <div key={i} className="mb-2 break-inside-avoid">
                <p className="font-semibold">
                  {p.name}
                  {p.link && (
                    <span className="ml-2 text-[9pt] font-normal italic text-gray-700">
                      ({p.link})
                    </span>
                  )}
                </p>
                {bullets.length > 0 && (
                  <ul className="ml-5 mt-0.5 list-disc">
                    {bullets.map((b, j) => (
                      <li key={j} className="mb-0">
                        {truncateBullet(b)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          {education.map((e, i) => {
            const bullets = e.bullets.slice(0, MAX_BULLETS_PER_EDUCATION);
            return (
              <div key={i} className="mb-1.5 break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-semibold">
                    {e.degree} · <span className="font-normal italic">{e.institution}</span>
                  </p>
                  <p className="text-[9pt] text-gray-700">
                    {[e.start_date, e.end_date].filter(Boolean).join(' – ')}
                  </p>
                </div>
                {bullets.length > 0 && (
                  <ul className="ml-5 mt-0.5 list-disc">
                    {bullets.map((b, j) => (
                      <li key={j} className="mb-0">
                        {truncateBullet(b)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-0.5">
            {skills.map((s, i) => (
              <div key={i} className="contents">
                <dt className="font-semibold">{s.category}</dt>
                <dd>{s.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {certifications.length > 0 && (
        <Section title="Certifications">
          <ul className="ml-5 list-disc">
            {certifications.map((cert, i) => (
              <li key={i} className="mb-0">
                {cert}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="border-b border-gray-300 pb-0.5 text-[11pt] font-semibold uppercase tracking-wider">
        {title}
      </h2>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}
