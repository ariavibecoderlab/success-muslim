import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from './useAuth';

const POINTS = [10, 10, 15, 20, 25, 30, 150];

function getPointsForDay(streakDay: number): number {
  return POINTS[Math.min(streakDay - 1, POINTS.length - 1)] ?? 10;
}

interface CheckinData {
  claimedToday: boolean;
  streakDay: number;
  pointsToday: number;
}

export function useDailyCheckin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, isLoading } = useQuery<CheckinData>({
    queryKey: ['daily-checkin', user?.id, today],
    queryFn: async () => {
      if (!user) return { claimedToday: false, streakDay: 0, pointsToday: 10 };

      const rows = await api<{ date: string; streak_day: number; points_earned: number }[]>('api-checkin');
      if (!rows?.length) return { claimedToday: false, streakDay: 0, pointsToday: 10 };

      const todayRow = rows.find(r => r.date === today);
      if (todayRow) {
        return { claimedToday: true, streakDay: todayRow.streak_day, pointsToday: todayRow.points_earned };
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().slice(0, 10);
      const yesterdayRow = rows.find(r => r.date === yesterdayKey);
      const currentStreak = yesterdayRow ? yesterdayRow.streak_day : 0;
      const nextDay = (currentStreak % 7) + 1;

      return { claimedToday: false, streakDay: nextDay, pointsToday: getPointsForDay(nextDay) };
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!user || !data || data.claimedToday) return;
      await api('api-checkin', {
        method: 'POST',
        body: { date: today, streak_day: data.streakDay, points_earned: data.pointsToday },
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['daily-checkin'] }); },
  });

  return {
    claimedToday: data?.claimedToday ?? false,
    streakDay: data?.streakDay ?? 0,
    pointsToday: data?.pointsToday ?? 10,
    loading: isLoading,
    claim: claimMutation.mutate,
    claiming: claimMutation.isPending,
  };
}
