import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  getHydration, addCup, removeCup, setHydrationGoal, getHydrationHistory,
  getSleepLog, addSleepEntry,
  getBMI, saveBMI,
  getWeightLog, addWeightEntry, getWeightGoal, setWeightGoal,
  getFastingLog, toggleFasting,
  todayKey,
  type HydrationDay, type SleepEntry, type BMIData, type WeightEntry,
} from '@/lib/health-storage';

// ── Hydration ──────────────────────────────────────

export function useHydration(dateKey?: string) {
  const { user } = useAuth();
  const key = dateKey || todayKey();
  return useQuery({
    queryKey: ['health-hydration', user?.id ?? 'anon', key],
    queryFn: async (): Promise<HydrationDay> => {
      if (!user) return getHydration(key);
      const { data } = await supabase
        .from('hydration_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', key)
        .maybeSingle();
      if (!data) return getHydration(key);
      return { cups: data.cups, goal: data.goal };
    },
    initialData: () => getHydration(key),
    staleTime: 60_000,
  });
}

export function useHydrationMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addCupMutation = useMutation({
    mutationFn: async (dateKey?: string) => {
      addCup(dateKey);
    },
    onSuccess: (_, dateKey) => {
      const key = dateKey || todayKey();
      queryClient.invalidateQueries({ queryKey: ['health-hydration', user?.id ?? 'anon', key] });
      queryClient.invalidateQueries({ queryKey: ['health-hydration-history', user?.id ?? 'anon'] });
    },
  });

  const removeCupMutation = useMutation({
    mutationFn: async (dateKey?: string) => {
      removeCup(dateKey);
    },
    onSuccess: (_, dateKey) => {
      const key = dateKey || todayKey();
      queryClient.invalidateQueries({ queryKey: ['health-hydration', user?.id ?? 'anon', key] });
      queryClient.invalidateQueries({ queryKey: ['health-hydration-history', user?.id ?? 'anon'] });
    },
  });

  return { addCup: addCupMutation, removeCup: removeCupMutation };
}

// ── Hydration History ─────────────────────────────

export function useHydrationHistory(days: number = 7) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['health-hydration-history', user?.id ?? 'anon', days],
    queryFn: async () => {
      if (!user) return getHydrationHistory(days);
      const today = new Date();
      const dates: string[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }
      const { data } = await supabase
        .from('hydration_log')
        .select('date, cups')
        .eq('user_id', user.id)
        .in('date', dates);
      if (!data?.length) return getHydrationHistory(days);
      const dbMap = new Map(data.map(r => [r.date, r.cups]));
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return dates.map(date => {
        const d = new Date(date + 'T00:00:00');
        return {
          date: dayLabels[d.getDay()],
          cups: dbMap.get(date) ?? 0,
        };
      });
    },
    initialData: () => getHydrationHistory(days),
    staleTime: 60_000,
  });
}

// ── Sleep ──────────────────────────────────────────

export function useSleepLog() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['health-sleep', user?.id ?? 'anon'],
    queryFn: async (): Promise<SleepEntry[]> => {
      if (!user) return getSleepLog();
      const { data } = await supabase
        .from('sleep_log')
        .select('*')
        .eq('user_id', user.id)
        .order('date');
      if (!data?.length) return getSleepLog();
      return data.map(r => ({
        date: r.date,
        bedtime: r.bedtime,
        wakeTime: r.wake_time,
        duration: Number(r.duration),
      }));
    },
    initialData: getSleepLog,
    staleTime: 60_000,
  });
}

export function useSleepMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: SleepEntry) => {
      addSleepEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-sleep', user?.id ?? 'anon'] });
    },
  });
}

// ── BMI ────────────────────────────────────────────

export function useBMIData() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['health-bmi', user?.id ?? 'anon'],
    queryFn: async (): Promise<BMIData | null> => {
      if (!user) return getBMI();
      const { data } = await supabase
        .from('health_bmi')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!data) return getBMI();
      return {
        weight: Number(data.weight),
        height: Number(data.height),
        age: data.age,
        gender: data.gender as 'male' | 'female',
        activityLevel: data.activity_level as BMIData['activityLevel'],
        bmi: Number(data.bmi),
        tdee: data.tdee,
        date: data.updated_at,
      };
    },
    initialData: getBMI,
    staleTime: 60_000,
  });
}

export function useBMIMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BMIData) => {
      saveBMI(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-bmi', user?.id ?? 'anon'] });
    },
  });
}

// ── Weight ─────────────────────────────────────────

export function useWeightLog() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['health-weight', user?.id ?? 'anon'],
    queryFn: async (): Promise<WeightEntry[]> => {
      if (!user) return getWeightLog();
      const { data } = await supabase
        .from('weight_log')
        .select('*')
        .eq('user_id', user.id)
        .order('date');
      if (!data?.length) return getWeightLog();
      return data.map(r => ({ date: r.date, weight: Number(r.weight) }));
    },
    initialData: getWeightLog,
    staleTime: 60_000,
  });
}

export function useWeightMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: WeightEntry) => {
      addWeightEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-weight', user?.id ?? 'anon'] });
      queryClient.invalidateQueries({ queryKey: ['health-bmi', user?.id ?? 'anon'] });
    },
  });
}

// ── Fasting (Sunnah) ──────────────────────────────

export function useFastingLog() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['health-fasting', user?.id ?? 'anon'],
    queryFn: async (): Promise<Record<string, boolean>> => {
      if (!user) return getFastingLog();
      const { data } = await supabase
        .from('fasting_log')
        .select('date')
        .eq('user_id', user.id);
      if (!data?.length) return getFastingLog();
      const result: Record<string, boolean> = {};
      for (const r of data) result[r.date] = true;
      return result;
    },
    initialData: getFastingLog,
    staleTime: 60_000,
  });
}

export function useFastingToggle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dateKey: string) => {
      toggleFasting(dateKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-fasting', user?.id ?? 'anon'] });
    },
  });
}
