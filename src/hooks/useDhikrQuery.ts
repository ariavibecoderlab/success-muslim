import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api, apiAsync } from '@/lib/api-client';
import {
  getDailyDhikr, saveDhikrCount, getDhikrStreak, getDhikrHistory,
  type DhikrDailyData,
} from '@/lib/dhikr-storage';

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function useDhikrDaily(date?: string) {
  const { user } = useAuth();
  const key = date || getTodayKey();
  return useQuery({
    queryKey: ['dhikr', user?.id ?? 'anon', key],
    queryFn: async (): Promise<DhikrDailyData> => {
      if (!user) return getDailyDhikr(key);
      const data = await api<any[]>('api-dhikr', { params: { date: key } });
      if (!data?.length) return getDailyDhikr(key);
      const sessions = data.map(r => ({
        presetId: r.preset_id,
        count: r.count,
        target: r.target,
        date: r.date,
      }));
      const totalCount = sessions.reduce((s, sess) => s + sess.count, 0);
      return { sessions, totalCount };
    },
    initialData: () => getDailyDhikr(key),
    staleTime: 60_000,
  });
}

export function useDhikrMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { presetId: string; count: number; target: number; date?: string }) => {
      saveDhikrCount(args.presetId, args.count, args.target, args.date);
      // Sync to API instead of db-sync
      if (user) {
        apiAsync('api-dhikr', {
          method: 'POST',
          body: {
            date: args.date || getTodayKey(),
            preset_id: args.presetId,
            count: args.count,
            target: args.target,
          },
        });
      }
    },
    onSuccess: (_, vars) => {
      const key = vars.date || getTodayKey();
      queryClient.invalidateQueries({ queryKey: ['dhikr', user?.id ?? 'anon', key] });
    },
  });
}

export function useDhikrStats() {
  return {
    streak: getDhikrStreak(),
    history: getDhikrHistory(7),
  };
}
