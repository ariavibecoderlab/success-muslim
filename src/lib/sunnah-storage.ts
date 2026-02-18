import { syncSunnahLog } from './db-sync';

export interface SunnahItem {
  id: string;
  label: string;
  category: 'prayer' | 'dhikr' | 'quran' | 'other';
  enabled: boolean;
}

export interface SunnahDayLog {
  completed: string[];
  date: string;
}

const ITEMS_KEY = 'sunnah_items';
const LOG_KEY = 'sunnah_logs';

export const DEFAULT_SUNNAH_ITEMS: SunnahItem[] = [
  { id: 'rawatib-fajr', label: '2 Rakaat before Fajr', category: 'prayer', enabled: true },
  { id: 'rawatib-dhuhr-before', label: '4 Rakaat before Dhuhr', category: 'prayer', enabled: true },
  { id: 'rawatib-dhuhr-after', label: '2 Rakaat after Dhuhr', category: 'prayer', enabled: true },
  { id: 'rawatib-maghrib', label: '2 Rakaat after Maghrib', category: 'prayer', enabled: true },
  { id: 'rawatib-isha', label: '2 Rakaat after Isha', category: 'prayer', enabled: true },
  { id: 'dhuha', label: 'Solat Dhuha', category: 'prayer', enabled: true },
  { id: 'morning-adhkar', label: 'Morning Adhkar', category: 'dhikr', enabled: true },
  { id: 'evening-adhkar', label: 'Evening Adhkar', category: 'dhikr', enabled: true },
  { id: 'quran-tilawah', label: 'Quran Tilawah', category: 'quran', enabled: true },
  { id: 'tahajjud', label: 'Tahajjud / Qiyamullail', category: 'prayer', enabled: false },
  { id: 'witr', label: 'Solat Witr', category: 'prayer', enabled: true },
  { id: 'sadaqah', label: 'Daily Sadaqah', category: 'other', enabled: false },
];

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
    syncSunnahLog(key, log.completed);
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
