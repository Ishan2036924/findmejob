import type { ResumeJson } from '@/lib/ai/schemas/profile';

/**
 * Print-optimized server-rendered resume. Designed to look clean both
 * on-screen (dark page chrome around it) and in the browser's print
 * dialog (white paper, black text, ATS-friendly single column).
 *
 * The document itself is wrapped in `data-resume-paper` so global print CSS
 * can suppress every other element on the page.
 */
export function ResumeDocument({ resume }: { resume: ResumeJson }) {
  const c = resume.contact;
  const linksText = c.links.map((l) => l.label || l.url).join(' · ');

  return (
    <article
      data-resume-paper
      className="mx-auto w-full max-w-[8.5in] bg-white px-12 py-12 text-[11pt] leading-relaxed text-black shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)] print:max-w-none print:p-[0.75in] print:shadow-none"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      <header className="text-center">
        <h1 className="text-[22pt] font-semibold tracking-tight">{c.name}</h1>
        <p className="mt-1 text-[10pt] text-gray-700">
          {[c.email, c.phone, c.location].filter(Boolean).join(' · ')}
        </p>
        {linksText && <p className="mt-0.5 text-[10pt] text-gray-700">{linksText}</p>}
      </header>

      {resume.summary && (
        <Section title="Summary">
          <p className="text-justify">{resume.summary}</p>
        </Section>
      )}

      {resume.experience.length > 0 && (
        <Section title="Experience">
          {resume.experience.map((exp, i) => (
            <div key={i} className="mb-3 break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold">
                  {exp.title} · <span className="font-normal italic">{exp.company}</span>
                </p>
                <p className="text-[10pt] text-gray-700">
                  {[exp.start_date, exp.end_date ?? 'Present'].filter(Boolean).join(' – ')}
                  {exp.location ? ` · ${exp.location}` : ''}
                </p>
              </div>
              {exp.bullets.length > 0 && (
                <ul className="ml-5 mt-1 list-disc">
                  {exp.bullets.map((b, j) => (
                    <li key={j} className="mb-0.5">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {resume.projects.length > 0 && (
        <Section title="Projects">
          {resume.projects.map((p, i) => (
            <div key={i} className="mb-3 break-inside-avoid">
              <p className="font-semibold">
                {p.name}
                {p.link && (
                  <span className="ml-2 text-[10pt] font-normal italic text-gray-700">
                    ({p.link})
                  </span>
                )}
              </p>
              {p.bullets.length > 0 && (
                <ul className="ml-5 mt-1 list-disc">
                  {p.bullets.map((b, j) => (
                    <li key={j} className="mb-0.5">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {resume.education.length > 0 && (
        <Section title="Education">
          {resume.education.map((e, i) => (
            <div key={i} className="mb-2 break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold">
                  {e.degree} · <span className="font-normal italic">{e.institution}</span>
                </p>
                <p className="text-[10pt] text-gray-700">
                  {[e.start_date, e.end_date].filter(Boolean).join(' – ')}
                </p>
              </div>
              {e.bullets.length > 0 && (
                <ul className="ml-5 mt-1 list-disc">
                  {e.bullets.map((b, j) => (
                    <li key={j} className="mb-0.5">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {resume.skills.length > 0 && (
        <Section title="Skills">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
            {resume.skills.map((s, i) => (
              <div key={i} className="contents">
                <dt className="font-semibold">{s.category}</dt>
                <dd>{s.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {resume.certifications.length > 0 && (
        <Section title="Certifications">
          <ul className="ml-5 list-disc">
            {resume.certifications.map((cert, i) => (
              <li key={i} className="mb-0.5">
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
    <section className="mt-6">
      <h2 className="border-b border-gray-300 pb-1 text-[12pt] font-semibold uppercase tracking-wider">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
