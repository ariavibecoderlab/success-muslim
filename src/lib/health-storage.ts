import { format } from 'date-fns';

// ── Types ──────────────────────────────────────────

export interface BMIData {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  bmi: number;
  tdee: number;
  date: string;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface HydrationDay {
  cups: number;
  goal: number;
}

export interface SleepEntry {
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number; // hours
}

export interface IFSession {
  mode: string;
  startTime: string;
  endTime: string | null;
  completed: boolean;
}

export interface IFActive {
  mode: string;
  startTime: string;
  fastingHours: number;
}

// ── Keys ───────────────────────────────────────────

const KEYS = {
  bmi: 'health_bmi',
  weightLog: 'health_weight_log',
  weightGoal: 'health_weight_goal',
  hydration: 'health_hydration',
  sleep: 'health_sleep',
  fasting: 'health_fasting',
  ifSessions: 'health_if_sessions',
  ifActive: 'health_if_active',
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

export const todayKey = () => format(new Date(), 'yyyy-MM-dd');

// ── BMI ────────────────────────────────────────────

export function getBMI(): BMIData | null {
  return get<BMIData | null>(KEYS.bmi, null);
}

export function saveBMI(data: BMIData) {
  set(KEYS.bmi, data);
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return +(weightKg / (heightM * heightM)).toFixed(1);
}

export function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
  if (bmi < 25) return { label: 'Normal', color: 'text-primary' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-500' };
  return { label: 'Obese', color: 'text-destructive' };
}

export function calculateTDEE(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female', activity: string): number {
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  const multipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  return Math.round(bmr * (multipliers[activity] || 1.2));
}

// ── Weight ─────────────────────────────────────────

export function getWeightLog(): WeightEntry[] {
  return get<WeightEntry[]>(KEYS.weightLog, []);
}

export function addWeightEntry(entry: WeightEntry) {
  const log = getWeightLog().filter(e => e.date !== entry.date);
  log.push(entry);
  log.sort((a, b) => a.date.localeCompare(b.date));
  set(KEYS.weightLog, log);
}

export function getWeightGoal(): number | null {
  return get<number | null>(KEYS.weightGoal, null);
}

export function setWeightGoal(goal: number) {
  set(KEYS.weightGoal, goal);
}

// ── Hydration ──────────────────────────────────────

export function getHydration(dateKey?: string): HydrationDay {
  const all = get<Record<string, HydrationDay>>(KEYS.hydration, {});
  const key = dateKey || todayKey();
  return all[key] || { cups: 0, goal: 8 };
}

export function addCup(dateKey?: string) {
  const all = get<Record<string, HydrationDay>>(KEYS.hydration, {});
  const key = dateKey || todayKey();
  const day = all[key] || { cups: 0, goal: 8 };
  day.cups += 1;
  all[key] = day;
  set(KEYS.hydration, all);
}

export function removeCup(dateKey?: string) {
  const all = get<Record<string, HydrationDay>>(KEYS.hydration, {});
  const key = dateKey || todayKey();
  const day = all[key] || { cups: 0, goal: 8 };
  day.cups = Math.max(0, day.cups - 1);
  all[key] = day;
  set(KEYS.hydration, all);
}

export function setHydrationGoal(goal: number) {
  const all = get<Record<string, HydrationDay>>(KEYS.hydration, {});
  const key = todayKey();
  const day = all[key] || { cups: 0, goal: 8 };
  day.goal = goal;
  all[key] = day;
  set(KEYS.hydration, all);
}

export function getHydrationHistory(days: number = 7): { date: string; cups: number }[] {
  const all = get<Record<string, HydrationDay>>(KEYS.hydration, {});
  const result: { date: string; cups: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = format(d, 'yyyy-MM-dd');
    result.push({ date: format(d, 'EEE'), cups: all[key]?.cups || 0 });
  }
  return result;
}

// ── Sleep ──────────────────────────────────────────

export function getSleepLog(): SleepEntry[] {
  return get<SleepEntry[]>(KEYS.sleep, []);
}

export function addSleepEntry(entry: SleepEntry) {
  const log = getSleepLog().filter(e => e.date !== entry.date);
  log.push(entry);
  log.sort((a, b) => a.date.localeCompare(b.date));
  set(KEYS.sleep, log);
}

export function calculateSleepDuration(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let diff = (wh * 60 + wm) - (bh * 60 + bm);
  if (diff < 0) diff += 24 * 60;
  return +(diff / 60).toFixed(1);
}

export function sleepQuality(hours: number): { label: string; color: string } {
  if (hours < 6) return { label: 'Poor', color: 'text-destructive' };
  if (hours < 7) return { label: 'Fair', color: 'text-amber-500' };
  if (hours <= 9) return { label: 'Good', color: 'text-primary' };
  return { label: 'Too much', color: 'text-blue-500' };
}

// ── Sunnah Fasting ─────────────────────────────────

export function getFastingLog(): Record<string, boolean> {
  return get<Record<string, boolean>>(KEYS.fasting, {});
}

export function toggleFasting(dateKey: string) {
  const log = getFastingLog();
  log[dateKey] = !log[dateKey];
  if (!log[dateKey]) delete log[dateKey];
  set(KEYS.fasting, log);
}

// ── Intermittent Fasting ───────────────────────────

export function getIFSessions(): IFSession[] {
  return get<IFSession[]>(KEYS.ifSessions, []);
}

export function getActiveIF(): IFActive | null {
  return get<IFActive | null>(KEYS.ifActive, null);
}

export function startIF(mode: string, fastingHours: number) {
  set(KEYS.ifActive, { mode, startTime: new Date().toISOString(), fastingHours });
}

export function stopIF(completed: boolean) {
  const active = getActiveIF();
  if (!active) return;
  const sessions = getIFSessions();
  sessions.unshift({
    mode: active.mode,
    startTime: active.startTime,
    endTime: new Date().toISOString(),
    completed,
  });
  set(KEYS.ifSessions, sessions.slice(0, 10));
  localStorage.removeItem(KEYS.ifActive);
}
