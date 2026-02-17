export interface PrayerTime {
  name: string;
  time: string;
  key: string;
}

export interface PrayerTimesData {
  timings: PrayerTime[];
  date: string;
  city: string;
  country: string;
}

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
  localStorage.removeItem(STORAGE_KEY); // clear cache on city change
};

const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
const PRAYER_DISPLAY: Record<string, string> = {
  Fajr: 'Subuh',
  Dhuhr: 'Zohor',
  Asr: 'Asar',
  Maghrib: 'Maghrib',
  Isha: 'Isyak',
};

export async function fetchPrayerTimes(city?: string, country?: string): Promise<PrayerTimesData | null> {
  const config = getCity();
  const c = city || config.city;
  const co = country || config.country;
  const today = new Date().toISOString().split('T')[0];

  // Check cache
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const data = JSON.parse(cached) as PrayerTimesData;
      if (data.date === today && data.city === c) return data;
    }
  } catch {}

  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(c)}&country=${encodeURIComponent(co)}&method=3`
    );
    const json = await res.json();
    if (json.code !== 200) return null;

    const timings: PrayerTime[] = PRAYER_KEYS.map(key => ({
      name: PRAYER_DISPLAY[key],
      time: json.data.timings[key],
      key,
    }));

    const result: PrayerTimesData = { timings, date: today, city: c, country: co };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    return result;
  } catch {
    return null;
  }
}

export function getCurrentPrayerIndex(timings: PrayerTime[]): number {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = timings.length - 1; i >= 0; i--) {
    const [h, m] = timings[i].time.split(':').map(Number);
    if (nowMinutes >= h * 60 + m) return i;
  }
  return -1; // before Fajr
}

export function getNextPrayerIndex(timings: PrayerTime[]): number {
  const current = getCurrentPrayerIndex(timings);
  if (current === -1) return 0;
  if (current >= timings.length - 1) return 0; // next day Fajr
  return current + 1;
}

export function formatPrayerTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}
