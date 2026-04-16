import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from './useAuth';
import { useQuranPrefs } from './useQuranData';
import { notifyQuranTargetMet, notifyStreakMilestone } from '@/lib/family-feed';
import {
  ayahCountInRange,
  pageCountInRange,
  juzSegmentsInRange,
  globalAyahIndex,
} from '@/lib/quran-mapping';
import { gregorianToHijri } from '@/lib/hijri';
import { useMemo } from 'react';

export interface ReadingLogEntry {
  id: string;
  user_id: string;
  date: string;
  log_type: string;
  start_surah: number;
  start_ayah: number;
  end_surah: number;
  end_ayah: number;
  ayah_count: number;
  page_count: number;
  juz_segments: number[];
  created_at: string;
}

async function fetchLogs(userId: string): Promise<ReadingLogEntry[]> {
  const data = await api<any[]>('api-quran', { params: { resource: 'reading-log', days: '90' } });
  return (data || []) as ReadingLogEntry[];
}

export function useQuranReadingLog() {
  const { user } = useAuth();
  const { prefs, savePrefs } = useQuranPrefs();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split('T')[0];

  const { data: logs = [], isLoading: loading } = useQuery({
    queryKey: ['quran-log', user?.id],
    queryFn: () => fetchLogs(user!.id),
    enabled: !!user,
  });

  const todayLogs = useMemo(() => logs.filter(l => l.date === today), [logs, today]);
  const todayTotalAyahs = useMemo(() => todayLogs.reduce((s, l) => s + l.ayah_count, 0), [todayLogs]);
  const todayTotalPages = useMemo(() => todayLogs.reduce((s, l) => s + Number(l.page_count), 0), [todayLogs]);
  const allTimeTotalAyahs = useMemo(() => logs.reduce((s, l) => s + l.ayah_count, 0), [logs]);
  const allTimeTotalPages = useMemo(() => logs.reduce((s, l) => s + Number(l.page_count), 0), [logs]);
  const hasDoneToday = todayLogs.length > 0;

  const streak = useMemo(() => {
    const datesWithLogs = new Set(logs.map(l => l.date));
    let count = 0;
    const d = new Date();
    if (!datesWithLogs.has(today)) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().split('T')[0];
      if (datesWithLogs.has(key)) { count++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return count;
  }, [logs, today]);

  const lastPosition = useMemo(() => {
    const prefPos = { surah: prefs.last_surah, ayah: prefs.last_ayah };
    if (logs.length === 0) return prefPos;
    const latest = logs[0];
    const logPos = { surah: latest.end_surah, ayah: latest.end_ayah };
    const logIdx = globalAyahIndex(logPos.surah, logPos.ayah);
    const prefIdx = globalAyahIndex(prefPos.surah, prefPos.ayah);
    return prefIdx > logIdx ? prefPos : logPos;
  }, [logs, prefs.last_surah, prefs.last_ayah]);

  const last7DaysLogs = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return logs.filter(l => l.date >= cutoffStr && l.date !== today);
  }, [logs, today]);

  const hijriMonthPages = useMemo(() => {
    const now = new Date();
    const currentHijri = gregorianToHijri(now);
    return logs.reduce((sum, l) => {
      const logDate = new Date(l.date + 'T00:00:00');
      const logHijri = gregorianToHijri(logDate);
      if (logHijri.month === currentHijri.month && logHijri.year === currentHijri.year) {
        return sum + Number(l.page_count);
      }
      return sum;
    }, 0);
  }, [logs]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['quran-log', user?.id] });
  }, [queryClient, user?.id]);

  const addLog = useCallback(async (entry: {
    log_type: string;
    start_surah: number;
    start_ayah: number;
    end_surah: number;
    end_ayah: number;
  }) => {
    if (!user) return;
    
    const ayah_count = ayahCountInRange(entry.start_surah, entry.start_ayah, entry.end_surah, entry.end_ayah);
    const page_count = pageCountInRange(entry.start_surah, entry.start_ayah, entry.end_surah, entry.end_ayah);
    const juz_segments = juzSegmentsInRange(entry.start_surah, entry.start_ayah, entry.end_surah, entry.end_ayah);

    await api('api-quran', {
      method: 'POST',
      params: { resource: 'reading-log' },
      body: {
        date: today,
        log_type: entry.log_type,
        start_surah: entry.start_surah,
        start_ayah: entry.start_ayah,
        end_surah: entry.end_surah,
        end_ayah: entry.end_ayah,
        ayah_count,
        page_count,
        juz_segments,
      },
    });

    await savePrefs({ last_surah: entry.end_surah, last_ayah: entry.end_ayah });

    await api('api-quran', {
      method: 'POST',
      params: { resource: 'daily-log' },
      body: {
        date: today,
        target_met: true,
        surah_number: entry.end_surah,
        ayah_number: entry.end_ayah,
      },
    });

    if (!hasDoneToday) {
      const profile = await api<{ display_name: string } | null>('api-quran', { params: { resource: 'profile' } });
      const name = profile?.display_name || 'A member';
      await notifyQuranTargetMet(user.id, name);
      const newStreak = streak + 1;
      if ([7, 14, 21, 30, 60, 100].includes(newStreak)) {
        await notifyStreakMilestone(user.id, name, newStreak);
      }
    }

    invalidate();
    return { ayah_count, page_count, juz_segments };
  }, [user, today, hasDoneToday, streak, savePrefs, invalidate]);

  const updateLog = useCallback(async (id: string, updates: {
    start_surah: number;
    start_ayah: number;
    end_surah: number;
    end_ayah: number;
    log_type?: string;
  }) => {
    if (!user) return;
    const ayah_count = ayahCountInRange(updates.start_surah, updates.start_ayah, updates.end_surah, updates.end_ayah);
    const page_count = pageCountInRange(updates.start_surah, updates.start_ayah, updates.end_surah, updates.end_ayah);
    const juz_segments = juzSegmentsInRange(updates.start_surah, updates.start_ayah, updates.end_surah, updates.end_ayah);

    await api('api-quran', {
      method: 'PUT',
      params: { resource: 'reading-log' },
      body: { id, ...updates, ayah_count, page_count, juz_segments },
    });
    invalidate();
  }, [user, invalidate]);

  const deleteLog = useCallback(async (id: string) => {
    if (!user) return;
    await api('api-quran', {
      method: 'DELETE',
      params: { resource: 'reading-log', id },
    });
    invalidate();
  }, [user, invalidate]);

  const checkOverlap = useCallback((startS: number, startA: number, endS: number, endA: number) => {
    const newFrom = globalAyahIndex(startS, startA);
    const newTo = globalAyahIndex(endS, endA);
    return todayLogs.filter(l => {
      const lFrom = globalAyahIndex(l.start_surah, l.start_ayah);
      const lTo = globalAyahIndex(l.end_surah, l.end_ayah);
      return newFrom <= lTo && newTo >= lFrom;
    });
  }, [todayLogs]);

  return {
    logs,
    loading,
    todayLogs,
    todayTotalAyahs,
    todayTotalPages,
    allTimeTotalAyahs,
    allTimeTotalPages,
    hasDoneToday,
    streak,
    lastPosition,
    last7DaysLogs,
    hijriMonthPages,
    addLog,
    updateLog,
    deleteLog,
    checkOverlap,
    reload: invalidate,
  };
}
