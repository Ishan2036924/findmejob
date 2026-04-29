import { z } from 'zod';

// Strict-mode-safe schema for job extraction (paste-a-job).
// Uses .nullable() (not .optional()), no .min/.max, no .int().
export const jobExtractSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().nullable(),
  description: z.string(),
  source_url: z.string().nullable(),
});

export type JobExtract = z.infer<typeof jobExtractSchema>;
