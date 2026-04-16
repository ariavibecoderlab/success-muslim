import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api, apiAsync } from '@/lib/api-client';
import {
  getDayLog, toggleSunnahItem, getSunnahStreak, getSunnahWeekData,
  getSunnahItems, type SunnahDayLog,
} from '@/lib/sunnah-storage';

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function useSunnahLog(date?: string) {
  const { user } = useAuth();
  const key = date || getTodayKey();
  return useQuery({
    queryKey: ['sunnah', user?.id ?? 'anon', key],
    queryFn: async (): Promise<SunnahDayLog> => {
      if (!user) return getDayLog(key);
      const data = await api<any[]>('api-sunnah', { params: { date: key } });
      if (!data?.length) return getDayLog(key);
      const row = data[0];
      return {
        completed: (row.completed_items as string[]) || [],
        date: row.date,
      };
    },
    initialData: () => getDayLog(key),
    staleTime: 60_000,
  });
}

export function useSunnahToggle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { itemId: string; date?: string }) => {
      const result = toggleSunnahItem(args.itemId, args.date);
      // Sync to API instead of db-sync
      if (user) {
        apiAsync('api-sunnah', {
          method: 'POST',
          body: {
            date: args.date || getTodayKey(),
            completed_items: result.completed,
          },
        });
      }
      return result;
    },
    onSuccess: (_, vars) => {
      const key = vars.date || getTodayKey();
      queryClient.invalidateQueries({ queryKey: ['sunnah', user?.id ?? 'anon', key] });
    },
  });
}

export function useSunnahStats() {
  return {
    streak: getSunnahStreak(),
    weekData: getSunnahWeekData(),
    items: getSunnahItems(),
  };
}
