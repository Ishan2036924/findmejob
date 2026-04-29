'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type UIMessage = {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  pending?: boolean;
};

export type ChatThreadProps = {
  threadId: string;
  initialMessages: UIMessage[];
};

export function ChatThread({ threadId, initialMessages }: ChatThreadProps) {
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsgId = `local-user-${Date.now()}`;
    const assistantMsgId = `local-assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: text },
      { id: assistantMsgId, role: 'assistant', content: '', pending: true },
    ]);
    setInput('');
    setIsStreaming(true);

    try {
      const res = await fetch(`/api/chat/${threadId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (res.status === 429) {
        toast.error('Daily chat limit reached. Try again tomorrow.');
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
        setIsStreaming(false);
        return;
      }
      if (!res.ok) {
        toast.error('Chat failed. Try again.');
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
        setIsStreaming(false);
        return;
      }

      if (!res.body) {
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: acc, pending: false }
              : m,
          ),
        );
      }
    } catch (err) {
      console.error('[chat send]', err);
      toast.error('Chat failed. Try again.');
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
    } finally {
      setIsStreaming(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      void send();
    }
  };

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-card/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Ask anything about your job search. I have full context of your
                applications, scores, and assessment.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'rounded p-4 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'ml-auto max-w-[80%] bg-primary/10 text-foreground'
                  : 'bg-muted/40 text-foreground',
              )}
            >
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                {m.role}
              </span>
              {m.pending && !m.content ? (
                <p className="text-muted-foreground">Thinking…</p>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <div className="flex flex-1 items-end gap-2 rounded-xl border border-white/10 bg-card/40 p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={isStreaming}
              placeholder={
                isStreaming
                  ? 'Agent is replying…'
                  : 'Ask about your applications, scores, gaps… (Cmd+Enter to send)'
              }
              rows={2}
              className="min-h-[44px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={isStreaming || !input.trim()}
              aria-label="Send"
              className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
