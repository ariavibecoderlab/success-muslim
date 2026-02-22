import { format, subDays } from 'date-fns';
import { syncQuranLog } from './db-sync';

// ── Types ──────────────────────────────────────────

export interface QuranDayLog {
  pagesRead: number;
  juzNumber: number | null;
  surahName: string;
  notes: string;
}

// ── Constants ──────────────────────────────────────

const STORAGE_KEY = 'quran_log';
const TOTAL_PAGES = 604;
const PAGES_PER_JUZ = 20; // ~20 pages per juz

// ── Helpers ────────────────────────────────────────

function getAll(): Record<string, QuranDayLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveAll(data: Record<string, QuranDayLog>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// ── CRUD ───────────────────────────────────────────

export function getQuranDay(date?: string): QuranDayLog {
  const all = getAll();
  const key = date || todayKey();
  return all[key] || { pagesRead: 0, juzNumber: null, surahName: '', notes: '' };
}

export function logQuranPages(pages: number, juzNumber?: number | null, surahName?: string, notes?: string, dateOverride?: string): QuranDayLog {
  const key = dateOverride || todayKey();
  const all = getAll();
  const existing = all[key] || { pagesRead: 0, juzNumber: null, surahName: '', notes: '' };
  
  existing.pagesRead = Math.max(0, pages);
  if (juzNumber !== undefined) existing.juzNumber = juzNumber;
  if (surahName !== undefined) existing.surahName = surahName;
  if (notes !== undefined) existing.notes = notes;
  
  all[key] = existing;
  saveAll(all);
  syncQuranLog(key, existing.pagesRead, existing.juzNumber, existing.surahName, existing.notes);
  return existing;
}

export function addQuranPages(amount: number, dateOverride?: string): QuranDayLog {
  const key = dateOverride || todayKey();
  const current = getQuranDay(key);
  return logQuranPages(current.pagesRead + amount, current.juzNumber, current.surahName, current.notes, dateOverride);
}

// ── Stats ──────────────────────────────────────────

export function getTotalPagesRead(): number {
  const all = getAll();
  return Object.values(all).reduce((sum, day) => sum + day.pagesRead, 0);
}

export function getKhatamCount(): number {
  return Math.floor(getTotalPagesRead() / TOTAL_PAGES);
}

export function getCurrentKhatamProgress(): number {
  return getTotalPagesRead() % TOTAL_PAGES;
}

export function getCurrentKhatamPercent(): number {
  return Math.round((getCurrentKhatamProgress() / TOTAL_PAGES) * 100);
}

export function getQuranStreak(): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const key = format(subDays(today, i), 'yyyy-MM-dd');
    const day = getQuranDay(key);
    if (day.pagesRead > 0) streak++;
    else { if (i === 0) continue; break; }
  }
  return streak;
}

export function getWeeklyHistory(): { date: string; pages: number }[] {
  const result: { date: string; pages: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const key = format(d, 'yyyy-MM-dd');
    const day = getQuranDay(key);
    result.push({ date: format(d, 'EEE'), pages: day.pagesRead });
  }
  return result;
}

export function getEstimatedKhatamDays(dailyTarget: number = 4): number {
  const remaining = TOTAL_PAGES - getCurrentKhatamProgress();
  return dailyTarget > 0 ? Math.ceil(remaining / dailyTarget) : 0;
}

export { TOTAL_PAGES, PAGES_PER_JUZ };
