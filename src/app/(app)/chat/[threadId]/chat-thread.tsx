'use client';

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { uploadChatAttachment } from '@/lib/chat/attachments';

type UIMessage = {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  pending?: boolean;
};

type PendingAttachment = {
  localKey: string;
  id?: string;
  name: string;
  kind: 'image' | 'pdf' | 'unknown';
  status: 'uploading' | 'ready' | 'error';
  error?: string;
};

export type ChatThreadProps = {
  threadId: string;
  initialMessages: UIMessage[];
};

const ACCEPT = 'image/png,image/jpeg,image/webp,application/pdf';

const STARTER_PROMPTS = [
  'Show me my best matches today',
  'What gaps does my resume have for senior roles?',
  'Generate a cover letter for my top match',
];

export function ChatThread({ threadId, initialMessages }: ChatThreadProps) {
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<
    PendingAttachment[]
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const anyUploading = pendingAttachments.some((p) => p.status === 'uploading');
  const readyAttachments = pendingAttachments.filter((p) => p.status === 'ready');
  const sendDisabled =
    isStreaming ||
    anyUploading ||
    (!input.trim() && readyAttachments.length === 0);

  const onPickFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    for (const file of files) {
      const localKey = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const kind: PendingAttachment['kind'] = file.type.startsWith('image/')
        ? 'image'
        : file.type === 'application/pdf'
          ? 'pdf'
          : 'unknown';
      setPendingAttachments((prev) => [
        ...prev,
        { localKey, name: file.name, kind, status: 'uploading' },
      ]);

      const fd = new FormData();
      fd.append('thread_id', threadId);
      fd.append('file', file);

      try {
        const res = await uploadChatAttachment(fd);
        if (res.ok) {
          setPendingAttachments((prev) =>
            prev.map((p) =>
              p.localKey === localKey
                ? { ...p, id: res.id, kind: res.kind, status: 'ready' }
                : p,
            ),
          );
        } else {
          setPendingAttachments((prev) =>
            prev.map((p) =>
              p.localKey === localKey
                ? { ...p, status: 'error', error: res.message ?? res.error }
                : p,
            ),
          );
          toast.error(res.message ?? `Upload failed: ${res.error}`);
        }
      } catch (err) {
        console.error('[upload attachment]', err);
        setPendingAttachments((prev) =>
          prev.map((p) =>
            p.localKey === localKey
              ? { ...p, status: 'error', error: 'upload_failed' }
              : p,
          ),
        );
        toast.error('Upload failed.');
      }
    }
  };

  const removePending = (localKey: string) => {
    setPendingAttachments((prev) => prev.filter((p) => p.localKey !== localKey));
  };

  const send = async () => {
    const text = input.trim();
    const attachmentIds = readyAttachments
      .map((p) => p.id)
      .filter((id): id is string => typeof id === 'string');
    if ((!text && attachmentIds.length === 0) || isStreaming || anyUploading)
      return;

    const userMsgId = `local-user-${Date.now()}`;
    const assistantMsgId = `local-assistant-${Date.now()}`;
    const visibleText =
      text ||
      (attachmentIds.length > 0
        ? `(attached ${attachmentIds.length} file${attachmentIds.length === 1 ? '' : 's'})`
        : '');
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: visibleText },
      { id: assistantMsgId, role: 'assistant', content: '', pending: true },
    ]);
    setInput('');
    setPendingAttachments((prev) => prev.filter((p) => p.status !== 'ready'));
    setIsStreaming(true);

    try {
      const res = await fetch(`/api/chat/${threadId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text, attachmentIds }),
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

  const fillStarter = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-white/10 bg-card/30 px-6 py-12 text-center sm:py-16">
              <span className="flex size-12 items-center justify-center rounded-full border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-indigo-300">
                <Sparkles className="size-5" strokeWidth={1.5} />
              </span>
              <div className="flex max-w-md flex-col gap-2">
                <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
                  Ask anything about your job search
                </h2>
                <p className="text-sm text-muted-foreground">
                  I have full context of your applications, scores, gaps, and assessment.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => fillStarter(p)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-white/20 hover:bg-card/60 hover:text-foreground"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </div>
      </div>

      <footer className="border-t border-white/5 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pendingAttachments.map((p) => (
                <AttachmentPill
                  key={p.localKey}
                  pending={p}
                  onRemove={() => removePending(p.localKey)}
                />
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <div className="flex flex-1 items-end gap-2 rounded-2xl border border-white/10 bg-card/40 p-2 transition-colors focus-within:border-white/20">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                multiple
                hidden
                onChange={onPickFiles}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming}
                aria-label="Attach file"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Paperclip className="size-4" strokeWidth={1.5} />
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={isStreaming}
                placeholder={
                  isStreaming
                    ? 'Agent is replying…'
                    : 'Ask about your applications, scores, gaps…'
                }
                rows={2}
                className="min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={sendDisabled}
                aria-label="Send"
                className="inline-flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_0_0_rgba(99,102,241,0)] transition-all hover:bg-primary/90 hover:shadow-[0_0_18px_-2px_rgba(99,102,241,0.6)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <Send className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <p className="hidden px-1 text-[10px] text-muted-foreground/60 lg:block">
            <span className="font-mono">Cmd+Enter</span> to send
          </p>
        </div>
      </footer>
    </>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';
  const isPendingEmpty = message.pending && !message.content;

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 sm:gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tracking-tight',
          isUser
            ? 'border-indigo-400/30 bg-gradient-to-br from-indigo-500/40 to-purple-500/30 text-foreground'
            : 'border-white/10 bg-card/60 text-indigo-300',
        )}
        aria-hidden
      >
        {isUser ? 'You' : <Sparkles className="size-3.5" strokeWidth={1.5} />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-md border-primary/20 bg-primary/15 text-foreground'
            : 'rounded-bl-md border-white/10 bg-card/60 text-foreground',
        )}
      >
        {isPendingEmpty ? (
          <div className="flex items-center gap-1 py-1" aria-label="Thinking">
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
}

function AttachmentPill({
  pending,
  onRemove,
}: {
  pending: PendingAttachment;
  onRemove: () => void;
}) {
  const Icon =
    pending.kind === 'image'
      ? ImageIcon
      : pending.kind === 'pdf'
        ? FileText
        : FileText;
  return (
    <span
      className={cn(
        'inline-flex max-w-[260px] items-center gap-2 rounded-lg border bg-card/60 px-2.5 py-1.5 text-[11px]',
        pending.status === 'error'
          ? 'border-red-500/40 bg-red-500/[0.06] text-red-300'
          : 'border-white/10 text-foreground',
      )}
      title={pending.status === 'error' ? pending.error : pending.name}
    >
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-md',
          pending.status === 'error'
            ? 'bg-red-500/10 text-red-300'
            : 'bg-white/[0.04] text-muted-foreground',
        )}
      >
        {pending.status === 'uploading' ? (
          <Loader2 className="size-3 animate-spin" strokeWidth={1.5} />
        ) : (
          <Icon className="size-3" strokeWidth={1.5} />
        )}
      </span>
      <span className="truncate">{pending.name}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${pending.name}`}
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground"
      >
        <X className="size-3" strokeWidth={1.5} />
      </button>
    </span>
  );
}
