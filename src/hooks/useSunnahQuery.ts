import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
      const { data } = await supabase
        .from('sunnah_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', key)
        .maybeSingle();
      if (!data) return getDayLog(key);
      return {
        completed: (data.completed_items as string[]) || [],
        date: data.date,
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
      return toggleSunnahItem(args.itemId, args.date);
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
