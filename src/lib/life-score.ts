/**
 * Life Score Engine
 * 
 * Weighted daily metric (0-100):
 * - Iman (40%): Prayers 50%, Quran 20%, Sunnah 10%, Dhikr 10%, Fasting 10%
 * - Wellness (30%): Water 30%, Sleep 30%, Weight 20%, Fasting 20%
 * - Productivity (30%): Tasks 60%, Habits 40%
 * 
 * All calc functions accept data parameters — no direct localStorage reads.
 */

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

/** Input data for the score engine — caller provides all values */
export interface LifeScoreInput {
  salah: { onTime: number; late: number; logged: number };
  quranPagesRead: number;
  sunnahEnabled: number;
  sunnahCompleted: number;
  dhikrCount: number;
  isFastingToday: boolean;
  hydrationCups: number;
  hydrationGoal: number;
  sleepHours: number | null; // null = not logged
  mitsTotal: number;
  mitsCompleted: number;
  habitsTotal: number;
  habitsDoneToday: number;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function calcIman(input: LifeScoreInput): PillarScore {
  const prayerScore = input.salah.logged === 0
    ? 0
    : ((input.salah.onTime * 100 + input.salah.late * 50) / 5);

  const quranScore = Math.min(input.quranPagesRead / 4, 1) * 100;

  const sunnahScore = input.sunnahEnabled > 0
    ? (input.sunnahCompleted / input.sunnahEnabled) * 100
    : 0;

  const dhikrScore = Math.min(input.dhikrCount / 100, 1) * 100;

  const fastingScore = input.isFastingToday ? 100 : 0;

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

function calcWellness(input: LifeScoreInput): PillarScore {
  const waterScore = input.hydrationGoal > 0
    ? Math.min(input.hydrationCups / input.hydrationGoal, 1) * 100
    : 0;

  let sleepScore = 0;
  if (input.sleepHours !== null) {
    const h = input.sleepHours;
    if (h >= 7 && h <= 9) sleepScore = 100;
    else if (h >= 6 || h <= 10) sleepScore = 60;
    else sleepScore = 20;
  }

  const weightScore = 0; // Simplified: no daily tracking metric

  const fastingScore = input.isFastingToday ? 100 : 0;

  const subs: SubScore[] = [
    { label: 'Water', score: clamp(waterScore), weight: 0.3 },
    { label: 'Sleep', score: clamp(sleepScore), weight: 0.3 },
    { label: 'Weight', score: clamp(weightScore), weight: 0.2 },
    { label: 'Fasting', score: clamp(fastingScore), weight: 0.2 },
  ];

  const score = subs.reduce((s, sub) => s + sub.score * sub.weight, 0);
  return { label: 'Wellness', score: clamp(score), weight: 0.3, subs };
}

function calcProductivity(input: LifeScoreInput): PillarScore {
  const taskScore = input.mitsTotal > 0
    ? (input.mitsCompleted / input.mitsTotal) * 100
    : 0;

  const habitScore = input.habitsTotal > 0
    ? (input.habitsDoneToday / input.habitsTotal) * 100
    : 0;

  const subs: SubScore[] = [
    { label: 'Tasks', score: clamp(taskScore), weight: 0.6 },
    { label: 'Habits', score: clamp(habitScore), weight: 0.4 },
  ];

  const score = subs.reduce((s, sub) => s + sub.score * sub.weight, 0);
  return { label: 'Productivity', score: clamp(score), weight: 0.3, subs };
}

export function calculateLifeScore(input: LifeScoreInput): LifeScore {
  const pillars = [calcIman(input), calcWellness(input), calcProductivity(input)];
  const total = clamp(pillars.reduce((s, p) => s + p.score * p.weight, 0));
  return { total, pillars };
}

/**
 * Backward-compatible version that reads localStorage directly.
 * Used by non-React-Query consumers (e.g. family feed).
 */
export function calculateLifeScoreFromStorage(): LifeScore {
  // Lazy imports to avoid circular deps at module level
  const { getTodaySalahCount } = require('./salah-storage');
  const { getDailyDhikr } = require('./dhikr-storage');
  const { getHydration, getSleepLog, getFastingLog, todayKey } = require('./health-storage');
  const { getDailyTasks, getHabits, getHabitLog, getTodayKey } = require('./productivity-storage');
  const { getDayLog, getSunnahItems } = require('./sunnah-storage');
  const { getQuranDay } = require('./quran-storage');

  const salah = getTodaySalahCount();
  const quranDay = getQuranDay();
  const sunnahItems = getSunnahItems().filter((i: any) => i.enabled);
  const sunnahLog = getDayLog();
  const sunnahDone = sunnahLog.completed.filter((id: string) =>
    sunnahItems.find((i: any) => i.id === id)
  ).length;
  const dhikr = getDailyDhikr();
  const fastingLog = getFastingLog();
  const tk = todayKey();
  const hydration = getHydration();
  const sleepLog = getSleepLog();
  const todaySleep = sleepLog.find((e: any) => e.date === tk);
  const daily = getDailyTasks();
  const mits = daily.tasks.filter((t: any) => t.isMIT);
  const habits = getHabits();
  const habitLog = getHabitLog();
  const today = getTodayKey();

  return calculateLifeScore({
    salah: { onTime: salah.onTime, late: salah.late, logged: salah.logged },
    quranPagesRead: quranDay.pagesRead,
    sunnahEnabled: sunnahItems.length,
    sunnahCompleted: sunnahDone,
    dhikrCount: dhikr.totalCount,
    isFastingToday: !!fastingLog[tk],
    hydrationCups: hydration.cups,
    hydrationGoal: hydration.goal,
    sleepHours: todaySleep?.duration ?? null,
    mitsTotal: mits.length,
    mitsCompleted: mits.filter((t: any) => t.completed).length,
    habitsTotal: habits.length,
    habitsDoneToday: habitLog[today]?.length || 0,
  });
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
 * Weekly score history stored in localStorage.
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
    const trimmed = history.slice(-30);
    localStorage.setItem(WEEKLY_SCORE_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function getWeeklyScores(): DailyScoreEntry[] {
  try {
    const raw = localStorage.getItem(WEEKLY_SCORE_KEY);
    const history: DailyScoreEntry[] = raw ? JSON.parse(raw) : [];
    const result: DailyScoreEntry[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en', { weekday: 'short' });
      const existing = history.find(e => e.date === key);
      result.push(existing || { date: dayName, score: 0, iman: 0, wellness: 0, productivity: 0 });
      result[result.length - 1] = { ...result[result.length - 1], date: dayName };
    }
    return result;
  } catch {
    return [];
  }
}
