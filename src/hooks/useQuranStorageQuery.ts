import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
      const { data } = await supabase
        .from('quran_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();
      if (!data) return getQuranDay(date);
      const result = transformDbRow(data);
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
      // localStorage (using existing helper without sync)
      const all = JSON.parse(localStorage.getItem('quran_log') || '{}');
      const existing = all[args.date] || { pagesRead: 0, juzNumber: null, surahName: '', notes: '' };
      existing.pagesRead = Math.max(0, args.pages);
      if (args.juzNumber !== undefined) existing.juzNumber = args.juzNumber;
      if (args.surahName !== undefined) existing.surahName = args.surahName;
      if (args.notes !== undefined) existing.notes = args.notes;
      all[args.date] = existing;
      localStorage.setItem('quran_log', JSON.stringify(all));
      // DB
      if (user) {
        await supabase.from('quran_log').upsert({
          user_id: user.id,
          date: args.date,
          pages_read: existing.pagesRead,
          juz_number: existing.juzNumber,
          surah_name: existing.surahName,
          notes: existing.notes,
        }, { onConflict: 'user_id,date' });
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
      const { data } = await supabase
        .from('quran_log')
        .select('date, pages_read')
        .eq('user_id', user.id);
      if (!data?.length) return computeLocalStats();
      // Compute from DB data
      const totalPages = data.reduce((s, r) => s + r.pages_read, 0);
      const khatamCount = Math.floor(totalPages / TOTAL_PAGES);
      const khatamProgress = totalPages % TOTAL_PAGES;
      const khatamPercent = Math.round((khatamProgress / TOTAL_PAGES) * 100);
      return {
        totalPages,
        khatamCount,
        khatamProgress,
        khatamPercent,
        streak: getQuranStreak(), // still from localStorage for simplicity
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
