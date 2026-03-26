import { format, subDays, getDay } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  isMIT: boolean;
  notes?: string;
  createdAt: string;
}

export interface DailyTasks {
  date: string;
  tasks: Task[];
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency?: 'daily' | 'weekdays' | number[];
  createdAt: string;
}

export interface HabitLog {
  [date: string]: string[];
}

export type LifeAreaKey = 'iman' | 'health' | 'wealth' | 'family' | 'knowledge' | 'career';

export interface LifeAreaScore {
  area: LifeAreaKey;
  score: number;
}

export interface LifeAreaEntry {
  date: string;
  scores: LifeAreaScore[];
}

export const LIFE_AREAS: { key: LifeAreaKey; label: string; icon: string }[] = [
  { key: 'iman', label: 'Iman', icon: 'Moon' },
  { key: 'health', label: 'Health', icon: 'Heart' },
  { key: 'wealth', label: 'Wealth', icon: 'Wallet' },
  { key: 'family', label: 'Family', icon: 'Users' },
  { key: 'knowledge', label: 'Knowledge', icon: 'BookOpen' },
  { key: 'career', label: 'Career', icon: 'Target' },
];

// ─── Storage Keys ────────────────────────────────────────────

const TASKS_KEY = 'sm_daily_tasks';
const HABITS_KEY = 'sm_habits';
const HABIT_LOG_KEY = 'sm_habit_log';
const LIFE_AREAS_KEY = 'sm_life_areas';

// ─── Daily Tasks ─────────────────────────────────────────────

export function getTodayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getDailyTasks(date?: string): DailyTasks {
  const key = date || getTodayKey();
  const all = getAllDailyTasks();
  return all[key] || { date: key, tasks: [] };
}

function getAllDailyTasks(): Record<string, DailyTasks> {
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY) || '{}');
  } catch { return {}; }
}

function saveAllDailyTasks(data: Record<string, DailyTasks>) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(data));
}

export function saveDailyTasks(daily: DailyTasks) {
  const all = getAllDailyTasks();
  all[daily.date] = daily;
  saveAllDailyTasks(all);
}

export function addTask(text: string, isMIT: boolean, date?: string): DailyTasks {
  const d = getDailyTasks(date);
  const mitCount = d.tasks.filter(t => t.isMIT).length;
  const task: Task = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    isMIT: isMIT && mitCount < 3,
    createdAt: new Date().toISOString(),
  };
  d.tasks.push(task);
  saveDailyTasks(d);
  return d;
}

export function toggleTask(taskId: string, date?: string): DailyTasks {
  const d = getDailyTasks(date);
  const task = d.tasks.find(t => t.id === taskId);
  if (task) task.completed = !task.completed;
  saveDailyTasks(d);
  return d;
}

export function updateTaskNotes(taskId: string, notes: string, date?: string): DailyTasks {
  const d = getDailyTasks(date);
  const task = d.tasks.find(t => t.id === taskId);
  if (task) task.notes = notes;
  saveDailyTasks(d);
  return d;
}

export function deleteTask(taskId: string, date?: string): DailyTasks {
  const d = getDailyTasks(date);
  d.tasks = d.tasks.filter(t => t.id !== taskId);
  saveDailyTasks(d);
  return d;
}

export function getTaskStreak(): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const dateKey = format(subDays(today, i), 'yyyy-MM-dd');
    const d = getDailyTasks(dateKey);
    const mits = d.tasks.filter(t => t.isMIT);
    if (mits.length === 0) { if (i === 0) continue; break; }
    if (mits.every(t => t.completed)) streak++;
    else { if (i === 0) continue; break; }
  }
  return streak;
}

// ─── Habits ──────────────────────────────────────────────────

export function getHabits(): Habit[] {
  try {
    return JSON.parse(localStorage.getItem(HABITS_KEY) || '[]');
  } catch { return []; }
}

export function saveHabits(habits: Habit[]) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function addHabit(name: string, icon: string = 'Check', color: string = 'primary', frequency?: 'daily' | 'weekdays' | number[]): Habit[] {
  const habits = getHabits();
  const id = crypto.randomUUID();
  habits.push({ id, name, icon, color, frequency: frequency || 'daily', createdAt: new Date().toISOString() });
  saveHabits(habits);
  return habits;
}

export function deleteHabit(id: string): Habit[] {
  const habits = getHabits().filter(h => h.id !== id);
  saveHabits(habits);
  return habits;
}

export function getHabitLog(): HabitLog {
  try {
    return JSON.parse(localStorage.getItem(HABIT_LOG_KEY) || '{}');
  } catch { return {}; }
}

export function saveHabitLog(log: HabitLog) {
  localStorage.setItem(HABIT_LOG_KEY, JSON.stringify(log));
}

export function toggleHabitForDate(habitId: string, date?: string): HabitLog {
  const log = getHabitLog();
  const key = date || getTodayKey();
  if (!log[key]) log[key] = [];
  const idx = log[key].indexOf(habitId);
  if (idx >= 0) log[key].splice(idx, 1);
  else log[key].push(habitId);
  saveHabitLog(log);
  return log;
}

export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  const freq = habit.frequency || 'daily';
  if (freq === 'daily') return true;
  const dow = getDay(date); // 0=Sun
  if (freq === 'weekdays') return dow >= 1 && dow <= 5;
  if (Array.isArray(freq)) return freq.includes(dow);
  return true;
}

export function getHabitStreak(habitId: string): number {
  const log = getHabitLog();
  const habits = getHabits();
  const habit = habits.find(h => h.id === habitId);
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = subDays(today, i);
    const key = format(d, 'yyyy-MM-dd');
    if (habit && !isHabitScheduledForDate(habit, d)) continue;
    if (log[key]?.includes(habitId)) streak++;
    else { if (i === 0) continue; break; }
  }
  return streak;
}

export function getLongestStreak(habitId: string): number {
  const log = getHabitLog();
  const habits = getHabits();
  const habit = habits.find(h => h.id === habitId);
  let longest = 0;
  let current = 0;
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = subDays(today, i);
    const key = format(d, 'yyyy-MM-dd');
    if (habit && !isHabitScheduledForDate(habit, d)) continue;
    if (log[key]?.includes(habitId)) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

export function getHabitCompletionRate(habitId: string, days: number = 30): number {
  const log = getHabitLog();
  const habits = getHabits();
  const habit = habits.find(h => h.id === habitId);
  let scheduled = 0;
  let completed = 0;
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = subDays(today, i);
    const key = format(d, 'yyyy-MM-dd');
    if (habit && !isHabitScheduledForDate(habit, d)) continue;
    scheduled++;
    if (log[key]?.includes(habitId)) completed++;
  }
  return scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
}

export function getHeatmapData(days: number = 120): { date: string; count: number }[] {
  const log = getHabitLog();
  const result: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const key = format(subDays(today, i), 'yyyy-MM-dd');
    result.push({ date: key, count: log[key]?.length || 0 });
  }
  return result;
}

export function getHabitHeatmapData(habitId: string, days: number = 90): { date: string; done: boolean }[] {
  const log = getHabitLog();
  const result: { date: string; done: boolean }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const key = format(subDays(today, i), 'yyyy-MM-dd');
    result.push({ date: key, done: log[key]?.includes(habitId) || false });
  }
  return result;
}

// ─── Weekly Completion Data ──────────────────────────────────

export function getWeeklyCompletionData(): { date: string; pct: number }[] {
  const result: { date: string; pct: number }[] = [];
  const today = new Date();
  const habits = getHabits();
  const log = getHabitLog();

  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    const key = format(d, 'yyyy-MM-dd');
    const daily = getDailyTasks(key);

    // Task completion
    const totalTasks = daily.tasks.length;
    const completedTasks = daily.tasks.filter(t => t.completed).length;
    const taskPct = totalTasks > 0 ? completedTasks / totalTasks : 0;

    // Habit completion
    const scheduledHabits = habits.filter(h => isHabitScheduledForDate(h, d));
    const completedHabits = scheduledHabits.filter(h => log[key]?.includes(h.id)).length;
    const habitPct = scheduledHabits.length > 0 ? completedHabits / scheduledHabits.length : 0;

    // Combined
    const hasTasks = totalTasks > 0;
    const hasHabits = scheduledHabits.length > 0;
    let pct = 0;
    if (hasTasks && hasHabits) pct = (taskPct + habitPct) / 2;
    else if (hasTasks) pct = taskPct;
    else if (hasHabits) pct = habitPct;

    result.push({ date: key, pct: Math.round(pct * 100) });
  }
  return result;
}

// ─── Life Areas ──────────────────────────────────────────────

export function getLifeAreaEntries(): LifeAreaEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LIFE_AREAS_KEY) || '[]');
  } catch { return []; }
}

export function saveLifeAreaEntry(entry: LifeAreaEntry) {
  const entries = getLifeAreaEntries();
  const idx = entries.findIndex(e => e.date === entry.date);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  entries.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(LIFE_AREAS_KEY, JSON.stringify(entries));
}

export function getLatestLifeAreaEntry(): LifeAreaEntry | null {
  const entries = getLifeAreaEntries();
  return entries[0] || null;
}
