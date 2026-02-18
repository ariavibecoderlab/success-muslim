import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { DEFAULT_SETTINGS, type PrayerSettings } from '@/lib/prayer-times';

const LOCAL_KEY = 'prayer_settings_v2';

function getLocal(): PrayerSettings {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function usePrayerSettings() {
  const { user } = useAuth();
  const [settings, setSettingsState] = useState<PrayerSettings>(getLocal);
  const [loading, setLoading] = useState(true);

  // Load from DB
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('prayer_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        const s: PrayerSettings = {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || DEFAULT_SETTINGS.city,
          country: data.country || DEFAULT_SETTINGS.country,
          location_method: (data.location_method as 'gps' | 'manual') || 'manual',
          calculation_method: data.calculation_method ?? 3,
          madhab: (data.madhab as 'shafi' | 'hanafi') || 'shafi',
          mosque_fajr: data.mosque_fajr,
          mosque_dhuhr: data.mosque_dhuhr,
          mosque_asr: data.mosque_asr,
          mosque_maghrib: data.mosque_maghrib,
          mosque_isha: data.mosque_isha,
          mosque_enabled: data.mosque_enabled ?? false,
          adhan_settings: (data.adhan_settings as Record<string, any>) ?? DEFAULT_SETTINGS.adhan_settings,
        };
        setSettingsState(s);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
      }
      setLoading(false);
    })();
  }, [user]);

  const saveSettings = useCallback(async (updated: Partial<PrayerSettings>) => {
    const merged = { ...settings, ...updated };
    setSettingsState(merged);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));

    if (!user) return;

    const dbRow = {
      user_id: user.id,
      latitude: merged.latitude,
      longitude: merged.longitude,
      city: merged.city,
      country: merged.country,
      location_method: merged.location_method,
      calculation_method: merged.calculation_method,
      madhab: merged.madhab,
      mosque_fajr: merged.mosque_fajr,
      mosque_dhuhr: merged.mosque_dhuhr,
      mosque_asr: merged.mosque_asr,
      mosque_maghrib: merged.mosque_maghrib,
      mosque_isha: merged.mosque_isha,
      mosque_enabled: merged.mosque_enabled,
      adhan_settings: merged.adhan_settings,
    };

    await supabase.from('prayer_settings').upsert(dbRow as any, { onConflict: 'user_id' });
  }, [settings, user]);

  return { settings, saveSettings, loading };
}
