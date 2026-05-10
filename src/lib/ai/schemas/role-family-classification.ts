import { z } from 'zod';
import { roleFamily } from './profile';

export const roleFamilyClassificationSchema = z.object({
  role_family: roleFamily,
  confidence: z.number(),
});
export type RoleFamilyClassification = z.infer<typeof roleFamilyClassificationSchema>;
