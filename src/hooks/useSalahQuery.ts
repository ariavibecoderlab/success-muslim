import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api, apiAsync } from '@/lib/api-client';
import {
  getSalahLog, logSalah, getTodaySalah, getTodaySalahCount,
  type DailySalahLog, type SalahName, type SalahStatus, SALAH_NAMES,
} from '@/lib/salah-storage';
import { getTodayKey } from '@/lib/calculations';

function emptyDay(date: string): DailySalahLog {
  const prayers = {} as DailySalahLog['prayers'];
  for (const name of SALAH_NAMES) {
    prayers[name] = { status: null, loggedAt: null };
  }
  return { date, prayers };
}

function transformDbRows(date: string, rows: any[]): DailySalahLog {
  const log = emptyDay(date);
  for (const row of rows) {
    if (SALAH_NAMES.includes(row.prayer_name as SalahName)) {
      log.prayers[row.prayer_name as SalahName] = {
        status: row.status as SalahStatus,
        loggedAt: row.logged_at,
      };
    }
  }
  return log;
}

export function useSalahLog(date: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['salah', user?.id ?? 'anon', date],
    queryFn: async () => {
      if (!user) return getSalahLog(date);
      const data = await api<any[]>('api-salah', { params: { date } });
      if (!data?.length) return getSalahLog(date);
      return transformDbRows(date, data);
    },
    initialData: () => getSalahLog(date),
    staleTime: 60_000,
  });
}

export function useSalahMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { prayer: SalahName; status: SalahStatus; date: string }) => {
      // Write localStorage
      const result = logSalah(args.prayer, args.status, args.date);
      // Sync to API (replaces db-sync)
      if (user) {
        apiAsync('api-salah', {
          method: 'POST',
          body: {
            date: args.date,
            prayer_name: args.prayer,
            status: args.status,
            logged_at: args.status ? new Date().toISOString() : null,
          },
        });
      }
      return result;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['salah', user?.id ?? 'anon', vars.date] });
    },
  });
}

export function useTodaySalahCount() {
  const today = getTodayKey();
  const { data } = useSalahLog(today);
  if (!data) return { logged: 0, onTime: 0, late: 0, missed: 0 };
  let logged = 0, onTime = 0, late = 0, missed = 0;
  for (const name of SALAH_NAMES) {
    const s = data.prayers[name].status;
    if (s) {
      logged++;
      if (s === 'ontime') onTime++;
      else if (s === 'late') late++;
      else if (s === 'missed') missed++;
    }
  }
  return { logged, onTime, late, missed };
}
