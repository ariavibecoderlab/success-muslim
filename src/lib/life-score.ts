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

function calcIman(): PillarScore {
  // Prayers: 5 prayers, each on-time=100, late=50, missed=0
  const salah = getTodaySalahCount();
  const prayerScore = salah.logged === 0 ? 0 : ((salah.onTime * 100 + salah.late * 50) / 5);

  // Quran / Sunnah checklist
  const sunnahItems = getSunnahItems().filter(i => i.enabled);
  const sunnahLog = getDayLog();
  const sunnahDone = sunnahLog.completed.filter(id => sunnahItems.find(i => i.id === id)).length;
  const quranScore = sunnahItems.length > 0 ? (sunnahDone / sunnahItems.length) * 100 : 0;

  // Dhikr: target 100 per day
  const dhikr = getDailyDhikr();
  const dhikrScore = Math.min(dhikr.totalCount / 100, 1) * 100;

  // Fasting (sunnah fasting today)
  const fastingLog = getFastingLog();
  const tk = todayKey();
  const fastingScore = fastingLog[tk] ? 100 : 0;

  const subs: SubScore[] = [
    { label: 'Prayers', score: clamp(prayerScore), weight: 0.6 },
    { label: 'Sunnah', score: clamp(quranScore), weight: 0.2 },
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
