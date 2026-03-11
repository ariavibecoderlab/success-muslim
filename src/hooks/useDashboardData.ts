import { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useDhikrDaily } from './useDhikrQuery';
import { useSunnahLog } from './useSunnahQuery';
import { useHydration } from './useHealthQuery';
import { useTodaySalahCount, useSalahLog } from './useSalahQuery';
import { useDailyTasks } from './useTasksQuery';
import { useHabits, useHabitLog } from './useHabitsQuery';
import { useQuranDay } from './useQuranStorageQuery';
import { useWidgetPreferences } from './useWidgetPreferences';
import { useHijriDate } from './useHijriDate';
import { getSunnahItems } from '@/lib/sunnah-storage';
import { getTodayKey as getProdTodayKey } from '@/lib/productivity-storage';
import { getSleepLog, getFastingLog, todayKey } from '@/lib/health-storage';
import { useFastingStore } from '@/stores/fastingStore';
import { getTodayKey } from '@/lib/calculations';
import {
  calculateLifeScore,
  saveCurrentDayScore,
  getWeeklyScores,
  type LifeScoreInput,
  type LifeScore,
} from '@/lib/life-score';

interface Announcement {
  id: string;
  title: string;
  content: string;
}

function useDisplayName() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile-display-name', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user!.id)
        .single();
      const profileName = data?.display_name ?? '';
      // If profile name looks like an email handle (no spaces), prefer auth metadata
      const metaName = user!.user_metadata?.full_name || user!.user_metadata?.name || '';
      if (profileName && profileName.includes(' ')) return profileName;
      if (metaName) return metaName;
      return profileName;
    },
    enabled: !!user,
    initialData: '',
    staleTime: 5 * 60 * 1000,
  });
}

function useAnnouncements() {
  const { user } = useAuth();
  return useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data } = await supabase
        .from('announcements')
        .select('id, title, content')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);
      return (data as Announcement[]) ?? [];
    },
    enabled: !!user,
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });
}

function useLifeScore() {
  const { data: salahLog } = useSalahLog(getTodayKey());
  const salahCount = useTodaySalahCount();
  const { data: dailyDhikr } = useDhikrDaily();
  const sunnahItemsAll = getSunnahItems();
  const { data: sunnahLog } = useSunnahLog();
  const { data: hydration } = useHydration();

  const todayProd = getProdTodayKey();
  const { data: dailyTasks } = useDailyTasks(todayProd);
  const { data: habitsData = [] } = useHabits();
  const { data: habitLogData = {} } = useHabitLog();
  const { data: quranDay } = useQuranDay(todayProd);

  const dhikrCount = dailyDhikr?.totalCount ?? 0;

  const lifeScoreInput = useMemo((): LifeScoreInput => {
    const enabledSunnah = (sunnahItemsAll ?? []).filter((i: any) => i.enabled);
    const sunnahDone = (sunnahLog?.completed ?? []).filter((id: string) =>
      enabledSunnah.find((i: any) => i.id === id)
    ).length;
    const tk = todayKey();
    const fastingLog = getFastingLog();
    const sleepLog = getSleepLog();
    const todaySleep = sleepLog.find((e: any) => e.date === tk);
    const mits = (dailyTasks?.tasks ?? []).filter((t: any) => t.isMIT);

    return {
      salah: { onTime: salahCount.onTime, late: salahCount.late, logged: salahCount.logged },
      quranPagesRead: quranDay?.pagesRead ?? 0,
      sunnahEnabled: enabledSunnah.length,
      sunnahCompleted: sunnahDone,
      dhikrCount,
      isFastingToday: !!fastingLog[tk],
      hydrationCups: hydration?.cups ?? 0,
      hydrationGoal: hydration?.goal ?? 8,
      sleepHours: todaySleep?.duration ?? null,
      mitsTotal: mits.length,
      mitsCompleted: mits.filter((t: any) => t.completed).length,
      habitsTotal: habitsData.length,
      habitsDoneToday: habitLogData[todayProd]?.length || 0,
    };
  }, [salahLog, salahCount, dailyDhikr, sunnahItemsAll, sunnahLog, hydration, dailyTasks, habitsData, habitLogData, quranDay]);

  const lifeScore = useMemo(() => calculateLifeScore(lifeScoreInput), [lifeScoreInput]);
  useEffect(() => { saveCurrentDayScore(lifeScore); }, [lifeScore]);
  const weeklyScores = useMemo(() => getWeeklyScores(), [lifeScore]);

  return { lifeScore, weeklyScores, dhikrCount };
}

export function useDashboardData() {
  const { data: displayName = '' } = useDisplayName();
  const { data: announcements = [] } = useAnnouncements();
  const { lifeScore, weeklyScores, dhikrCount } = useLifeScore();
  const { isRamadan, ramadanDay } = useHijriDate();
  const { isActiveFast, activeFast } = useFastingStore();

  const widgetPrefs = useWidgetPreferences();

  return {
    displayName,
    announcements,
    lifeScore,
    weeklyScores,
    isRamadan,
    ramadanDay: ramadanDay || 0,
    activeIF: activeFast,
    widgetPrefs,
    dailyDhikrCount: dhikrCount,
  };
}
