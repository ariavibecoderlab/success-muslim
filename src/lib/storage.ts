import { QadaSolatSetup, QadaSolatProgress, RamadhanQadaSetup, RamadhanQadaProgress, FidyahEntry, PrayerType } from './types';

const KEYS = {
  qadaSolatSetup: 'qada_solat_setup',
  qadaSolatProgress: 'qada_solat_progress',
  ramadhanSetup: 'ramadhan_qada_setup',
  ramadhanProgress: 'ramadhan_qada_progress',
  fidyahHistory: 'fidyah_history',
};

function get<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Qada Solat
export const getQadaSetup = () => get<QadaSolatSetup>(KEYS.qadaSolatSetup);
export const saveQadaSetup = (data: QadaSolatSetup) => set(KEYS.qadaSolatSetup, data);

export const getQadaProgress = (): QadaSolatProgress => {
  return get<QadaSolatProgress>(KEYS.qadaSolatProgress) || {
    completedByPrayer: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    totalCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    dailyLogs: {},
  };
};
export const saveQadaProgress = (data: QadaSolatProgress) => set(KEYS.qadaSolatProgress, data);

export const logQadaPrayer = (prayer: PrayerType, count: number = 1) => {
  const progress = getQadaProgress();
  const today = new Date().toISOString().split('T')[0];
  
  if (!progress.dailyLogs[today]) {
    progress.dailyLogs[today] = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
  }
  
  progress.dailyLogs[today][prayer] += count;
  progress.completedByPrayer[prayer] += count;
  progress.totalCompleted += count;
  
  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];
  
  if (progress.lastCompletedDate === yesterdayKey || progress.lastCompletedDate === today) {
    progress.currentStreak = progress.lastCompletedDate === today ? progress.currentStreak : progress.currentStreak + 1;
  } else if (progress.lastCompletedDate !== today) {
    progress.currentStreak = 1;
  }
  
  progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
  progress.lastCompletedDate = today;
  
  saveQadaProgress(progress);
  return progress;
};

export const undoQadaPrayer = (prayer: PrayerType) => {
  const progress = getQadaProgress();
  const today = new Date().toISOString().split('T')[0];
  
  if (progress.dailyLogs[today]?.[prayer] > 0) {
    progress.dailyLogs[today][prayer] -= 1;
    progress.completedByPrayer[prayer] -= 1;
    progress.totalCompleted -= 1;
    saveQadaProgress(progress);
  }
  return progress;
};

// Ramadhan Qada
export const getRamadhanSetup = () => get<RamadhanQadaSetup>(KEYS.ramadhanSetup);
export const saveRamadhanSetup = (data: RamadhanQadaSetup) => set(KEYS.ramadhanSetup, data);

export const getRamadhanProgress = (): RamadhanQadaProgress => {
  return get<RamadhanQadaProgress>(KEYS.ramadhanProgress) || {
    completedDates: [],
    currentStreak: 0,
    longestStreak: 0,
  };
};
export const saveRamadhanProgress = (data: RamadhanQadaProgress) => set(KEYS.ramadhanProgress, data);

export const toggleRamadhanDay = (date: string) => {
  const progress = getRamadhanProgress();
  const idx = progress.completedDates.indexOf(date);
  if (idx >= 0) {
    progress.completedDates.splice(idx, 1);
  } else {
    progress.completedDates.push(date);
  }
  progress.completedDates.sort();

  // Calculate streaks from sorted dates
  const { current, longest } = calculateFastingStreak(progress.completedDates);
  progress.currentStreak = current;
  progress.longestStreak = Math.max(longest, progress.longestStreak);

  saveRamadhanProgress(progress);
  return progress;
};

function calculateFastingStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let streak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
      longest = Math.max(longest, streak);
    } else if (diff > 1) {
      streak = 1;
    }
  }

  // Current streak: count backwards from last date, only if last date is today or yesterday
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];
  const last = dates[dates.length - 1];

  let current = 0;
  if (last === today || last === yesterdayKey) {
    current = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      const d1 = new Date(dates[i]);
      const d2 = new Date(dates[i + 1]);
      const diff = Math.round((d2.getTime() - d1.getTime()) / 86400000);
      if (diff === 1) current++;
      else break;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

// Reset functions
export const clearQadaSetup = () => {
  localStorage.removeItem(KEYS.qadaSolatSetup);
  localStorage.removeItem(KEYS.qadaSolatProgress);
};

export const clearRamadhanSetup = () => {
  localStorage.removeItem(KEYS.ramadhanSetup);
  localStorage.removeItem(KEYS.ramadhanProgress);
};

// Export all data
export const exportAllData = () => {
  return {
    qadaSetup: getQadaSetup(),
    qadaProgress: getQadaProgress(),
    ramadhanSetup: getRamadhanSetup(),
    ramadhanProgress: getRamadhanProgress(),
    fidyahHistory: getFidyahHistory(),
    exportedAt: new Date().toISOString(),
  };
};

// Fidyah
export const getFidyahHistory = (): FidyahEntry[] => get<FidyahEntry[]>(KEYS.fidyahHistory) || [];
export const saveFidyahEntry = (entry: FidyahEntry) => {
  const history = getFidyahHistory();
  history.unshift(entry);
  set(KEYS.fidyahHistory, history);
};
