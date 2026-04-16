import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import {
  getHydration, addCup, removeCup, getHydrationHistory,
  getSleepLog, addSleepEntry,
  getBMI, saveBMI,
  getWeightLog, addWeightEntry,
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
      const data = await api<any>('api-health', { params: { resource: 'hydration', date: key } });
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
      const key = dateKey || todayKey();
      addCup(key);
      if (user) {
        const local = getHydration(key);
        await api('api-health', { method: 'POST', params: { resource: 'hydration' }, body: { date: key, cups: local.cups, goal: local.goal } });
      }
    },
    onSuccess: (_, dateKey) => {
      const key = dateKey || todayKey();
      queryClient.invalidateQueries({ queryKey: ['health-hydration', user?.id ?? 'anon', key] });
      queryClient.invalidateQueries({ queryKey: ['health-hydration-history', user?.id ?? 'anon'] });
    },
  });

  const removeCupMutation = useMutation({
    mutationFn: async (dateKey?: string) => {
      const key = dateKey || todayKey();
      removeCup(key);
      if (user) {
        const local = getHydration(key);
        await api('api-health', { method: 'POST', params: { resource: 'hydration' }, body: { date: key, cups: local.cups, goal: local.goal } });
      }
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
      const data = await api<any[]>('api-health', { params: { resource: 'hydration', days: String(days) } });
      if (!data?.length) return getHydrationHistory(days);
      const dbMap = new Map(data.map((r: any) => [r.date, r.cups]));
      const today = new Date();
      const dates: string[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return dates.map(date => {
        const d = new Date(date + 'T00:00:00');
        return { date: dayLabels[d.getDay()], cups: dbMap.get(date) ?? 0 };
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
      const data = await api<any[]>('api-health', { params: { resource: 'sleep' } });
      if (!data?.length) return getSleepLog();
      return data.map(r => ({ date: r.date, bedtime: r.bedtime, wakeTime: r.wake_time, duration: Number(r.duration) }));
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
      if (user) {
        await api('api-health', { method: 'POST', params: { resource: 'sleep' }, body: entry });
      }
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
      const data = await api<any>('api-health', { params: { resource: 'bmi' } });
      if (!data) return getBMI();
      return {
        weight: Number(data.weight), height: Number(data.height), age: data.age,
        gender: data.gender as 'male' | 'female',
        activityLevel: data.activity_level as BMIData['activityLevel'],
        bmi: Number(data.bmi), tdee: data.tdee, date: data.updated_at,
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
      if (user) {
        await api('api-health', { method: 'POST', params: { resource: 'bmi' }, body: data });
      }
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
      const data = await api<any[]>('api-health', { params: { resource: 'weight' } });
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
      if (user) {
        await api('api-health', { method: 'POST', params: { resource: 'weight' }, body: entry });
      }
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
      const data = await api<any[]>('api-health', { params: { resource: 'fasting' } });
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
      const wasFasting = !!getFastingLog()[dateKey];
      toggleFasting(dateKey);
      if (user) {
        await api('api-health', { method: 'POST', params: { resource: 'fasting' }, body: { date: dateKey, isFasting: !wasFasting } });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-fasting', user?.id ?? 'anon'] });
    },
  });
}
