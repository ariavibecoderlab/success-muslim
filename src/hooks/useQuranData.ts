import { useState, useEffect, useCallback } from 'react';
import { notifyQuranTargetMet, notifyStreakMilestone } from '@/lib/family-feed';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface QuranPrefs {
  tracker_enabled: boolean;
  daily_goal_pages: number;
  font_size: number;
  translation_lang: string;
  last_surah: number;
  last_ayah: number;
  night_mode: boolean;
  memorization_enabled: boolean;
  daily_memo_goal: number;
  daily_target_type: string | null;
  target_selected_at: string | null;
}

const DEFAULT_PREFS: QuranPrefs = {
  tracker_enabled: false,
  daily_goal_pages: 4,
  font_size: 24,
  translation_lang: 'en',
  last_surah: 1,
  last_ayah: 1,
  night_mode: false,
  memorization_enabled: false,
  daily_memo_goal: 3,
  daily_target_type: null,
  target_selected_at: null,
};

const LOCAL_KEY = 'quran_prefs_v2';

export function useQuranPrefs() {
  const { user } = useAuth();
  const [prefs, setPrefsState] = useState<QuranPrefs>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
    } catch { return { ...DEFAULT_PREFS }; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('quran_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        const p: QuranPrefs = {
          tracker_enabled: data.tracker_enabled ?? false,
          daily_goal_pages: data.daily_goal_pages ?? 4,
          font_size: data.font_size ?? 24,
          translation_lang: data.translation_lang ?? 'en',
          last_surah: data.last_surah ?? 1,
          last_ayah: data.last_ayah ?? 1,
          night_mode: data.night_mode ?? false,
          memorization_enabled: data.memorization_enabled ?? false,
          daily_memo_goal: data.daily_memo_goal ?? 3,
          daily_target_type: (data as any).daily_target_type ?? null,
          target_selected_at: (data as any).target_selected_at ?? null,
        };
        setPrefsState(p);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(p));
      }
      setLoading(false);
    })();
  }, [user]);

  const savePrefs = useCallback(async (updates: Partial<QuranPrefs>) => {
    const merged = { ...prefs, ...updates };
    setPrefsState(merged);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));

    if (!user) return;
    await supabase.from('quran_preferences').upsert({
      user_id: user.id,
      tracker_enabled: merged.tracker_enabled,
      daily_goal_pages: merged.daily_goal_pages,
      font_size: merged.font_size,
      translation_lang: merged.translation_lang,
      last_surah: merged.last_surah,
      last_ayah: merged.last_ayah,
      night_mode: merged.night_mode,
      memorization_enabled: merged.memorization_enabled,
      daily_memo_goal: merged.daily_memo_goal,
      daily_target_type: merged.daily_target_type,
      target_selected_at: merged.target_selected_at,
    } as any, { onConflict: 'user_id' });
  }, [prefs, user]);

  return { prefs, savePrefs, loading };
}

// ─── Daily Target Hook ────────────────────────────────────────────────────────

export interface DailyLogEntry {
  id: string;
  date: string;
  target_met: boolean;
  surah_number: number | null;
  ayah_number: number | null;
}

export function useQuranDailyTarget() {
  const { user } = useAuth();
  const { prefs, savePrefs, loading: prefsLoading } = useQuranPrefs();
  const [log, setLog] = useState<DailyLogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const loadLog = useCallback(async () => {
    if (!user) { setLogLoading(false); return; }
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const { data } = await supabase
      .from('quran_daily_log' as any)
      .select('*')
      .eq('user_id', user.id)
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: false });
    setLog((data || []) as unknown as DailyLogEntry[]);
    setLogLoading(false);
  }, [user]);

  useEffect(() => { loadLog(); }, [loadLog]);

  const todayEntry = log.find(e => e.date === today) ?? null;
  const isDoneToday = todayEntry?.target_met ?? false;

  // Streak: consecutive days ending today (or yesterday) with target_met
  const streak = (() => {
    const metDates = new Set(log.filter(e => e.target_met).map(e => e.date));
    let count = 0;
    const d = new Date();
    // If today not done yet, start from yesterday
    if (!metDates.has(today)) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().split('T')[0];
      if (metDates.has(key)) { count++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return count;
  })();

  const daysDone = log.filter(e => e.target_met).length;

  const markTodayDone = async (surahNumber?: number, ayahNumber?: number) => {
    if (!user) return;
    const wasAlreadyDone = isDoneToday;
    await supabase.from('quran_daily_log' as any).upsert({
      user_id: user.id,
      date: today,
      target_met: true,
      surah_number: surahNumber ?? null,
      ayah_number: ayahNumber ?? null,
    }, { onConflict: 'user_id,date' });
    if (surahNumber) {
      await savePrefs({ last_surah: surahNumber, last_ayah: ayahNumber ?? 1 });
    }
    loadLog();

    // Post to family feed (fire-and-forget, only on first completion today)
    if (!wasAlreadyDone) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
      const name = profile?.display_name || 'A member';
      await notifyQuranTargetMet(user.id, name);
      // Also check for streak milestones after reload
      const newStreak = streak + 1;
      if ([7, 14, 21, 30, 60, 100].includes(newStreak)) {
        await notifyStreakMilestone(user.id, name, newStreak);
      }
    }
  };

  const selectTarget = async (targetType: string) => {
    await savePrefs({
      daily_target_type: targetType,
      target_selected_at: new Date().toISOString(),
    });
  };

  return {
    prefs,
    savePrefs,
    loading: prefsLoading || logLoading,
    log,
    todayEntry,
    isDoneToday,
    streak,
    daysDone,
    markTodayDone,
    selectTarget,
  };
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export interface Bookmark {
  id: string;
  surah_number: number;
  ayah_number: number;
  note: string | null;
  created_at: string;
}

export function useQuranBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('quran_bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setBookmarks(data as any);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const addBookmark = async (surah: number, ayah: number, note?: string) => {
    if (!user) return;
    await supabase.from('quran_bookmarks').insert({
      user_id: user.id,
      surah_number: surah,
      ayah_number: ayah,
      note: note || null,
    } as any);
    load();
  };

  const removeBookmark = async (id: string) => {
    await supabase.from('quran_bookmarks').delete().eq('id', id);
    load();
  };

  const isBookmarked = (surah: number, ayah: number) =>
    bookmarks.some(b => b.surah_number === surah && b.ayah_number === ayah);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, reload: load };
}

// useQuranSessions removed — real session tracking now happens in SurahReader
// via quran_reading_sessions table (start/end surah+ayah, duration) on unmount.

// ─── Memorization ─────────────────────────────────────────────────────────────

export function useQuranMemorization() {
  const { user } = useAuth();
  const [memorized, setMemorized] = useState<{ surah_number: number; ayah_number: number }[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('quran_memorization')
      .select('surah_number, ayah_number')
      .eq('user_id', user.id);
    if (data) setMemorized(data as any);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggleMemorized = async (surah: number, ayah: number) => {
    if (!user) return;
    const existing = memorized.find(m => m.surah_number === surah && m.ayah_number === ayah);
    if (existing) {
      await supabase.from('quran_memorization').delete()
        .eq('user_id', user.id)
        .eq('surah_number', surah)
        .eq('ayah_number', ayah);
    } else {
      await supabase.from('quran_memorization').insert({
        user_id: user.id,
        surah_number: surah,
        ayah_number: ayah,
      } as any);
    }
    load();
  };

  const isMemorized = (surah: number, ayah: number) =>
    memorized.some(m => m.surah_number === surah && m.ayah_number === ayah);

  const totalMemorized = memorized.length;

  return { memorized, toggleMemorized, isMemorized, totalMemorized, reload: load };
}
