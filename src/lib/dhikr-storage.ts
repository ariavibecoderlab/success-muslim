// DB sync now handled by useDhikrMutation via api-client

export interface DhikrPreset {
  id: string;
  name: string;
  arabic: string;
  target: number;
  isCustom?: boolean;
}

export interface DhikrSession {
  presetId: string;
  count: number;
  target: number;
  date: string;
}

export interface DhikrDailyData {
  sessions: DhikrSession[];
  totalCount: number;
}

const STORAGE_KEY = 'dhikr_data';
const PRESETS_KEY = 'dhikr_presets';

export const DEFAULT_PRESETS: DhikrPreset[] = [
  { id: 'subhanallah', name: 'SubhanAllah', arabic: 'سُبْحَانَ ٱللَّهِ', target: 100 },
  { id: 'alhamdulillah', name: 'Alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّهِ', target: 100 },
  { id: 'allahuakbar', name: 'Allahu Akbar', arabic: 'ٱللَّهُ أَكْبَرُ', target: 100 },
  { id: 'lailahaillallah', name: 'La ilaha illallah', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ', target: 100 },
  { id: 'astaghfirullah', name: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ ٱللَّهَ', target: 100 },
  { id: 'salawat', name: 'Salawat', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', target: 100 },
  { id: 'hawqala', name: 'Hawqala', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّهِ', target: 100 },
];

export function getPresets(): DhikrPreset[] {
  try {
    const data = localStorage.getItem(PRESETS_KEY);
    return data ? JSON.parse(data) : DEFAULT_PRESETS;
  } catch {
    return DEFAULT_PRESETS;
  }
}

export function savePresets(presets: DhikrPreset[]) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDailyDhikr(date?: string): DhikrDailyData {
  const key = date || getTodayKey();
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return all[key] || { sessions: [], totalCount: 0 };
  } catch {
    return { sessions: [], totalCount: 0 };
  }
}

export function saveDhikrCount(presetId: string, count: number, target: number, date?: string) {
  const key = date || getTodayKey();
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const daily: DhikrDailyData = all[key] || { sessions: [], totalCount: 0 };

    const existing = daily.sessions.find(s => s.presetId === presetId);
    if (existing) {
      daily.totalCount += count - existing.count;
      existing.count = count;
    } else {
      daily.sessions.push({ presetId, count, target, date: key });
      daily.totalCount += count;
    }

    all[key] = daily;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    // Note: DB sync now handled by useDhikrMutation via api-client
  } catch {}
}

/** Calculate dhikr streak — days in a row with at least 1 count */
export function getDhikrStreak(): number {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    let streak = 0;
    const date = new Date();
    for (let i = 0; i < 365; i++) {
      const key = date.toISOString().split('T')[0];
      const daily: DhikrDailyData = all[key];
      if (daily && daily.totalCount > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
      date.setDate(date.getDate() - 1);
    }
    return streak;
  } catch {
    return 0;
  }
}

/** Get last N days of dhikr history */
export function getDhikrHistory(days: number = 7): { date: string; label: string; total: number; sessions: number }[] {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const result: { date: string; label: string; total: number; sessions: number }[] = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const daily: DhikrDailyData = all[key] || { sessions: [], totalCount: 0 };
      result.push({
        date: key,
        label: dayLabels[d.getDay()],
        total: daily.totalCount,
        sessions: daily.sessions.filter(s => s.count > 0).length,
      });
    }
    return result;
  } catch {
    return [];
  }
}
