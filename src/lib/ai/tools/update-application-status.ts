import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { updateApplicationStatus } from '@/lib/applications/actions';

export const updateApplicationStatusTool = tool({
  description:
    'Update the status of one application (saved | applied | interview | offer | rejected | withdrawn). RLS enforces ownership. Confirm with the user before calling unless they explicitly said the new status.',
  inputSchema: z.object({
    application_id: z.string().describe('The application UUID.'),
    status: z.enum([
      'saved',
      'applied',
      'interview',
      'offer',
      'rejected',
      'withdrawn',
    ]),
  }),
  execute: async ({ application_id, status }) => {
    try {
      const result = await updateApplicationStatus(application_id, status);
      if (!result.ok) {
        return { error: result.error };
      }
      return { ok: true, id: application_id, status };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'unknown_error' };
    }
  },
});
