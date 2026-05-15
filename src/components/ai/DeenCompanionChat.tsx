import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Sparkles, Plus } from 'lucide-react';
import { useAIMessages, useSendAIMessage, type AIMessage } from '@/hooks/useAIChat';
import { hapticLight } from '@/utils/native/haptics';

const SUGGESTIONS = [
  'Give me a dua for focus and barakah today',
  'How can I be more consistent with Subuh in jemaah?',
  'Reflect on a short ayah for me',
  'I feel spiritually low — what can I do?',
];

/**
 * Deen companion chat — a careful, grounded Islamic Q&A assistant.
 * Stateless about which conversation: pass a conversationId to resume,
 * or leave it null to start fresh (the server creates one on first send).
 */
export default function DeenCompanionChat() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const { data: messages, isLoading } = useAIMessages(conversationId);
  const send = useSendAIMessage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Optimistic local echo of the message currently in flight.
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, pending]);

  const submit = async (text: string) => {
    const message = text.trim();
    if (!message || send.isPending) return;
    hapticLight();
    setDraft('');
    setPending(message);
    try {
      const res = await send.mutateAsync({
        conversationId: conversationId ?? undefined,
        message,
        topic: 'deen',
      });
      if (!conversationId) setConversationId(res.conversationId);
    } finally {
      setPending(null);
    }
  };

  const startNew = () => {
    hapticLight();
    setConversationId(null);
    setDraft('');
  };

  const list: AIMessage[] = messages ?? [];
  const empty = list.length === 0 && !pending;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-3">
        {empty && (
          <div className="pt-6 text-center">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-semibold">Your Deen companion</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4 px-6">
              Ask about Quran, dua, or motivation. For rulings, it points you to a
              qualified scholar.
            </p>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && conversationId && (
          <div className="flex justify-center pt-6">
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          </div>
        )}

        {list.map((m) => (
          <Bubble key={m.id} role={m.role} content={m.content} />
        ))}

        {pending && <Bubble role="user" content={pending} />}
        {send.isPending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Reflecting…
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border pt-2.5">
        <div className="flex items-end gap-2">
          {conversationId && (
            <button
              onClick={startNew}
              aria-label="New conversation"
              className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(draft);
              }
            }}
            rows={1}
            placeholder="Ask your companion…"
            className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary max-h-28"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => submit(draft)}
            disabled={!draft.trim() || send.isPending}
            aria-label="Send"
            className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5">
          AI guidance — not a substitute for a qualified scholar.
        </p>
      </div>
    </div>
  );
}

function Bubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        }`}
      >
        {content}
      </div>
    </motion.div>
  );
}
