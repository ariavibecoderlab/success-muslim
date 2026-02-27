import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  getStepsToday, getStepsForDate, addStepLog, deleteStepLog,
  getStepsPrefs, getStepsHistory, getStepsStreak,
  getTotalStepsAllTime, getBestDayThisWeek, getWeeklyAverage,
  getAllLogs,
  type ActivityType, type StepLog,
} from '@/lib/steps-storage';
import { format } from 'date-fns';

function getTodayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function useStepsDay(date?: string) {
  const { user } = useAuth();
  const key = date || getTodayKey();
  const isToday = key === getTodayKey();

  return useQuery({
    queryKey: ['steps', user?.id ?? 'anon', key],
    queryFn: async (): Promise<{ total: number; logs: StepLog[] }> => {
      if (!user) return isToday ? getStepsToday() : getStepsForDate(key);
      const { data } = await supabase
        .from('steps_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', key)
        .order('logged_at');
      if (!data?.length) return isToday ? getStepsToday() : getStepsForDate(key);
      const logs: StepLog[] = data.map(r => ({
        id: r.id,
        date: r.date,
        steps: r.steps,
        activityType: r.activity_type as ActivityType,
        distanceMeters: r.distance_meters,
        caloriesBurned: r.calories_burned,
        loggedAt: r.logged_at,
        source: r.source,
      }));
      const total = logs.reduce((sum, l) => sum + l.steps, 0);
      return { total, logs };
    },
    initialData: () => isToday ? getStepsToday() : getStepsForDate(key),
    staleTime: 60_000,
  });
}

export function useStepsMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (args: { steps: number; activityType: ActivityType; date?: string }) => {
      return addStepLog(args.steps, args.activityType, undefined, args.date);
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ['steps', user?.id ?? 'anon', entry.date] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (args: { id: string; date: string }) => {
      deleteStepLog(args.id);
      return args;
    },
    onSuccess: (args) => {
      queryClient.invalidateQueries({ queryKey: ['steps', user?.id ?? 'anon', args.date] });
    },
  });

  return { addStep: addMutation, deleteStep: deleteMutation };
}

export function useStepsStats() {
  return {
    prefs: getStepsPrefs(),
    history: getStepsHistory(7),
    streak: getStepsStreak(),
    totalAllTime: getTotalStepsAllTime(),
    bestDay: getBestDayThisWeek(),
    weeklyAvg: getWeeklyAverage(),
    allLogs: getAllLogs(),
  };
}
