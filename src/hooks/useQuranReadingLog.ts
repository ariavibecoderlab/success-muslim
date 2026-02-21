import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQuranPrefs } from './useQuranData';
import { notifyQuranTargetMet, notifyStreakMilestone } from '@/lib/family-feed';
import {
  ayahCountInRange,
  pageCountInRange,
  juzSegmentsInRange,
  globalAyahIndex,
} from '@/lib/quran-mapping';

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

export function useQuranReadingLog() {
  const { user } = useAuth();
  const { prefs, savePrefs } = useQuranPrefs();
  const [logs, setLogs] = useState<ReadingLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const loadLogs = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const { data } = await supabase
      .from('quran_reading_log' as any)
      .select('*')
      .eq('user_id', user.id)
      .gte('date', since.toISOString().split('T')[0])
      .order('created_at', { ascending: false });
    setLogs((data || []) as unknown as ReadingLogEntry[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const todayLogs = useMemo(() => logs.filter(l => l.date === today), [logs, today]);
  const todayTotalAyahs = useMemo(() => todayLogs.reduce((s, l) => s + l.ayah_count, 0), [todayLogs]);
  const todayTotalPages = useMemo(() => todayLogs.reduce((s, l) => s + Number(l.page_count), 0), [todayLogs]);
  const allTimeTotalAyahs = useMemo(() => logs.reduce((s, l) => s + l.ayah_count, 0), [logs]);
  const allTimeTotalPages = useMemo(() => logs.reduce((s, l) => s + Number(l.page_count), 0), [logs]);
  const hasDoneToday = todayLogs.length > 0;

  // Streak: consecutive days ending today (or yesterday) with at least 1 log
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

  // Last position from most recent log's end position, fallback to prefs
  const lastPosition = useMemo(() => {
    if (logs.length > 0) {
      const latest = logs[0]; // ordered by created_at desc
      return { surah: latest.end_surah, ayah: latest.end_ayah };
    }
    return { surah: prefs.last_surah, ayah: prefs.last_ayah };
  }, [logs, prefs.last_surah, prefs.last_ayah]);

  // Last 7 days grouped
  const last7DaysLogs = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return logs.filter(l => l.date >= cutoffStr && l.date !== today);
  }, [logs, today]);

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

    await supabase.from('quran_reading_log' as any).insert({
      user_id: user.id,
      date: today,
      log_type: entry.log_type,
      start_surah: entry.start_surah,
      start_ayah: entry.start_ayah,
      end_surah: entry.end_surah,
      end_ayah: entry.end_ayah,
      ayah_count,
      page_count,
      juz_segments,
    });

    // Update last position
    await savePrefs({ last_surah: entry.end_surah, last_ayah: entry.end_ayah });

    // Backward compat: upsert quran_daily_log
    await supabase.from('quran_daily_log' as any).upsert({
      user_id: user.id,
      date: today,
      target_met: true,
      surah_number: entry.end_surah,
      ayah_number: entry.end_ayah,
    }, { onConflict: 'user_id,date' });

    // Family feed notification (first log of day)
    if (!hasDoneToday) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
      const name = profile?.display_name || 'A member';
      await notifyQuranTargetMet(user.id, name);
      const newStreak = streak + 1;
      if ([7, 14, 21, 30, 60, 100].includes(newStreak)) {
        await notifyStreakMilestone(user.id, name, newStreak);
      }
    }

    await loadLogs();
    return { ayah_count, page_count, juz_segments };
  }, [user, today, hasDoneToday, streak, savePrefs, loadLogs]);

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

    await supabase.from('quran_reading_log' as any)
      .update({ ...updates, ayah_count, page_count, juz_segments })
      .eq('id', id)
      .eq('user_id', user.id);
    await loadLogs();
  }, [user, loadLogs]);

  const deleteLog = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('quran_reading_log' as any)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    await loadLogs();
  }, [user, loadLogs]);

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
    addLog,
    updateLog,
    deleteLog,
    checkOverlap,
    reload: loadLogs,
  };
}
