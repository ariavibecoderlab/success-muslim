import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  getDailyTasks, saveDailyTasks, getTaskStreak, updateTaskNotes,
  type DailyTasks, type Task,
} from '@/lib/productivity-storage';
import { format, subDays } from 'date-fns';

function transformDbRows(date: string, rows: any[]): DailyTasks {
  return {
    date,
    tasks: rows.map(r => ({
      id: r.id,
      text: r.text,
      completed: r.completed,
      isMIT: r.is_mit,
      createdAt: r.created_at,
    })),
  };
}

export function useDailyTasks(date: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tasks', user?.id ?? 'anon', date],
    queryFn: async () => {
      if (!user) return getDailyTasks(date);
      const { data } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .order('created_at');
      if (!data?.length) return getDailyTasks(date);
      const result = transformDbRows(date, data);
      saveDailyTasks(result);
      return result;
    },
    initialData: () => getDailyTasks(date),
    staleTime: 60_000,
  });
}

export function useAddTask() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { text: string; isMIT: boolean; date: string }) => {
      const id = crypto.randomUUID();
      const task: Task = {
        id,
        text: args.text,
        completed: false,
        isMIT: args.isMIT,
        createdAt: new Date().toISOString(),
      };
      const daily = getDailyTasks(args.date);
      daily.tasks.push(task);
      saveDailyTasks(daily);
      if (user) {
        await supabase.from('daily_tasks').insert({
          id, user_id: user.id, date: args.date,
          text: args.text, is_mit: args.isMIT,
        });
      }
      return daily;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', user?.id ?? 'anon', vars.date] });
      qc.invalidateQueries({ queryKey: ['task-streak'] });
    },
  });
}

export function useToggleTask() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { taskId: string; date: string }) => {
      const daily = getDailyTasks(args.date);
      const task = daily.tasks.find(t => t.id === args.taskId);
      if (task) {
        task.completed = !task.completed;
        saveDailyTasks(daily);
        if (user) {
          await supabase.from('daily_tasks')
            .update({ completed: task.completed })
            .eq('id', args.taskId)
            .eq('user_id', user.id);
        }
      }
      return daily;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', user?.id ?? 'anon', vars.date] });
      qc.invalidateQueries({ queryKey: ['task-streak'] });
    },
  });
}

export function useDeleteTask() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { taskId: string; date: string }) => {
      const daily = getDailyTasks(args.date);
      daily.tasks = daily.tasks.filter(t => t.id !== args.taskId);
      saveDailyTasks(daily);
      if (user) {
        await supabase.from('daily_tasks')
          .delete().eq('id', args.taskId).eq('user_id', user.id);
      }
      return daily;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', user?.id ?? 'anon', vars.date] });
      qc.invalidateQueries({ queryKey: ['task-streak'] });
    },
  });
}

export function useUpdateTaskNotes() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (args: { taskId: string; notes: string; date: string }) => {
      return updateTaskNotes(args.taskId, args.notes, args.date);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', user?.id ?? 'anon', vars.date] });
    },
  });
}

export function useTaskStreak() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['task-streak', user?.id ?? 'anon'],
    queryFn: async () => {
      if (!user) return getTaskStreak();
      const startDate = format(subDays(new Date(), 365), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('daily_tasks')
        .select('date, is_mit, completed')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .order('date', { ascending: false });
      if (!data?.length) return getTaskStreak();
      const byDate: Record<string, { isMIT: boolean; completed: boolean }[]> = {};
      for (const r of data) {
        if (!byDate[r.date]) byDate[r.date] = [];
        byDate[r.date].push({ isMIT: r.is_mit, completed: r.completed });
      }
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const key = format(subDays(today, i), 'yyyy-MM-dd');
        const tasks = byDate[key];
        if (!tasks) { if (i === 0) continue; break; }
        const mits = tasks.filter(t => t.isMIT);
        if (mits.length === 0) { if (i === 0) continue; break; }
        if (mits.every(t => t.completed)) streak++;
        else { if (i === 0) continue; break; }
      }
      return streak;
    },
    initialData: () => getTaskStreak(),
    staleTime: 120_000,
  });
}
