import { Gender, ConsistencyLevel, PrayerType, CONSISTENCY_MAP, QadaSolatSetup } from './types';

const PRAYERS: PrayerType[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function calculateQadaPrayers(
  currentAge: number,
  balighAge: number,
  gender: Gender,
  consistency: ConsistencyLevel
): { totalByPrayer: Record<PrayerType, number>; totalPrayers: number } {
  const years = currentAge - balighAge;
  if (years <= 0) return { totalByPrayer: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }, totalPrayers: 0 };

  const totalDays = years * 365;
  const consistencyPct = CONSISTENCY_MAP[consistency];
  const missedPct = 1 - consistencyPct;

  let effectiveDays = totalDays;
  if (gender === 'female') {
    const months = years * 12;
    const menstruationDays = months * 6;
    effectiveDays = totalDays - menstruationDays;
  }

  const missedDays = Math.round(effectiveDays * missedPct);
  const totalByPrayer = {} as Record<PrayerType, number>;
  PRAYERS.forEach(p => { totalByPrayer[p] = missedDays; });
  const totalPrayers = missedDays * 5;

  return { totalByPrayer, totalPrayers };
}

export function estimateCompletionDays(setup: QadaSolatSetup, completed: number): number {
  const remaining = setup.totalPrayers - completed;
  if (remaining <= 0 || setup.dailyTarget <= 0) return 0;
  return Math.ceil(remaining / setup.dailyTarget);
}

export function estimateCompletionDate(setup: QadaSolatSetup, completed: number): string {
  const days = estimateCompletionDays(setup, completed);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatYearsMonths(days: number): string {
  if (days <= 0) return 'Done!';
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (years > 0 && months > 0) return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  if (years > 0) return `${years} year${years > 1 ? 's' : ''}`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
  return `${days} day${days > 1 ? 's' : ''}`;
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function isRecommendedFastingDay(date: Date): boolean {
  const day = date.getDay();
  const dateOfMonth = date.getDate();
  return day === 1 || day === 4 || (dateOfMonth >= 13 && dateOfMonth <= 15);
}
