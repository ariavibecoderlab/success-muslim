import { supabase } from '@/integrations/supabase/client';
import { api, apiAsync } from '@/lib/api-client';
import { notifyFastingLogged, notifyAllPrayersComplete } from '@/lib/family-feed';

/** Get the current user ID, or null if not authenticated */
async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

/** Fire-and-forget sync — does not block UI */
function syncAsync(fn: () => Promise<void>) {
  fn().catch(err => console.warn('[db-sync]', err));
}

// =============================================
// SALAH — now routed through api-salah
// =============================================

export function syncSalahLog(date: string, prayerName: string, status: string | null, loggedAt: string | null) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    if (status === null) {
      await api('api-salah', { method: 'DELETE', params: { date, prayer_name: prayerName } });
    } else {
      await api('api-salah', {
        method: 'POST',
        body: { date, prayer_name: prayerName, status, logged_at: loggedAt },
      });

      if (status !== 'missed') {
        const todayLogs = await api<any[]>('api-salah', { params: { date } });
        const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const completedNames = (todayLogs || []).filter(r => r.status !== 'missed').map(r => r.prayer_name);
        const allDone = PRAYERS.every(p => completedNames.includes(p));
        if (allDone) {
          const profile = await api<any>('api-profile');
          const name = profile?.display_name || 'A member';
          await notifyAllPrayersComplete(userId, name);
        }
      }
    }
  });
}

export async function pullSalahLogs(): Promise<Record<string, any> | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any[]>('api-salah');
  if (!data || data.length === 0) return null;
  const logs: Record<string, any> = {};
  for (const row of data) {
    const dateKey = row.date;
    if (!logs[dateKey]) {
      logs[dateKey] = { date: dateKey, prayers: {} };
      for (const n of ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
        logs[dateKey].prayers[n] = { status: null, loggedAt: null };
      }
    }
    logs[dateKey].prayers[row.prayer_name] = { status: row.status, loggedAt: row.logged_at };
  }
  return logs;
}

// =============================================
// DHIKR — now routed through api-dhikr
// =============================================

export function syncDhikrSession(date: string, presetId: string, count: number, target: number) {
  syncAsync(async () => {
    await api('api-dhikr', { method: 'POST', body: { date, preset_id: presetId, count, target } });
  });
}

export async function pullDhikrSessions(): Promise<Record<string, any> | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any[]>('api-dhikr');
  if (!data || data.length === 0) return null;
  const result: Record<string, any> = {};
  for (const row of data) {
    if (!result[row.date]) result[row.date] = { sessions: [], totalCount: 0 };
    result[row.date].sessions.push({ presetId: row.preset_id, count: row.count, target: row.target, date: row.date });
    result[row.date].totalCount += row.count;
  }
  return result;
}

// =============================================
// HEALTH: BMI — now routed through api-health
// =============================================

export function syncBMI(data: { weight: number; height: number; age: number; gender: string; activityLevel: string; bmi: number; tdee: number }) {
  syncAsync(async () => {
    await api('api-health', {
      method: 'POST', params: { resource: 'bmi' },
      body: { weight: data.weight, height: data.height, age: data.age, gender: data.gender, activity_level: data.activityLevel, bmi: data.bmi, tdee: data.tdee },
    });
  });
}

export async function pullBMI(): Promise<any | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any>('api-health', { params: { resource: 'bmi' } });
  if (!data) return null;
  return { weight: Number(data.weight), height: Number(data.height), age: data.age, gender: data.gender, activityLevel: data.activity_level, bmi: Number(data.bmi), tdee: data.tdee, date: data.updated_at };
}

// =============================================
// HEALTH: WEIGHT LOG
// =============================================

export function syncWeightEntry(date: string, weight: number) {
  syncAsync(async () => {
    await api('api-health', { method: 'POST', params: { resource: 'weight' }, body: { date, weight } });
  });
}

export async function pullWeightLog(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any[]>('api-health', { params: { resource: 'weight' } });
  if (!data || data.length === 0) return null;
  return data.map(r => ({ date: r.date, weight: Number(r.weight) }));
}

// =============================================
// HEALTH: HYDRATION
// =============================================

export function syncHydration(date: string, cups: number, goal: number) {
  syncAsync(async () => {
    await api('api-health', { method: 'POST', params: { resource: 'hydration' }, body: { date, cups, goal } });
  });
}

export async function pullHydration(): Promise<Record<string, { cups: number; goal: number }> | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any[]>('api-health', { params: { resource: 'hydration' } });
  if (!data || data.length === 0) return null;
  const result: Record<string, { cups: number; goal: number }> = {};
  for (const r of data) result[r.date] = { cups: r.cups, goal: r.goal };
  return result;
}

// =============================================
// HEALTH: SLEEP
// =============================================

export function syncSleepEntry(date: string, bedtime: string, wakeTime: string, duration: number) {
  syncAsync(async () => {
    await api('api-health', { method: 'POST', params: { resource: 'sleep' }, body: { date, bedtime, wake_time: wakeTime, duration } });
  });
}

export async function pullSleepLog(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any[]>('api-health', { params: { resource: 'sleep' } });
  if (!data || data.length === 0) return null;
  return data.map(r => ({ date: r.date, bedtime: r.bedtime, wakeTime: r.wake_time, duration: Number(r.duration) }));
}

// =============================================
// HEALTH: SUNNAH FASTING
// =============================================

export function syncFastingToggle(date: string, isFasting: boolean) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    if (isFasting) {
      await api('api-health', { method: 'POST', params: { resource: 'fasting' }, body: { date, is_fasting: true } });
      const profile = await api<any>('api-profile');
      const name = profile?.display_name || 'A member';
      await notifyFastingLogged(userId, name);
    } else {
      await api('api-health', { method: 'DELETE', params: { resource: 'fasting', date } });
    }
  });
}

export async function pullFastingLog(): Promise<Record<string, boolean> | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any[]>('api-health', { params: { resource: 'fasting' } });
  if (!data || data.length === 0) return null;
  const result: Record<string, boolean> = {};
  for (const r of data) result[r.date] = true;
  return result;
}

// =============================================
// HEALTH: IF SESSIONS
// =============================================

export function syncIFStart(mode: string, startTime: string, fastingHours: number) {
  syncAsync(async () => {
    await api('api-health', { method: 'POST', params: { resource: 'if-sessions' }, body: { action: 'start', mode, start_time: startTime, fasting_hours: fastingHours } });
  });
}

export function syncIFStop(startTime: string, endTime: string, completed: boolean) {
  syncAsync(async () => {
    await api('api-health', { method: 'POST', params: { resource: 'if-sessions' }, body: { action: 'stop', start_time: startTime, end_time: endTime, completed } });
  });
}

export async function pullIFSessions(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any[]>('api-health', { params: { resource: 'if-sessions' } });
  if (!data || data.length === 0) return null;
  return data.map(r => ({ mode: r.mode, startTime: r.start_time, endTime: r.end_time, completed: r.completed }));
}

// =============================================
// PRODUCTIVITY: DAILY TASKS — via api-productivity
// =============================================

export function syncTaskAdd(id: string, date: string, text: string, isMIT: boolean) {
  syncAsync(async () => {
    await api('api-productivity', { method: 'POST', params: { resource: 'tasks' }, body: { id, date, text, is_mit: isMIT } });
  });
}

export function syncTaskToggle(id: string, completed: boolean) {
  syncAsync(async () => {
    await api('api-productivity', { method: 'PUT', params: { resource: 'tasks' }, body: { id, completed } });
  });
}

export function syncTaskDelete(id: string) {
  syncAsync(async () => {
    await api('api-productivity', { method: 'DELETE', params: { resource: 'tasks', id } });
  });
}

export async function pullDailyTasks(): Promise<Record<string, any> | null> {
  // This is now handled by useTasksQuery hook via api-productivity
  return null;
}

// =============================================
// PRODUCTIVITY: HABITS — via api-productivity
// =============================================

export function syncHabitAdd(id: string, name: string, icon: string, color: string) {
  syncAsync(async () => {
    await api('api-productivity', { method: 'POST', params: { resource: 'habits' }, body: { id, name, icon, color } });
  });
}

export function syncHabitDelete(id: string) {
  syncAsync(async () => {
    await api('api-productivity', { method: 'DELETE', params: { resource: 'habits', id } });
  });
}

export async function pullHabits(): Promise<any[] | null> {
  return null; // Handled by useHabitsQuery
}

// =============================================
// PRODUCTIVITY: HABIT LOG
// =============================================

export function syncHabitLogToggle(habitId: string, date: string, isCompleted: boolean) {
  syncAsync(async () => {
    if (isCompleted) {
      await api('api-productivity', { method: 'POST', params: { resource: 'habit-log' }, body: { habit_id: habitId, date } });
    } else {
      await api('api-productivity', { method: 'DELETE', params: { resource: 'habit-log', habit_id: habitId, date } });
    }
  });
}

export async function pullHabitLog(): Promise<Record<string, string[]> | null> {
  return null; // Handled by useHabitsQuery
}

// =============================================
// PRODUCTIVITY: LIFE AREA SCORES
// =============================================

export function syncLifeAreaScores(date: string, scores: { area: string; score: number }[]) {
  syncAsync(async () => {
    await api('api-productivity', { method: 'POST', params: { resource: 'life-areas' }, body: { date, scores } });
  });
}

export async function pullLifeAreaScores(): Promise<any[] | null> {
  return null; // Handled by useLifeAreasQuery
}

// =============================================
// SUNNAH TRACKER — via api-sunnah
// =============================================

export function syncSunnahLog(date: string, completedItems: string[]) {
  syncAsync(async () => {
    await api('api-sunnah', { method: 'POST', body: { date, completed_items: completedItems } });
  });
}

export async function pullSunnahLog(): Promise<Record<string, { completed: string[]; date: string }> | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any[]>('api-sunnah');
  if (!data || data.length === 0) return null;
  const result: Record<string, any> = {};
  for (const r of data) {
    result[r.date] = { completed: r.completed_items as string[], date: r.date };
  }
  return result;
}

// =============================================
// QADA SOLAT — via api-misc
// =============================================

export function syncQadaSolat(setup: any, progress: any) {
  syncAsync(async () => {
    await api('api-misc', { method: 'POST', params: { resource: 'qada-solat' }, body: { setup, progress } });
  });
}

export async function pullQadaSolat(): Promise<{ setup: any; progress: any } | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any>('api-misc', { params: { resource: 'qada-solat' } });
  if (!data) return null;
  return { setup: data.setup, progress: data.progress };
}

// =============================================
// RAMADHAN QADA — via api-misc
// =============================================

export function syncRamadhanQada(setup: any, progress: any) {
  syncAsync(async () => {
    await api('api-misc', { method: 'POST', params: { resource: 'ramadhan-qada' }, body: { setup, progress } });
  });
}

export async function pullRamadhanQada(): Promise<{ setup: any; progress: any } | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any>('api-misc', { params: { resource: 'ramadhan-qada' } });
  if (!data) return null;
  return { setup: data.setup, progress: data.progress };
}

// =============================================
// FIDYAH — via api-misc
// =============================================

export function syncFidyahEntry(entry: any) {
  syncAsync(async () => {
    await api('api-misc', { method: 'POST', params: { resource: 'fidyah' }, body: { entry } });
  });
}

export async function pullFidyahHistory(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any[]>('api-misc', { params: { resource: 'fidyah' } });
  if (!data || data.length === 0) return null;
  return data.map(r => r.entry);
}

// =============================================
// QURAN — via api-quran
// =============================================

export function syncQuranLog(date: string, pagesRead: number, juzNumber: number | null, surahName: string, notes: string) {
  syncAsync(async () => {
    await api('api-quran', {
      method: 'POST', params: { resource: 'quran-log' },
      body: { date, pages_read: pagesRead, juz_number: juzNumber, surah_name: surahName, notes },
    });
  });
}

export async function pullQuranLog(): Promise<Record<string, any> | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any[]>('api-quran', { params: { resource: 'quran-log' } });
  if (!data || data.length === 0) return null;
  const result: Record<string, any> = {};
  for (const r of data) {
    result[r.date] = {
      pagesRead: r.pages_read,
      juzNumber: r.juz_number,
      surahName: r.surah_name || '',
      notes: r.notes || '',
    };
  }
  return result;
}

// =============================================
// USER ACTIVITY LOGGING — via api-misc
// =============================================

export function logActivity(module: string, action: string, metadata?: Record<string, any>) {
  apiAsync('api-misc', {
    method: 'POST',
    params: { resource: 'activity' },
    body: { module, action, metadata: metadata || {} },
  });
}

// =============================================
// MASTER HYDRATION: Pull all DB data into localStorage
// =============================================

export async function hydrateFromDatabase(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  try {
    const [salah, dhikr, bmi, weight, hydration, sleep, fasting, ifSessions, sunnah, qada, ramadhan, fidyah, quran, stepsLogs, stepsPrefs] = await Promise.all([
      pullSalahLogs(),
      pullDhikrSessions(),
      pullBMI(),
      pullWeightLog(),
      pullHydration(),
      pullSleepLog(),
      pullFastingLog(),
      pullIFSessions(),
      pullSunnahLog(),
      pullQadaSolat(),
      pullRamadhanQada(),
      pullFidyahHistory(),
      pullQuranLog(),
      pullStepsLogs(),
      pullStepsPrefs(),
    ]);

    if (salah) localStorage.setItem('salah_tracking', JSON.stringify(salah));
    if (dhikr) localStorage.setItem('dhikr_data', JSON.stringify(dhikr));
    if (bmi) localStorage.setItem('health_bmi', JSON.stringify(bmi));
    if (weight) localStorage.setItem('health_weight_log', JSON.stringify(weight));
    if (hydration) localStorage.setItem('health_hydration', JSON.stringify(hydration));
    if (sleep) localStorage.setItem('health_sleep', JSON.stringify(sleep));
    if (fasting) localStorage.setItem('health_fasting', JSON.stringify(fasting));
    if (ifSessions) localStorage.setItem('health_if_sessions', JSON.stringify(ifSessions));
    if (sunnah) localStorage.setItem('sunnah_logs', JSON.stringify(sunnah));
    if (qada) {
      if (qada.setup && Object.keys(qada.setup).length > 0) localStorage.setItem('qada_solat_setup', JSON.stringify(qada.setup));
      if (qada.progress && Object.keys(qada.progress).length > 0) localStorage.setItem('qada_solat_progress', JSON.stringify(qada.progress));
    }
    if (ramadhan) {
      if (ramadhan.setup && Object.keys(ramadhan.setup).length > 0) localStorage.setItem('ramadhan_qada_setup', JSON.stringify(ramadhan.setup));
      if (ramadhan.progress && Object.keys(ramadhan.progress).length > 0) localStorage.setItem('ramadhan_qada_progress', JSON.stringify(ramadhan.progress));
    }
    if (fidyah) localStorage.setItem('fidyah_history', JSON.stringify(fidyah));
    if (quran) localStorage.setItem('quran_log', JSON.stringify(quran));
    if (stepsLogs) localStorage.setItem('health_steps_logs', JSON.stringify(stepsLogs));
    if (stepsPrefs) localStorage.setItem('health_steps_prefs', JSON.stringify(stepsPrefs));

    console.log('[db-sync] Hydration from database complete');
  } catch (err) {
    console.warn('[db-sync] Hydration failed:', err);
  }
}

// =============================================
// HEALTH: STEPS — via api-health
// =============================================

export function syncStepLog(date: string, steps: number, activityType: string, distanceMeters: number, caloriesBurned: number, loggedAt: string) {
  syncAsync(async () => {
    await api('api-health', {
      method: 'POST', params: { resource: 'steps' },
      body: { date, steps, activity_type: activityType, distance_meters: distanceMeters, calories_burned: caloriesBurned, logged_at: loggedAt, source: 'manual' },
    });
  });
}

export function syncStepLogDelete(id: string) {
  syncAsync(async () => {
    await api('api-health', { method: 'DELETE', params: { resource: 'steps', id } });
  });
}

export function syncStepsPrefs(dailyTarget: number, strideLengthCm: number, reminderEnabled: boolean, reminderTime: string | null) {
  syncAsync(async () => {
    await api('api-health', {
      method: 'POST', params: { resource: 'steps-prefs' },
      body: { daily_target: dailyTarget, stride_length_cm: strideLengthCm, reminder_enabled: reminderEnabled, reminder_time: reminderTime },
    });
  });
}

export async function pullStepsLogs(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any[]>('api-health', { params: { resource: 'steps' } });
  if (!data || data.length === 0) return null;
  return data.map(r => ({
    id: r.id, date: r.date, steps: r.steps, activityType: r.activity_type,
    distanceMeters: Number(r.distance_meters), caloriesBurned: Number(r.calories_burned),
    loggedAt: r.logged_at, source: r.source,
  }));
}

export async function pullStepsPrefs(): Promise<any | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const data = await api<any>('api-health', { params: { resource: 'steps-prefs' } });
  if (!data) return null;
  return {
    dailyTarget: data.daily_target, strideLengthCm: Number(data.stride_length_cm),
    reminderEnabled: data.reminder_enabled, reminderTime: data.reminder_time,
  };
}
