import { isMalaysia, findZoneByCity, DEFAULT_ZONE } from './jakim-zones';
import { supabase } from '@/integrations/supabase/client';

export interface PrayerTime {
  name: string;
  time: string;
  key: string;
  mosqueTime?: string | null;
}

export interface PrayerTimesData {
  timings: PrayerTime[];
  date: string;
  city: string;
  country: string;
  hijriDate?: string;
  source?: 'jakim' | 'aladhan';
}

export interface PrayerSettings {
  latitude?: number | null;
  longitude?: number | null;
  city: string;
  country: string;
  location_method: 'gps' | 'manual';
  calculation_method: number;
  madhab: 'shafi' | 'hanafi';
  mosque_fajr?: string | null;
  mosque_dhuhr?: string | null;
  mosque_asr?: string | null;
  mosque_maghrib?: string | null;
  mosque_isha?: string | null;
  mosque_enabled: boolean;
  adhan_settings: Record<string, AdhanConfig>;
}

export interface AdhanConfig {
  mode: 'full' | 'vibrate' | 'silent';
  audio: string;
  preReminder: number; // minutes before prayer
}

export const DEFAULT_SETTINGS: PrayerSettings = {
  city: 'Kuala Lumpur',
  country: 'Malaysia',
  location_method: 'manual',
  calculation_method: 3,
  madhab: 'shafi',
  mosque_enabled: false,
  adhan_settings: {
    fajr: { mode: 'full', audio: 'makkah', preReminder: 0 },
    dhuhr: { mode: 'full', audio: 'makkah', preReminder: 0 },
    asr: { mode: 'full', audio: 'makkah', preReminder: 0 },
    maghrib: { mode: 'full', audio: 'makkah', preReminder: 0 },
    isha: { mode: 'full', audio: 'makkah', preReminder: 0 },
  },
};

export const CALCULATION_METHODS: { id: number; name: string; region: string }[] = [
  { id: 3, name: 'Muslim World League', region: 'Global' },
  { id: 2, name: 'Islamic Society of North America', region: 'North America' },
  { id: 5, name: 'Egyptian General Authority', region: 'Africa / Middle East' },
  { id: 4, name: 'Umm Al-Qura University, Makkah', region: 'Saudi Arabia' },
  { id: 1, name: 'University of Islamic Sciences, Karachi', region: 'Pakistan' },
  { id: 7, name: 'Institute of Geophysics, Tehran', region: 'Iran' },
  { id: 8, name: 'Gulf Region', region: 'Gulf Countries' },
  { id: 9, name: 'Kuwait', region: 'Kuwait' },
  { id: 10, name: 'Qatar', region: 'Qatar' },
  { id: 11, name: 'Majlis Ugama Islam Singapura', region: 'Singapore' },
  { id: 12, name: 'UOIF (France)', region: 'France' },
  { id: 13, name: 'Diyanet İşleri Başkanlığı', region: 'Turkey' },
  { id: 14, name: 'Spiritual Administration of Muslims, Russia', region: 'Russia' },
  { id: 15, name: 'Moonsighting Committee Worldwide', region: 'Global (conservative)' },
  { id: 16, name: 'Dubai', region: 'UAE' },
  { id: 17, name: 'JAKIM (Malaysia)', region: 'Malaysia' },
  { id: 18, name: 'Tunisia', region: 'Tunisia' },
  { id: 19, name: 'Algeria', region: 'Algeria' },
  { id: 20, name: 'KEMENAG (Indonesia)', region: 'Indonesia' },
  { id: 21, name: 'Morocco', region: 'Morocco' },
  { id: 22, name: 'CDLR (Portugal)', region: 'Portugal' },
  { id: 23, name: 'Jordan', region: 'Jordan' },
];

export const ADHAN_OPTIONS = [
  { id: 'makkah', name: 'Makkah (Abdul Rahman Al-Sudais)' },
  { id: 'madinah', name: 'Madinah (Ali Ahmed Mulla)' },
  { id: 'alaqsa', name: 'Al-Aqsa' },
  { id: 'mishary', name: 'Mishary Rashid Alafasy' },
  { id: 'simple', name: 'Simple Tone' },
];

const COUNTRY_METHOD_MAP: Record<string, number> = {
  'indonesia': 20,  // KEMENAG
  'malaysia': 17,   // JAKIM
  'singapore': 11,  // MUIS
  'turkey': 13,     // Diyanet
  'qatar': 10,
  'kuwait': 9,
};
const DEFAULT_INTL_METHOD = 4; // Umm al-Qura

export function getMethodForCountry(country: string): number {
  return COUNTRY_METHOD_MAP[country.toLowerCase()] || DEFAULT_INTL_METHOD;
}

const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
const PRAYER_DISPLAY: Record<string, string> = {
  Fajr: 'Subuh',
  Dhuhr: 'Zohor',
  Asr: 'Asar',
  Maghrib: 'Maghrib',
  Isha: 'Isyak',
};

const STORAGE_KEY = 'prayer_times_cache';
const CITY_KEY = 'prayer_times_city';

export interface CityConfig {
  city: string;
  country: string;
}

export const getCity = (): CityConfig => {
  try {
    const data = localStorage.getItem(CITY_KEY);
    return data ? JSON.parse(data) : { city: 'Kuala Lumpur', country: 'Malaysia' };
  } catch {
    return { city: 'Kuala Lumpur', country: 'Malaysia' };
  }
};

export const saveCity = (config: CityConfig) => {
  localStorage.setItem(CITY_KEY, JSON.stringify(config));
  localStorage.removeItem(STORAGE_KEY);
};

export async function detectLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
}

export async function reverseGeocode(lat: number, lng: number): Promise<{ city: string; country: string } | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`);
    const data = await res.json();
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
    const country = data.address?.country || '';
    return { city, country };
  } catch {
    return null;
  }
}

export async function fetchPrayerTimes(settings: Partial<PrayerSettings> = {}): Promise<PrayerTimesData | null> {
  const today = new Date().toISOString().split('T')[0];
  const country = settings.country || 'Malaysia';
  const city = settings.city || 'Kuala Lumpur';

  // Check cache - include city, country, lat/lng in key for proper invalidation
  const cacheKey = `${STORAGE_KEY}_${settings.calculation_method || 3}_${settings.madhab || 'shafi'}_${city}_${country}_${settings.latitude || ''}_${settings.longitude || ''}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      if (data.date === today) return data;
    }
  } catch {}

  // Try JAKIM for Malaysian users
  if (isMalaysia(country)) {
    const jakimResult = await fetchFromJakim(city, settings);
    if (jakimResult) {
      jakimResult.date = today;
      try { localStorage.setItem(cacheKey, JSON.stringify(jakimResult)); } catch {}
      return jakimResult;
    }
  }

  // Non-Malaysian users → Aladhan API (Umm al-Qura)
  return fetchFromAladhan(settings);
}

async function fetchFromJakim(city: string, settings: Partial<PrayerSettings>): Promise<PrayerTimesData | null> {
  const zone = findZoneByCity(city) || DEFAULT_ZONE;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const headers: Record<string, string> = {
      'apikey': anonKey,
      'Content-Type': 'application/json',
    };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const res = await fetch(
      `${supabaseUrl}/functions/v1/jakim-proxy?zone=${zone}&endpoint=takwimsolat`,
      { headers }
    );
    const json = await res.json();

    if (!json.prayerTime || json.prayerTime.length === 0) return null;

    const pt = json.prayerTime[0];

    const mosqueKeys: Record<string, string | null | undefined> = {
      Fajr: settings.mosque_fajr,
      Dhuhr: settings.mosque_dhuhr,
      Asr: settings.mosque_asr,
      Maghrib: settings.mosque_maghrib,
      Isha: settings.mosque_isha,
    };

    // JAKIM returns times in HH:mm:ss format, strip seconds
    const strip = (t: string) => t ? t.substring(0, 5) : '';

    const timings: PrayerTime[] = [
      { name: 'Subuh', time: strip(pt.fajr), key: 'Fajr', mosqueTime: settings.mosque_enabled ? mosqueKeys.Fajr || null : null },
      { name: 'Zohor', time: strip(pt.dhuhr), key: 'Dhuhr', mosqueTime: settings.mosque_enabled ? mosqueKeys.Dhuhr || null : null },
      { name: 'Asar', time: strip(pt.asr), key: 'Asr', mosqueTime: settings.mosque_enabled ? mosqueKeys.Asr || null : null },
      { name: 'Maghrib', time: strip(pt.maghrib), key: 'Maghrib', mosqueTime: settings.mosque_enabled ? mosqueKeys.Maghrib || null : null },
      { name: 'Isyak', time: strip(pt.isha), key: 'Isha', mosqueTime: settings.mosque_enabled ? mosqueKeys.Isha || null : null },
    ];

    // JAKIM provides hijri date
    const hijriDate = pt.hijri || undefined;

    return {
      timings,
      date: '',
      city: settings.city || 'Kuala Lumpur',
      country: settings.country || 'Malaysia',
      hijriDate: hijriDate ? formatJakimHijri(hijriDate) : undefined,
      source: 'jakim',
    };
  } catch {
    return null;
  }
}

function formatJakimHijri(hijri: string): string {
  // JAKIM hijri format: "YYYY-MM-DD" e.g. "1447-08-19"
  const HIJRI_MONTHS = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadhan', 'Shawwal', 'Dhul Qa\'dah', 'Dhul Hijjah',
  ];
  const parts = hijri.split('-');
  if (parts.length !== 3) return hijri;
  const [year, month, day] = parts.map(Number);
  const monthName = HIJRI_MONTHS[month - 1] || '';
  return `${day} ${monthName} ${year} H`;
}

async function fetchFromAladhan(settings: Partial<PrayerSettings>): Promise<PrayerTimesData | null> {
  const city = settings.city || 'Makkah';
  const country = settings.country || 'Saudi Arabia';
  const method = settings.calculation_method ?? 4; // Umm al-Qura default for international
  const school = settings.madhab === 'hanafi' ? 1 : 0;

  try {
    const dd = String(new Date().getDate()).padStart(2, '0');
    const mm = String(new Date().getMonth() + 1).padStart(2, '0');
    const yyyy = new Date().getFullYear();
    const dateStr = `${dd}-${mm}-${yyyy}`;

    let url: string;
    if (settings.latitude != null && settings.longitude != null) {
      const ts = Math.floor(Date.now() / 1000);
      url = `https://api.aladhan.com/v1/timings/${ts}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${method}&school=${school}`;
    } else {
      url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}&school=${school}`;
    }

    const res = await fetch(url);
    const json = await res.json();
    if (json.code !== 200 || !json.data) return null;

    const t = json.data.timings;
    const strip = (v: string) => v ? v.substring(0, 5) : '';

    const mosqueKeys: Record<string, string | null | undefined> = {
      Fajr: settings.mosque_fajr,
      Dhuhr: settings.mosque_dhuhr,
      Asr: settings.mosque_asr,
      Maghrib: settings.mosque_maghrib,
      Isha: settings.mosque_isha,
    };

    const timings: PrayerTime[] = [
      { name: 'Fajr', time: strip(t.Fajr), key: 'Fajr', mosqueTime: settings.mosque_enabled ? mosqueKeys.Fajr || null : null },
      { name: 'Dhuhr', time: strip(t.Dhuhr), key: 'Dhuhr', mosqueTime: settings.mosque_enabled ? mosqueKeys.Dhuhr || null : null },
      { name: 'Asr', time: strip(t.Asr), key: 'Asr', mosqueTime: settings.mosque_enabled ? mosqueKeys.Asr || null : null },
      { name: 'Maghrib', time: strip(t.Maghrib), key: 'Maghrib', mosqueTime: settings.mosque_enabled ? mosqueKeys.Maghrib || null : null },
      { name: 'Isha', time: strip(t.Isha), key: 'Isha', mosqueTime: settings.mosque_enabled ? mosqueKeys.Isha || null : null },
    ];

    const h = json.data.date?.hijri;
    const hijriDate = h ? `${h.day} ${h.month?.en || ''} ${h.year} H` : undefined;

    return {
      timings,
      date: '',
      city,
      country,
      hijriDate,
      source: 'aladhan',
    };
  } catch {
    return null;
  }
}


export function getEffectiveTime(prayer: PrayerTime): string {
  return prayer.mosqueTime || prayer.time;
}

export function getCurrentPrayerIndex(timings: PrayerTime[]): number {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = timings.length - 1; i >= 0; i--) {
    const t = getEffectiveTime(timings[i]);
    const [h, m] = t.split(':').map(Number);
    if (nowMinutes >= h * 60 + m) return i;
  }
  return -1;
}

export function getNextPrayerIndex(timings: PrayerTime[]): number {
  const current = getCurrentPrayerIndex(timings);
  if (current === -1) return 0;
  if (current >= timings.length - 1) return 0;
  return current + 1;
}

export function formatPrayerTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function getCountdownToNextPrayer(timings: PrayerTime[], nextIdx: number): string {
  const next = timings[nextIdx];
  if (!next) return '';
  const t = getEffectiveTime(next);
  const [h, m] = t.split(':').map(Number);
  const now = new Date();
  let targetMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();
  if (targetMs <= now.getTime()) targetMs += 24 * 60 * 60 * 1000;
  const diff = targetMs - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${hours}h ${mins}m ${secs}s`;
}
