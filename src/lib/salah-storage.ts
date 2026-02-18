import { getTodayKey } from './calculations';
import { syncSalahLog } from './db-sync';

export type SalahStatus = 'ontime' | 'late' | 'missed' | null;

export const SALAH_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
export type SalahName = typeof SALAH_NAMES[number];

export interface DailySalahLog {
  date: string;
  prayers: Record<SalahName, { status: SalahStatus; loggedAt: string | null }>;
}

const STORAGE_KEY = 'salah_tracking';

function getAll(): Record<string, DailySalahLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, DailySalahLog>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function emptyDay(date: string): DailySalahLog {
  const prayers = {} as DailySalahLog['prayers'];
  for (const name of SALAH_NAMES) {
    prayers[name] = { status: null, loggedAt: null };
  }
  return { date, prayers };
}

export function getTodaySalah(): DailySalahLog {
  const today = getTodayKey();
  const all = getAll();
  return all[today] || emptyDay(today);
}

export function logSalah(prayer: SalahName, status: SalahStatus): DailySalahLog {
  const today = getTodayKey();
  const all = getAll();
  if (!all[today]) all[today] = emptyDay(today);

  const loggedAt = status ? new Date().toISOString() : null;
  all[today].prayers[prayer] = { status, loggedAt };

  saveAll(all);
  syncSalahLog(today, prayer, status, loggedAt);
  return all[today];
}

export function getSalahLog(date: string): DailySalahLog {
  const all = getAll();
  return all[date] || emptyDay(date);
}

/** Count how many prayers have a non-null status today */
export function getTodaySalahCount(): { logged: number; onTime: number; late: number; missed: number } {
  const log = getTodaySalah();
  let logged = 0, onTime = 0, late = 0, missed = 0;
  for (const name of SALAH_NAMES) {
    const s = log.prayers[name].status;
    if (s) {
      logged++;
      if (s === 'ontime') onTime++;
      else if (s === 'late') late++;
      else if (s === 'missed') missed++;
    }
  }
  return { logged, onTime, late, missed };
}
