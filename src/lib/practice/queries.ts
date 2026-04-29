import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { PracticeFeedback, PracticeQuestionType } from '@/lib/ai/schemas/practice';

export type PracticeSessionRow = {
  id: string;
  application_id: string;
  question: string;
  question_type?: PracticeQuestionType | null;
  user_answer: string;
  feedback: PracticeFeedback | null;
  created_at: string;
};

export async function getPracticeSessions(applicationId: string): Promise<PracticeSessionRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false });

  if (!data) return [];

  // RLS already gates by application ownership; enforce in app too.
  return data.map((row) => ({
    id: row.id,
    application_id: row.application_id,
    question: row.question,
    user_answer: row.user_answer,
    feedback: row.feedback as PracticeFeedback | null,
    created_at: row.created_at,
  }));
}
