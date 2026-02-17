export interface DhikrPreset {
  id: string;
  name: string;
  arabic: string;
  target: number;
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
  { id: 'subhanallah', name: 'SubhanAllah', arabic: 'سُبْحَانَ ٱللَّهِ', target: 33 },
  { id: 'alhamdulillah', name: 'Alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّهِ', target: 33 },
  { id: 'allahuakbar', name: 'Allahu Akbar', arabic: 'ٱللَّهُ أَكْبَرُ', target: 33 },
  { id: 'lailahaillallah', name: 'La ilaha illallah', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ', target: 99 },
  { id: 'astaghfirullah', name: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ ٱللَّهَ', target: 33 },
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

export function saveDhikrCount(presetId: string, count: number, target: number) {
  const key = getTodayKey();
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
  } catch {}
}
