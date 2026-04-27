import { z } from 'zod';

// Mirrors the Postgres enums in supabase/migrations/20260427180700_slice1_schema.sql
export const roleFamily = z.enum([
  'swe',
  'data_ml',
  'product',
  'design',
  'devops',
  'sales',
  'marketing',
  'ops',
  'other',
]);
export type RoleFamily = z.infer<typeof roleFamily>;

export const seniority = z.enum(['intern', 'entry', 'mid', 'senior', 'staff']);
export type Seniority = z.infer<typeof seniority>;

// v1 resume schema. Will iterate as we hit edge cases in PDF parsing.
export const resumeJsonSchema = z.object({
  contact: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    links: z
      .array(z.object({ label: z.string(), url: z.string() }))
      .default([]),
  }),
  summary: z.string().optional(),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        location: z.string().optional(),
        start_date: z.string(),
        end_date: z.string().optional(), // omitted = current
        bullets: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
        bullets: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string(),
        bullets: z.array(z.string()).default([]),
        link: z.string().optional(),
      }),
    )
    .default([]),
  skills: z
    .array(
      z.object({
        category: z.string(),
        items: z.array(z.string()),
      }),
    )
    .default([]),
  certifications: z.array(z.string()).default([]),
});
export type ResumeJson = z.infer<typeof resumeJsonSchema>;

// Profile data passed to agents. Note: resume_json is required for assessment +
// match-scoring; tailor takes it as part of the input separately.
export const profileSchema = z.object({
  target_role_family: roleFamily,
  target_seniority: seniority,
  target_location: z.string(),
  resume_json: resumeJsonSchema,
  linkedin_paste: z.string().nullable(),
  portfolio_urls: z.array(z.string()).default([]),
});
export type Profile = z.infer<typeof profileSchema>;
