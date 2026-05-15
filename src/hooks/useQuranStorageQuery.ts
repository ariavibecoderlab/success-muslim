import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api, apiAsync } from '@/lib/api-client';
import {
  getQuranDay, logQuranPages, todayKey,
  getTotalPagesRead, getKhatamCount, getCurrentKhatamProgress,
  getCurrentKhatamPercent, getQuranStreak, getWeeklyHistory,
  getEstimatedKhatamDays, TOTAL_PAGES,
  type QuranDayLog,
} from '@/lib/quran-storage';

function transformDbRow(row: any): QuranDayLog {
  return {
    pagesRead: row.pages_read,
    juzNumber: row.juz_number,
    surahName: row.surah_name || '',
    notes: row.notes || '',
  };
}

export function useQuranDay(date: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['quran-day', user?.id ?? 'anon', date],
    queryFn: async () => {
      if (!user) return getQuranDay(date);
      const data = await api<any[]>('api-quran', { params: { resource: 'quran-log', date } });
      if (!data?.length) return getQuranDay(date);
      const result = transformDbRow(data[0]);
      // Update localStorage
      const all = JSON.parse(localStorage.getItem('quran_log') || '{}');
      all[date] = result;
      localStorage.setItem('quran_log', JSON.stringify(all));
      return result;
    },
    initialData: () => getQuranDay(date),
    staleTime: 60_000,
  });
}

export function useLogQuranPages() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      pages: number;
      juzNumber?: number | null;
      surahName?: string;
      notes?: string;
      date: string;
    }) => {
      // localStorage
      const all = JSON.parse(localStorage.getItem('quran_log') || '{}');
      const existing = all[args.date] || { pagesRead: 0, juzNumber: null, surahName: '', notes: '' };
      existing.pagesRead = Math.max(0, args.pages);
      if (args.juzNumber !== undefined) existing.juzNumber = args.juzNumber;
      if (args.surahName !== undefined) existing.surahName = args.surahName;
      if (args.notes !== undefined) existing.notes = args.notes;
      all[args.date] = existing;
      localStorage.setItem('quran_log', JSON.stringify(all));
      // API
      if (user) {
        apiAsync('api-quran', {
          method: 'POST',
          params: { resource: 'quran-log' },
          body: {
            date: args.date,
            pages_read: existing.pagesRead,
            juz_number: existing.juzNumber,
            surah_name: existing.surahName,
            notes: existing.notes,
          },
        });
      }
      return existing as QuranDayLog;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['quran-day', user?.id ?? 'anon', vars.date] });
      qc.invalidateQueries({ queryKey: ['quran-stats'] });
    },
  });
}

export function useQuranStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['quran-stats', user?.id ?? 'anon'],
    queryFn: async () => {
      if (!user) return computeLocalStats();
      const data = await api<any[]>('api-quran', { params: { resource: 'quran-log' } });
      if (!data?.length) return computeLocalStats();
      const totalPages = data.reduce((s, r) => s + r.pages_read, 0);
      const khatamCount = Math.floor(totalPages / TOTAL_PAGES);
      const khatamProgress = totalPages % TOTAL_PAGES;
      const khatamPercent = Math.round((khatamProgress / TOTAL_PAGES) * 100);
      return {
        totalPages,
        khatamCount,
        khatamProgress,
        khatamPercent,
        streak: getQuranStreak(),
        weekly: getWeeklyHistory(),
        estDays: getEstimatedKhatamDays(),
      };
    },
    initialData: () => computeLocalStats(),
    staleTime: 120_000,
  });
}

function computeLocalStats() {
  return {
    totalPages: getTotalPagesRead(),
    khatamCount: getKhatamCount(),
    khatamProgress: getCurrentKhatamProgress(),
    khatamPercent: getCurrentKhatamPercent(),
    streak: getQuranStreak(),
    weekly: getWeeklyHistory(),
    estDays: getEstimatedKhatamDays(),
  };
}

export { TOTAL_PAGES, todayKey };
