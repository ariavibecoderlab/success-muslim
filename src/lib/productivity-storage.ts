import { format, subDays } from 'date-fns';
import { syncTaskAdd, syncTaskToggle, syncTaskDelete, syncHabitAdd, syncHabitDelete, syncHabitLogToggle, syncLifeAreaScores } from './db-sync';

// ─── Types ───────────────────────────────────────────────────

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  isMIT: boolean;
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

export const LIFE_AREAS: { key: LifeAreaKey; label: string; emoji: string }[] = [
  { key: 'iman', label: 'Iman', emoji: '🕌' },
  { key: 'health', label: 'Health', emoji: '💪' },
  { key: 'wealth', label: 'Wealth', emoji: '💰' },
  { key: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { key: 'knowledge', label: 'Knowledge', emoji: '📚' },
  { key: 'career', label: 'Career', emoji: '🎯' },
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
  syncTaskAdd(task.id, d.date, text, task.isMIT);
  return d;
}

export function toggleTask(taskId: string, date?: string): DailyTasks {
  const d = getDailyTasks(date);
  const task = d.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    syncTaskToggle(taskId, task.completed);
  }
  saveDailyTasks(d);
  return d;
}

export function deleteTask(taskId: string, date?: string): DailyTasks {
  const d = getDailyTasks(date);
  d.tasks = d.tasks.filter(t => t.id !== taskId);
  saveDailyTasks(d);
  syncTaskDelete(taskId);
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

export function addHabit(name: string, icon: string = 'Check', color: string = 'primary'): Habit[] {
  const habits = getHabits();
  const id = crypto.randomUUID();
  habits.push({ id, name, icon, color, createdAt: new Date().toISOString() });
  saveHabits(habits);
  syncHabitAdd(id, name, icon, color);
  return habits;
}

export function deleteHabit(id: string): Habit[] {
  const habits = getHabits().filter(h => h.id !== id);
  saveHabits(habits);
  syncHabitDelete(id);
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
  const isCompleted = idx < 0;
  if (idx >= 0) log[key].splice(idx, 1);
  else log[key].push(habitId);
  saveHabitLog(log);
  syncHabitLogToggle(habitId, key, isCompleted);
  return log;
}

export function getHabitStreak(habitId: string): number {
  const log = getHabitLog();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const key = format(subDays(today, i), 'yyyy-MM-dd');
    if (log[key]?.includes(habitId)) streak++;
    else { if (i === 0) continue; break; }
  }
  return streak;
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
  syncLifeAreaScores(entry.date, entry.scores);
}

export function getLatestLifeAreaEntry(): LifeAreaEntry | null {
  const entries = getLifeAreaEntries();
  return entries[0] || null;
}
