import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  topic: 'deen' | 'health' | 'productivity' | 'general';
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Array<{ ref: string; text?: string }>;
  created_at: string;
}

/** All non-archived conversations for the current user. */
export function useAIConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['ai', 'conversations', user?.id ?? 'anon'],
    queryFn: () => api<AIConversation[]>('api-ai', {
      params: { resource: 'conversations' },
    }),
    enabled: !!user,
  });
}

/** Messages for a conversation. Pass null before a conversation exists. */
export function useAIMessages(conversationId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['ai', 'messages', conversationId ?? 'none'],
    queryFn: () => api<AIMessage[]>('api-ai', {
      params: { resource: 'messages', conversationId: conversationId! },
    }),
    enabled: !!user && !!conversationId,
  });
}

/**
 * Send a message to the Deen companion. If `conversationId` is omitted a
 * new conversation is created server-side and its id is returned.
 */
export function useSendAIMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { conversationId?: string; message: string; topic?: string }) =>
      api<{ conversationId: string; message: AIMessage }>('api-ai', {
        method: 'POST',
        params: { resource: 'chat' },
        body: args,
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['ai', 'messages', res.conversationId] });
      qc.invalidateQueries({ queryKey: ['ai', 'conversations'] });
    },
    onError: (e) => toast.error(
      e instanceof Error && e.message.includes('ANTHROPIC_API_KEY')
        ? 'AI is not configured yet — add the Claude API key on the server.'
        : 'Message failed to send',
    ),
  });
}
