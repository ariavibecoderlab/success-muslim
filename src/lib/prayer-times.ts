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
  const method = settings.calculation_method ?? 3;
  const school = settings.madhab === 'hanafi' ? 1 : 0;

  let apiUrl: string;
  if (settings.latitude != null && settings.longitude != null) {
    apiUrl = `https://api.aladhan.com/v1/timings?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${method}&school=${school}`;
  } else {
    const city = settings.city || 'Kuala Lumpur';
    const country = settings.country || 'Malaysia';
    apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}&school=${school}`;
  }

  // Check cache
  const cacheKey = `${STORAGE_KEY}_${method}_${school}_${settings.latitude || settings.city}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      if (data.date === today) return data;
    }
  } catch {}

  try {
    const res = await fetch(apiUrl);
    const json = await res.json();
    if (json.code !== 200) return null;

    const mosqueKeys: Record<string, string | null | undefined> = {
      Fajr: settings.mosque_fajr,
      Dhuhr: settings.mosque_dhuhr,
      Asr: settings.mosque_asr,
      Maghrib: settings.mosque_maghrib,
      Isha: settings.mosque_isha,
    };

    const timings: PrayerTime[] = PRAYER_KEYS.map(key => ({
      name: PRAYER_DISPLAY[key],
      time: json.data.timings[key],
      key,
      mosqueTime: settings.mosque_enabled ? mosqueKeys[key] || null : null,
    }));

    const hijriData = json.data.date?.hijri;
    const hijriDate = hijriData
      ? `${hijriData.day} ${hijriData.month?.en || ''} ${hijriData.year} H`
      : undefined;

    const result: PrayerTimesData = {
      timings,
      date: today,
      city: settings.city || json.data.meta?.timezone || '',
      country: settings.country || '',
      hijriDate,
    };
    try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch {}
    return result;
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
