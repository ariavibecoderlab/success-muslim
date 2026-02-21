import { format } from 'date-fns';
import { syncStepLog, syncStepLogDelete, syncStepsPrefs } from './db-sync';

// ── Types ──────────────────────────────────────────

export type ActivityType = 'walking' | 'running' | 'hiking' | 'others';

export interface StepLog {
  id: string;
  date: string;
  steps: number;
  activityType: ActivityType;
  distanceMeters: number;
  caloriesBurned: number;
  loggedAt: string;
  source: string;
}

export interface StepsPrefs {
  dailyTarget: number;
  strideLengthCm: number;
  reminderEnabled: boolean;
  reminderTime: string | null;
}

// ── Keys ───────────────────────────────────────────

const KEYS = {
  logs: 'health_steps_logs',
  prefs: 'health_steps_prefs',
};

// ── Helpers ────────────────────────────────────────

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

const todayKey = () => format(new Date(), 'yyyy-MM-dd');

function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
}

// ── Preferences ────────────────────────────────────

const DEFAULT_PREFS: StepsPrefs = {
  dailyTarget: 10000,
  strideLengthCm: 76.2,
  reminderEnabled: false,
  reminderTime: null,
};

export function getStepsPrefs(): StepsPrefs {
  return get<StepsPrefs>(KEYS.prefs, DEFAULT_PREFS);
}

export function setStepsTarget(target: number) {
  const prefs = getStepsPrefs();
  prefs.dailyTarget = target;
  set(KEYS.prefs, prefs);
  syncStepsPrefs(prefs.dailyTarget, prefs.strideLengthCm, prefs.reminderEnabled, prefs.reminderTime);
}

export function setStepsPrefs(prefs: Partial<StepsPrefs>) {
  const current = getStepsPrefs();
  const updated = { ...current, ...prefs };
  set(KEYS.prefs, updated);
  syncStepsPrefs(updated.dailyTarget, updated.strideLengthCm, updated.reminderEnabled, updated.reminderTime);
}

// ── Calculations ───────────────────────────────────

export function calcDistance(steps: number, strideCm: number): number {
  return +(steps * strideCm / 100).toFixed(0); // meters
}

export function calcCalories(steps: number): number {
  return +(steps * 0.04).toFixed(0); // kcal
}

// ── Step Logs ──────────────────────────────────────

export function getAllLogs(): StepLog[] {
  return get<StepLog[]>(KEYS.logs, []);
}

function saveAllLogs(logs: StepLog[]) {
  set(KEYS.logs, logs);
}

export function getStepsToday(): { total: number; logs: StepLog[] } {
  const today = todayKey();
  const logs = getAllLogs().filter(l => l.date === today);
  const total = logs.reduce((sum, l) => sum + l.steps, 0);
  return { total, logs };
}

export function addStepLog(steps: number, activityType: ActivityType, loggedAt?: string): StepLog {
  const prefs = getStepsPrefs();
  const now = loggedAt || new Date().toISOString();
  const entry: StepLog = {
    id: generateId(),
    date: todayKey(),
    steps,
    activityType,
    distanceMeters: calcDistance(steps, prefs.strideLengthCm),
    caloriesBurned: calcCalories(steps),
    loggedAt: now,
    source: 'manual',
  };
  const logs = getAllLogs();
  logs.push(entry);
  saveAllLogs(logs);
  syncStepLog(entry.date, entry.steps, entry.activityType, entry.distanceMeters, entry.caloriesBurned, entry.loggedAt);
  return entry;
}

export function deleteStepLog(id: string) {
  const logs = getAllLogs().filter(l => l.id !== id);
  saveAllLogs(logs);
  syncStepLogDelete(id);
}

export function getStepsHistory(days: number = 7): { date: string; label: string; steps: number }[] {
  const logs = getAllLogs();
  const result: { date: string; label: string; steps: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = format(d, 'yyyy-MM-dd');
    const dayLogs = logs.filter(l => l.date === key);
    const total = dayLogs.reduce((sum, l) => sum + l.steps, 0);
    result.push({ date: key, label: format(d, 'EEE'), steps: total });
  }
  return result;
}

export function getStepsStreak(): number {
  const prefs = getStepsPrefs();
  const logs = getAllLogs();
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = format(d, 'yyyy-MM-dd');
    const dayTotal = logs.filter(l => l.date === key).reduce((sum, l) => sum + l.steps, 0);
    if (dayTotal >= prefs.dailyTarget) {
      streak++;
    } else {
      // Don't break streak for today if it's still in progress
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

export function getTotalStepsAllTime(): number {
  return getAllLogs().reduce((sum, l) => sum + l.steps, 0);
}

export function getBestDayThisWeek(): number {
  const history = getStepsHistory(7);
  return Math.max(...history.map(h => h.steps), 0);
}

export function getWeeklyAverage(): number {
  const history = getStepsHistory(7);
  const total = history.reduce((sum, h) => sum + h.steps, 0);
  return Math.round(total / 7);
}
