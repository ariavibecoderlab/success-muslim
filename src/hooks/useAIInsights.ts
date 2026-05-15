import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

export type InsightKind = 'coaching' | 'recommendation' | 'analysis';

export interface InsightAction {
  label: string;
  pillar: string;
  why?: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  kind: InsightKind;
  period: 'daily' | 'weekly' | 'monthly';
  title: string;
  body: string;
  data: {
    trend?: 'improving' | 'steady' | 'slipping';
    highlights?: string[];
    actions?: InsightAction[];
    metrics?: Record<string, unknown>;
    // recommendation payload
    goals?: Array<{ title: string; pillar: string; target: string; rationale: string; difficulty: string }>;
    habits?: Array<{ title: string; pillar: string; cadence: string; anchor: string }>;
    summary?: string;
    // analysis payload
    patterns?: Array<{ finding: string; evidence: string; confidence: string }>;
    anomalies?: string[];
    correlations?: Array<{ between: string; direction: string; note: string }>;
  };
  model: string;
  for_date: string;
  seen_at: string | null;
  dismissed: boolean;
  created_at: string;
}

/** Stored insights feed (most recent first). Optionally filter by kind. */
export function useAIInsights(kind?: InsightKind) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['ai', 'insights', user?.id ?? 'anon', kind ?? 'all'],
    queryFn: () => api<AIInsight[]>('api-ai', {
      params: { resource: 'insights', ...(kind ? { kind } : {}) },
    }),
    enabled: !!user,
    staleTime: 5 * 60_000,
  });
}

/** Today's (or this week's) coaching insight, if one has been generated. */
export function useTodayCoaching(period: 'daily' | 'weekly' = 'daily') {
  const { data, ...rest } = useAIInsights('coaching');
  const today = new Date().toISOString().split('T')[0];
  const insight = data?.find((i) => i.period === period && i.for_date === today) ?? null;
  return { insight, ...rest };
}

/** Generate a fresh coaching insight via Claude. */
export function useGenerateCoaching() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (period: 'daily' | 'weekly' = 'daily') =>
      api<AIInsight>('api-ai', {
        method: 'POST',
        params: { resource: 'insights' },
        body: { period },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai', 'insights'] });
      toast.success('Coaching insight ready');
    },
    onError: (e) => toast.error(
      e instanceof Error && e.message.includes('ANTHROPIC_API_KEY')
        ? 'AI is not configured yet — add the Claude API key on the server.'
        : 'Could not generate insight',
    ),
  });
}

/** Generate smart goal & habit recommendations. */
export function useGenerateRecommendations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<AIInsight>('api-ai', {
      method: 'POST', params: { resource: 'recommendations' },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai', 'insights'] });
      toast.success('Recommendations ready');
    },
    onError: () => toast.error('Could not generate recommendations'),
  });
}

/** Run activity auto-analysis over wearable + ibadah data. */
export function useGenerateAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<AIInsight>('api-ai', {
      method: 'POST', params: { resource: 'analysis' },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai', 'insights'] });
      toast.success('Analysis ready');
    },
    onError: () => toast.error('Could not run analysis'),
  });
}

/** Dismiss an insight so it stops showing in the feed. */
export function useDismissInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api('api-ai', {
      method: 'POST', params: { resource: 'dismiss' }, body: { id },
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai', 'insights'] }),
  });
}
