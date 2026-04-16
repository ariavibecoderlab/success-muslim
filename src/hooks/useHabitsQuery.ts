import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import {
  getHabits, saveHabits, getHabitLog, saveHabitLog,
  getHabitStreak, getHeatmapData,
  type Habit, type HabitLog,
} from '@/lib/productivity-storage';

export function useHabits() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['habits', user?.id ?? 'anon'],
    queryFn: async () => {
      if (!user) return getHabits();
      const data = await api<any[]>('api-productivity', { params: { resource: 'habits' } });
      if (!data?.length) return getHabits();
      const habits: Habit[] = data.map(r => ({
        id: r.id, name: r.name, icon: r.icon, color: r.color, createdAt: r.created_at,
      }));
      saveHabits(habits);
      return habits;
    },
    initialData: () => getHabits(),
    staleTime: 60_000,
  });
}

export function useHabitLog() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['habit-log', user?.id ?? 'anon'],
    queryFn: async () => {
      if (!user) return getHabitLog();
      const data = await api<{ habit_id: string; date: string }[]>('api-productivity', {
        params: { resource: 'habit-log' },
      });
      if (!data?.length) return getHabitLog();
      const log: HabitLog = {};
      for (const r of data) {
        if (!log[r.date]) log[r.date] = [];
        log[r.date].push(r.habit_id);
      }
      saveHabitLog(log);
      return log;
    },
    initialData: () => getHabitLog(),
    staleTime: 60_000,
  });
}

export function useAddHabit() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { name: string; icon?: string; color?: string }) => {
      const id = crypto.randomUUID();
      const habit: Habit = {
        id, name: args.name, icon: args.icon || 'Check',
        color: args.color || 'primary', createdAt: new Date().toISOString(),
      };
      const habits = getHabits();
      habits.push(habit);
      saveHabits(habits);
      if (user) {
        await api('api-productivity', {
          method: 'POST',
          params: { resource: 'habits' },
          body: { id, name: args.name, icon: habit.icon, color: habit.color },
        });
      }
      return habits;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['habits'] }); },
  });
}

export function useDeleteHabit() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const habits = getHabits().filter(h => h.id !== id);
      saveHabits(habits);
      if (user) {
        await api('api-productivity', {
          method: 'DELETE',
          params: { resource: 'habits', id },
        });
      }
      return habits;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] });
      qc.invalidateQueries({ queryKey: ['habit-log'] });
    },
  });
}

export function useToggleHabit() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { habitId: string; date: string }) => {
      const log = getHabitLog();
      if (!log[args.date]) log[args.date] = [];
      const idx = log[args.date].indexOf(args.habitId);
      const isCompleted = idx < 0;
      if (idx >= 0) log[args.date].splice(idx, 1);
      else log[args.date].push(args.habitId);
      saveHabitLog(log);
      if (user) {
        if (isCompleted) {
          await api('api-productivity', {
            method: 'POST',
            params: { resource: 'habit-log' },
            body: { habit_id: args.habitId, date: args.date },
          });
        } else {
          await api('api-productivity', {
            method: 'DELETE',
            params: { resource: 'habit-log', habit_id: args.habitId, date: args.date },
          });
        }
      }
      return log;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['habit-log'] }); },
  });
}

export { getHabitStreak, getHeatmapData };
