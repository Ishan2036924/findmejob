import 'server-only';
import { streamText, stepCountIs, type ModelMessage } from 'ai';
import { openai } from '@ai-sdk/openai';

import { createClient } from '@/lib/supabase/server';
import { getMessages, type ChatMessageRow } from '@/lib/chat/queries';
import { listMemories, getMemoryContextBlock } from '@/lib/memory/queries';

import {
  CAREER_AGENT_SYSTEM,
  CAREER_AGENT_SYSTEM_VERSION,
} from '../prompts/system/career-agent.system';

import { getProfileTool } from '../tools/get-profile';
import { listApplicationsTool } from '../tools/list-applications';
import { getApplicationDetailTool } from '../tools/get-application-detail';
import { getLatestAssessmentTool } from '../tools/get-latest-assessment';
import { getMatchScoreTrendTool } from '../tools/get-match-score-trend';
import { listArtifactsTool } from '../tools/list-artifacts';
import { getAnalyticsSummaryTool } from '../tools/get-analytics-summary';
import { saveMemoryTool } from '../tools/save-memory';
import { forgetMemoryTool } from '../tools/forget-memory';

import { distillMemories } from './memory-distiller';

const MODEL_ID = 'openai/gpt-4.1-mini';

type CareerAgentInput = {
  threadId: string;
  userMessage: string;
};

function rowsToModelMessages(rows: ChatMessageRow[]): ModelMessage[] {
  // Drop tool-role rows; reconstruction of mid-stream tool messages from DB is
  // unreliable. The agent re-runs tools per turn, so this is fine.
  return rows
    .filter((r) => r.role === 'user' || r.role === 'assistant')
    .map((r) => ({
      role: r.role as 'user' | 'assistant',
      content: r.content,
    }));
}

/**
 * Build a streaming Response for one turn of the career agent.
 * Persists the user message immediately, then streams the assistant turn,
 * persisting the assistant message + token usage on completion.
 */
export async function careerAgent({ threadId, userMessage }: CareerAgentInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const profileId = user.id;

  // Load history (cap last 30) + memory block.
  const allHistory = await getMessages(threadId);
  const recentHistory = allHistory.slice(-30);
  const historyMessages = rowsToModelMessages(recentHistory);

  const memoryBlock = await getMemoryContextBlock();
  const systemMessages: ModelMessage[] = [
    { role: 'system', content: CAREER_AGENT_SYSTEM },
  ];
  if (memoryBlock) {
    systemMessages.push({
      role: 'system',
      content: `## DURABLE_USER_MEMORIES\n${memoryBlock}`,
    });
  }

  const messages: ModelMessage[] = [
    ...systemMessages,
    ...historyMessages,
    { role: 'user', content: userMessage },
  ];

  const result = streamText({
    model: openai('gpt-4.1-mini'),
    messages,
    tools: {
      get_profile: getProfileTool,
      list_applications: listApplicationsTool,
      get_application_detail: getApplicationDetailTool,
      get_latest_assessment: getLatestAssessmentTool,
      get_match_score_trend: getMatchScoreTrendTool,
      list_artifacts: listArtifactsTool,
      get_analytics_summary: getAnalyticsSummaryTool,
      save_memory: saveMemoryTool,
      forget_memory: forgetMemoryTool,
    },
    stopWhen: stepCountIs(6),
    onFinish: async ({ text, usage }) => {
      try {
        const supa = await createClient();

        // Persist assistant message with usage.
        const insertAssistant = await supa.from('chat_messages').insert({
          thread_id: threadId,
          profile_id: profileId,
          role: 'assistant',
          content: text ?? '',
          tokens_input: usage?.inputTokens ?? null,
          tokens_output: usage?.outputTokens ?? null,
          model: MODEL_ID,
        });
        if (insertAssistant.error) {
          console.error('[careerAgent assistant insert]', insertAssistant.error);
        }

        // Bump thread last_message_at.
        await supa
          .from('chat_threads')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', threadId);

        // Memory distiller — fire-and-forget. Never block.
        try {
          const memories = await listMemories();
          await distillMemories({
            userMessage,
            assistantText: text ?? '',
            existingMemories: memories.map((m) => m.content),
          });
        } catch (err) {
          console.error('[careerAgent distillMemories]', err);
        }
      } catch (err) {
        console.error('[careerAgent onFinish]', err);
      }
    },
  });

  // Plain text streaming. The chat client reads it incrementally as text.
  return result.toTextStreamResponse();
}

export const CAREER_AGENT_MODEL_ID = MODEL_ID;
export { CAREER_AGENT_SYSTEM_VERSION };
