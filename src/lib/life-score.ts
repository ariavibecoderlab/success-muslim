/**
 * Life Score Engine
 * 
 * Weighted daily metric (0-100):
 * - Iman (40%): Prayers 60%, Quran 20%, Dhikr 10%, Fasting 10%
 * - Wellness (30%): Water 30%, Sleep 30%, Weight 20%, Fasting 20%
 * - Productivity (30%): Tasks 60%, Habits 40%
 */

import { getTodaySalahCount } from './salah-storage';
import { getDailyDhikr } from './dhikr-storage';
import { getHydration, getSleepLog, getFastingLog, todayKey } from './health-storage';
import { getDailyTasks, getHabits, getHabitLog, getTodayKey } from './productivity-storage';
import { getDayLog, getSunnahItems } from './sunnah-storage';
import { getQuranDay } from './quran-storage';

export interface SubScore {
  label: string;
  score: number; // 0-100
  weight: number;
}

export interface PillarScore {
  label: string;
  score: number; // 0-100
  weight: number;
  subs: SubScore[];
}

export interface LifeScore {
  total: number; // 0-100
  pillars: PillarScore[];
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function calcIman(): PillarScore {
  // Prayers: 5 prayers, each on-time=100, late=50, missed=0
  const salah = getTodaySalahCount();
  const prayerScore = salah.logged === 0 ? 0 : ((salah.onTime * 100 + salah.late * 50) / 5);

  // Quran: target 4 pages/day
  const quranDay = getQuranDay();
  const quranScore = Math.min(quranDay.pagesRead / 4, 1) * 100;

  // Sunnah checklist
  const sunnahItems = getSunnahItems().filter(i => i.enabled);
  const sunnahLog = getDayLog();
  const sunnahDone = sunnahLog.completed.filter(id => sunnahItems.find(i => i.id === id)).length;
  const sunnahScore = sunnahItems.length > 0 ? (sunnahDone / sunnahItems.length) * 100 : 0;

  // Dhikr: target 100 per day
  const dhikr = getDailyDhikr();
  const dhikrScore = Math.min(dhikr.totalCount / 100, 1) * 100;

  // Fasting (sunnah fasting today)
  const fastingLog = getFastingLog();
  const tk = todayKey();
  const fastingScore = fastingLog[tk] ? 100 : 0;

  const subs: SubScore[] = [
    { label: 'Prayers', score: clamp(prayerScore), weight: 0.5 },
    { label: 'Quran', score: clamp(quranScore), weight: 0.2 },
    { label: 'Sunnah', score: clamp(sunnahScore), weight: 0.1 },
    { label: 'Dhikr', score: clamp(dhikrScore), weight: 0.1 },
    { label: 'Fasting', score: clamp(fastingScore), weight: 0.1 },
  ];

  const score = subs.reduce((s, sub) => s + sub.score * sub.weight, 0);
  return { label: 'Iman', score: clamp(score), weight: 0.4, subs };
}

function calcWellness(): PillarScore {
  // Water: goal-based
  const hydration = getHydration();
  const waterScore = Math.min(hydration.cups / hydration.goal, 1) * 100;

  // Sleep: 7-9h = 100, 6h or 10h = 50, <5h or >11h = 0
  const sleepLog = getSleepLog();
  const tk = todayKey();
  const todaySleep = sleepLog.find(e => e.date === tk);
  let sleepScore = 0;
  if (todaySleep) {
    const h = todaySleep.duration;
    if (h >= 7 && h <= 9) sleepScore = 100;
    else if (h >= 6 || h <= 10) sleepScore = 60;
    else sleepScore = 20;
  }

  // Weight: has entry today = 100 (tracking consistency)
  const weightScore = 0; // Simplified: no daily tracking metric

  // Fasting (IF or sunnah)
  const fastingLog = getFastingLog();
  const fastingScore = fastingLog[tk] ? 100 : 0;

  const subs: SubScore[] = [
    { label: 'Water', score: clamp(waterScore), weight: 0.3 },
    { label: 'Sleep', score: clamp(sleepScore), weight: 0.3 },
    { label: 'Weight', score: clamp(weightScore), weight: 0.2 },
    { label: 'Fasting', score: clamp(fastingScore), weight: 0.2 },
  ];

  const score = subs.reduce((s, sub) => s + sub.score * sub.weight, 0);
  return { label: 'Wellness', score: clamp(score), weight: 0.3, subs };
}

function calcProductivity(): PillarScore {
  // Tasks: MIT completion
  const daily = getDailyTasks();
  const mits = daily.tasks.filter(t => t.isMIT);
  const mitsCompleted = mits.filter(t => t.completed).length;
  const taskScore = mits.length > 0 ? (mitsCompleted / mits.length) * 100 : 0;

  // Habits
  const habits = getHabits();
  const log = getHabitLog();
  const today = getTodayKey();
  const habitsToday = log[today]?.length || 0;
  const habitScore = habits.length > 0 ? (habitsToday / habits.length) * 100 : 0;

  const subs: SubScore[] = [
    { label: 'Tasks', score: clamp(taskScore), weight: 0.6 },
    { label: 'Habits', score: clamp(habitScore), weight: 0.4 },
  ];

  const score = subs.reduce((s, sub) => s + sub.score * sub.weight, 0);
  return { label: 'Productivity', score: clamp(score), weight: 0.3, subs };
}

export function calculateLifeScore(): LifeScore {
  const pillars = [calcIman(), calcWellness(), calcProductivity()];
  const total = clamp(pillars.reduce((s, p) => s + p.score * p.weight, 0));
  return { total, pillars };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-primary';
  if (score >= 50) return 'text-accent-foreground';
  return 'text-destructive';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Needs Work';
  return 'Getting Started';
}

/**
 * Get weekly Life Score data for trend chart.
 * Since we can't retroactively calculate past scores from localStorage snapshots,
 * we store daily scores and return the last 7 days.
 */
const WEEKLY_SCORE_KEY = 'sm_life_score_history';

interface DailyScoreEntry {
  date: string;
  score: number;
  iman: number;
  wellness: number;
  productivity: number;
}

export function saveCurrentDayScore(score: LifeScore): void {
  const today = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(WEEKLY_SCORE_KEY);
    const history: DailyScoreEntry[] = raw ? JSON.parse(raw) : [];
    const idx = history.findIndex(e => e.date === today);
    const entry: DailyScoreEntry = {
      date: today,
      score: score.total,
      iman: score.pillars[0].score,
      wellness: score.pillars[1].score,
      productivity: score.pillars[2].score,
    };
    if (idx >= 0) history[idx] = entry;
    else history.push(entry);
    // Keep last 30 days
    const trimmed = history.slice(-30);
    localStorage.setItem(WEEKLY_SCORE_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function getWeeklyScores(): DailyScoreEntry[] {
  try {
    const raw = localStorage.getItem(WEEKLY_SCORE_KEY);
    const history: DailyScoreEntry[] = raw ? JSON.parse(raw) : [];
    // Return last 7 days, filling gaps with 0
    const result: DailyScoreEntry[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en', { weekday: 'short' });
      const existing = history.find(e => e.date === key);
      result.push(existing || { date: dayName, score: 0, iman: 0, wellness: 0, productivity: 0 });
      // Replace date with short day name for chart
      result[result.length - 1] = { ...result[result.length - 1], date: dayName };
    }
    return result;
  } catch {
    return [];
  }
}
