export type Gender = 'male' | 'female';

export type PrayerType = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type ConsistencyLevel = 'rarely' | 'sometimes' | 'often' | 'mostly';

export const CONSISTENCY_MAP: Record<ConsistencyLevel, number> = {
  rarely: 0.1,
  sometimes: 0.35,
  often: 0.6,
  mostly: 0.85,
};

export const PRAYER_NAMES: Record<PrayerType, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export interface QadaSolatSetup {
  currentAge: number;
  balighAge: number;
  gender: Gender;
  consistency: ConsistencyLevel;
  dailyTarget: number;
  totalByPrayer: Record<PrayerType, number>;
  totalPrayers: number;
  setupDate: string;
}

export interface QadaSolatProgress {
  completedByPrayer: Record<PrayerType, number>;
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  dailyLogs: Record<string, Record<PrayerType, number>>;
}

export type FastingReason = 'menstruation' | 'illness' | 'travel' | 'other';
export type FastingStrategy = 'mon-thu' | 'white-days' | 'custom';

export interface RamadhanQadaSetup {
  totalDays: number;
  reason: FastingReason;
  strategy: FastingStrategy;
  setupDate: string;
}

export interface RamadhanQadaProgress {
  completedDates: string[];
  currentStreak: number;
  longestStreak: number;
}

export interface FidyahEntry {
  id: string;
  days: number;
  costPerMeal: number;
  currency: string;
  total: number;
  date: string;
}
