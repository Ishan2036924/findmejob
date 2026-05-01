import { z } from 'zod';

// Mirrors the Postgres enums in supabase/migrations/20260427180700_slice1_schema.sql
// Expanded in 20260501140000_expand_role_families.sql to cover broader
// corporate scope (tech + product + ops + people + back-office).
export const roleFamily = z.enum([
  // Tech / engineering
  'swe',
  'ai_ml_engineer',
  'data_ml',
  'devops',
  'dba',
  'security_engineer',
  'qa_engineer',
  // Product & Design
  'product',
  'design',
  // Go-to-market
  'sales',
  'marketing',
  // Operations / business / back-office
  'ops',
  'hr',
  'finance',
  'procurement',
  'supply_chain',
  'consulting',
  // Fallback
  'other',
]);
export type RoleFamily = z.infer<typeof roleFamily>;

export const seniority = z.enum(['intern', 'entry', 'mid', 'senior', 'staff']);
export type Seniority = z.infer<typeof seniority>;

// v1 resume schema. Schema rules for LLM-output compatibility (especially
// OpenAI strict JSON mode):
//   - Every field must be in `required` → use `.nullable()` instead of `.optional()`
//   - No `.default()` (default fields become optional in the JSON schema)
//   - The LLM is expected to return null / [] explicitly when empty
export const resumeJsonSchema = z.object({
  contact: z.object({
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    links: z.array(z.object({ label: z.string(), url: z.string() })),
  }),
  summary: z.string().nullable(),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      location: z.string().nullable(),
      start_date: z.string(),
      end_date: z.string().nullable(), // null = current role
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      start_date: z.string().nullable(),
      end_date: z.string().nullable(),
      bullets: z.array(z.string()),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      bullets: z.array(z.string()),
      link: z.string().nullable(),
    }),
  ),
  skills: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string()),
    }),
  ),
  certifications: z.array(z.string()),
});
export type ResumeJson = z.infer<typeof resumeJsonSchema>;

// Profile data passed to agents. linkedin_paste stays nullable; portfolio_urls
// is a required array (empty if none).
export const profileSchema = z.object({
  target_role_family: roleFamily,
  target_seniority: seniority,
  target_location: z.string(),
  resume_json: resumeJsonSchema,
  linkedin_paste: z.string().nullable(),
  portfolio_urls: z.array(z.string()),
});
export type Profile = z.infer<typeof profileSchema>;
