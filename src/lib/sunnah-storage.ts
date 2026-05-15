// DB sync now handled by useSunnahToggle via api-client

export type SunnahCategory = 'intention' | 'morning-routine' | 'morning-dhikr' | 'selawat' | 'quran' | 'afternoon-dhikr' | 'prayer' | 'other';

export interface SunnahItem {
  id: string;
  label: string;
  category: SunnahCategory;
  enabled: boolean;
  isCustom?: boolean;
}

export interface SunnahDayLog {
  completed: string[];
  date: string;
}

export const DEFAULT_SUNNAH_ITEMS: SunnahItem[] = [
  // Daily Intentions
  { id: 'niat-allah', label: 'To please Allah', category: 'intention', enabled: true },
  { id: 'niat-sunnah', label: 'To follow Prophet Muhammad ﷺ', category: 'intention', enabled: true },
  { id: 'niat-benefit', label: 'To be beneficial to others', category: 'intention', enabled: true },
  { id: 'niat-halal', label: 'To earn halal income', category: 'intention', enabled: true },
  { id: 'niat-learn', label: 'To learn to be the best Muslim', category: 'intention', enabled: true },

  // Early Morning Routine
  { id: 'wake-early', label: 'Wake up at 4am / 5am', category: 'morning-routine', enabled: true },
  { id: 'tahajjud', label: 'Tahajjud prayer', category: 'morning-routine', enabled: true },
  { id: 'rawatib-fajr', label: '2 Rakaat before Fajr', category: 'morning-routine', enabled: true },
  { id: 'subuh-masjid', label: 'Solat Subuh at masjid', category: 'morning-routine', enabled: true },

  // Morning Dhikr (100x each)
  { id: 'morning-subhanallah', label: 'SubhanAllah – 100x', category: 'morning-dhikr', enabled: true },
  { id: 'morning-alhamdulillah', label: 'Alhamdulillah – 100x', category: 'morning-dhikr', enabled: true },
  { id: 'morning-allahuakbar', label: 'Allahu Akbar – 100x', category: 'morning-dhikr', enabled: true },
  { id: 'morning-lailaha', label: 'La ilaha illallah – 100x', category: 'morning-dhikr', enabled: true },
  { id: 'morning-istighfar', label: 'Istighfar – 100x', category: 'morning-dhikr', enabled: true },

  // Morning Selawat
  { id: 'selawat-morning', label: 'Selawat – min 100, target 1,000', category: 'selawat', enabled: true },

  // Quran & Recitations
  { id: 'yasin-morning', label: 'Recite Surah Yasin (morning)', category: 'quran', enabled: true },
  { id: 'quran-tilawah', label: 'Quran reading (min 1 ayat)', category: 'quran', enabled: true },
  { id: 'al-ikhlas-3x', label: 'Al-Ikhlas 3 times', category: 'quran', enabled: true },
  { id: 'al-mulk-sleep', label: 'Surah Al-Mulk before sleeping', category: 'quran', enabled: true },

  // Afternoon Dhikr (100x each)
  { id: 'afternoon-subhanallah', label: 'SubhanAllah – 100x', category: 'afternoon-dhikr', enabled: true },
  { id: 'afternoon-alhamdulillah', label: 'Alhamdulillah – 100x', category: 'afternoon-dhikr', enabled: true },
  { id: 'afternoon-allahuakbar', label: 'Allahu Akbar – 100x', category: 'afternoon-dhikr', enabled: true },
  { id: 'afternoon-lailaha', label: 'La ilaha illallah – 100x', category: 'afternoon-dhikr', enabled: true },
  { id: 'afternoon-istighfar', label: 'Istighfar – 100x', category: 'afternoon-dhikr', enabled: true },

  // Legacy items (kept for backwards compat, disabled by default)
  { id: 'rawatib-dhuhr-before', label: '4 Rakaat before Dhuhr', category: 'prayer', enabled: false },
  { id: 'rawatib-dhuhr-after', label: '2 Rakaat after Dhuhr', category: 'prayer', enabled: false },
  { id: 'rawatib-maghrib', label: '2 Rakaat after Maghrib', category: 'prayer', enabled: false },
  { id: 'rawatib-isha', label: '2 Rakaat after Isha', category: 'prayer', enabled: false },
  { id: 'dhuha', label: 'Solat Dhuha', category: 'prayer', enabled: false },
  { id: 'witr', label: 'Solat Witr', category: 'prayer', enabled: false },
  { id: 'sadaqah', label: 'Daily Sadaqah', category: 'other', enabled: false },
];

const ITEMS_KEY = 'sunnah_items';
const LOG_KEY = 'sunnah_logs';

export function getSunnahItems(): SunnahItem[] {
  try {
    const data = localStorage.getItem(ITEMS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SUNNAH_ITEMS;
  } catch {
    return DEFAULT_SUNNAH_ITEMS;
  }
}

export function saveSunnahItems(items: SunnahItem[]) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDayLog(date?: string): SunnahDayLog {
  const key = date || getTodayKey();
  try {
    const all = JSON.parse(localStorage.getItem(LOG_KEY) || '{}');
    return all[key] || { completed: [], date: key };
  } catch {
    return { completed: [], date: key };
  }
}

export function toggleSunnahItem(itemId: string, date?: string) {
  const key = date || getTodayKey();
  try {
    const all = JSON.parse(localStorage.getItem(LOG_KEY) || '{}');
    const log: SunnahDayLog = all[key] || { completed: [], date: key };
    const idx = log.completed.indexOf(itemId);
    if (idx >= 0) {
      log.completed.splice(idx, 1);
    } else {
      log.completed.push(itemId);
    }
    all[key] = log;
    localStorage.setItem(LOG_KEY, JSON.stringify(all));
    // Note: DB sync now handled by useSunnahToggle via api-client
    return log;
  } catch {
    return { completed: [], date: key };
  }
}

export function getSunnahStreak(): number {
  try {
    const all = JSON.parse(localStorage.getItem(LOG_KEY) || '{}');
    const items = getSunnahItems().filter(i => i.enabled);
    if (items.length === 0) return 0;

    let streak = 0;
    const date = new Date();

    while (true) {
      const key = date.toISOString().split('T')[0];
      const log: SunnahDayLog = all[key];
      if (!log || log.completed.length === 0) break;
      const enabledIds = items.map(i => i.id);
      const doneCount = log.completed.filter(id => enabledIds.includes(id)).length;
      if (doneCount / items.length >= 0.5) {
        streak++;
      } else {
        break;
      }
      date.setDate(date.getDate() - 1);
    }
    return streak;
  } catch {
    return 0;
  }
}

/** Get week consistency data for the sunnah tracker */
export function getSunnahWeekData(): { label: string; percentage: number }[] {
  const items = getSunnahItems().filter(i => i.enabled);
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: { label: string; percentage: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const log = getDayLog(key);
    const doneCount = items.length > 0
      ? log.completed.filter(id => items.find(item => item.id === id)).length
      : 0;
    const pct = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;
    result.push({ label: dayLabels[d.getDay()], percentage: pct });
  }
  return result;
}
