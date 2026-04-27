import { z } from 'zod';
import { resumeJsonSchema } from './profile';

const editOp = z.object({
  section: z.enum(['summary', 'experience', 'projects', 'skills', 'education']),
  index: z.number().int().nullable(),
  field: z.enum(['title', 'summary', 'bullet', 'item', 'category']),
  bullet_index: z.number().int().nullable(),
  new_value: z.string(),
  reason: z.string(),
});
export type EditOp = z.infer<typeof editOp>;

export const tailorInputSchema = z.object({
  resume_json: resumeJsonSchema,
  job: z.object({
    title: z.string(),
    company: z.string(),
    description: z.string(),
    description_parsed: z.unknown().nullable(),
  }),
});
export type TailorInput = z.infer<typeof tailorInputSchema>;

export const tailorOutputSchema = z.object({
  edit_ops: z.array(editOp),
  meta_summary: z.string(),
});
export type TailorOutput = z.infer<typeof tailorOutputSchema>;
