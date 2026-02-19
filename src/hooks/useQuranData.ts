import { useState, useEffect, useCallback, useRef } from 'react';
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
};

const LOCAL_KEY = 'quran_prefs_v2';
const PROMPTED_KEY = 'quran_prompted';

export function useQuranPrefs() {
  const { user } = useAuth();
  const [prefs, setPrefsState] = useState<QuranPrefs>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
    } catch { return { ...DEFAULT_PREFS }; }
  });
  const [loading, setLoading] = useState(true);
  // Initialize prompted from localStorage so it persists across refreshes even without DB
  const [prompted, setPrompted] = useState(() => {
    try {
      return localStorage.getItem(PROMPTED_KEY) === 'true';
    } catch { return false; }
  });

  // Persist prompted to localStorage whenever it changes
  const setPromptedPersist = useCallback((val: boolean) => {
    setPrompted(val);
    try { localStorage.setItem(PROMPTED_KEY, String(val)); } catch {}
  }, []);

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
        };
        setPrefsState(p);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(p));
        // Row exists in DB = user has already been prompted
        setPromptedPersist(true);
      }
      setLoading(false);
    })();
  }, [user, setPromptedPersist]);

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
    } as any, { onConflict: 'user_id' });
  }, [prefs, user]);

  return { prefs, savePrefs, loading, prompted, setPrompted: setPromptedPersist };
}

// Bookmarks hook
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

// Reading sessions
export function useQuranSessions() {
  const { user } = useAuth();

  const logSession = useCallback(async (
    startSurah: number, startAyah: number,
    endSurah: number, endAyah: number,
    ayahsRead: number, durationSeconds: number
  ) => {
    if (!user) return;
    const pagesRead = Math.round((ayahsRead / 15) * 10) / 10; // ~15 ayahs per page
    await supabase.from('quran_reading_sessions').insert({
      user_id: user.id,
      start_surah: startSurah,
      start_ayah: startAyah,
      end_surah: endSurah,
      end_ayah: endAyah,
      pages_read: pagesRead,
      ayahs_read: ayahsRead,
      duration_seconds: durationSeconds,
    } as any);
  }, [user]);

  const getSessions = useCallback(async (days: number = 30) => {
    if (!user) return [];
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data } = await supabase
      .from('quran_reading_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', since.toISOString().split('T')[0])
      .order('created_at', { ascending: false });
    return (data || []) as any[];
  }, [user]);

  return { logSession, getSessions };
}

// Memorization hook
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
