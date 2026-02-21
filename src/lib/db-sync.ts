import { supabase } from '@/integrations/supabase/client';
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
// SALAH
// =============================================

export function syncSalahLog(date: string, prayerName: string, status: string | null, loggedAt: string | null) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    if (status === null) {
      await supabase.from('salah_logs').delete().match({ user_id: userId, date, prayer_name: prayerName });
    } else {
      await supabase.from('salah_logs').upsert({
        user_id: userId, date, prayer_name: prayerName, status, logged_at: loggedAt,
      }, { onConflict: 'user_id,date,prayer_name' });

      // Check if all 5 prayers are now completed for today (only on non-missed prayers)
      if (status !== 'missed') {
        const { data: todayLogs } = await supabase
          .from('salah_logs')
          .select('prayer_name, status')
          .eq('user_id', userId)
          .eq('date', date)
          .neq('status', 'missed');
        const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const completedNames = (todayLogs || []).map(r => r.prayer_name);
        const allDone = PRAYERS.every(p => completedNames.includes(p));
        if (allDone) {
          const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', userId).single();
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
  const { data } = await supabase.from('salah_logs').select('*').eq('user_id', userId);
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
// DHIKR
// =============================================

export function syncDhikrSession(date: string, presetId: string, count: number, target: number) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('dhikr_sessions').upsert({
      user_id: userId, date, preset_id: presetId, count, target,
    }, { onConflict: 'user_id,date,preset_id' });
  });
}

export async function pullDhikrSessions(): Promise<Record<string, any> | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('dhikr_sessions').select('*').eq('user_id', userId);
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
// HEALTH: BMI
// =============================================

export function syncBMI(data: { weight: number; height: number; age: number; gender: string; activityLevel: string; bmi: number; tdee: number }) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('health_bmi').upsert({
      user_id: userId, weight: data.weight, height: data.height, age: data.age,
      gender: data.gender, activity_level: data.activityLevel, bmi: data.bmi, tdee: data.tdee,
    }, { onConflict: 'user_id' });
  });
}

export async function pullBMI(): Promise<any | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('health_bmi').select('*').eq('user_id', userId).single();
  if (!data) return null;
  return { weight: Number(data.weight), height: Number(data.height), age: data.age, gender: data.gender, activityLevel: data.activity_level, bmi: Number(data.bmi), tdee: data.tdee, date: data.updated_at };
}

// =============================================
// HEALTH: WEIGHT LOG
// =============================================

export function syncWeightEntry(date: string, weight: number) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('weight_log').upsert({ user_id: userId, date, weight }, { onConflict: 'user_id,date' });
  });
}

export async function pullWeightLog(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('weight_log').select('*').eq('user_id', userId).order('date');
  if (!data || data.length === 0) return null;
  return data.map(r => ({ date: r.date, weight: Number(r.weight) }));
}

// =============================================
// HEALTH: HYDRATION
// =============================================

export function syncHydration(date: string, cups: number, goal: number) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('hydration_log').upsert({ user_id: userId, date, cups, goal }, { onConflict: 'user_id,date' });
  });
}

export async function pullHydration(): Promise<Record<string, { cups: number; goal: number }> | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('hydration_log').select('*').eq('user_id', userId);
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
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('sleep_log').upsert({ user_id: userId, date, bedtime, wake_time: wakeTime, duration }, { onConflict: 'user_id,date' });
  });
}

export async function pullSleepLog(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('sleep_log').select('*').eq('user_id', userId).order('date');
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
      await supabase.from('fasting_log').upsert({ user_id: userId, date }, { onConflict: 'user_id,date' });
      // Post to family feed (only when user starts fasting, not when un-toggling)
      const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', userId).single();
      const name = profile?.display_name || 'A member';
      await notifyFastingLogged(userId, name);
    } else {
      await supabase.from('fasting_log').delete().match({ user_id: userId, date });
    }
  });
}

export async function pullFastingLog(): Promise<Record<string, boolean> | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('fasting_log').select('date').eq('user_id', userId);
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
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('if_sessions').insert({ user_id: userId, mode, start_time: startTime, fasting_hours: fastingHours });
  });
}

export function syncIFStop(startTime: string, endTime: string, completed: boolean) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('if_sessions').update({ end_time: endTime, completed }).match({ user_id: userId, start_time: startTime });
  });
}

export async function pullIFSessions(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('if_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
  if (!data || data.length === 0) return null;
  return data.map(r => ({ mode: r.mode, startTime: r.start_time, endTime: r.end_time, completed: r.completed }));
}

// =============================================
// PRODUCTIVITY: DAILY TASKS
// =============================================

export function syncTaskAdd(id: string, date: string, text: string, isMIT: boolean) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('daily_tasks').insert({ id, user_id: userId, date, text, is_mit: isMIT });
  });
}

export function syncTaskToggle(id: string, completed: boolean) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('daily_tasks').update({ completed }).eq('id', id).eq('user_id', userId);
  });
}

export function syncTaskDelete(id: string) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('daily_tasks').delete().eq('id', id).eq('user_id', userId);
  });
}

export async function pullDailyTasks(): Promise<Record<string, any> | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('daily_tasks').select('*').eq('user_id', userId).order('created_at');
  if (!data || data.length === 0) return null;
  const result: Record<string, any> = {};
  for (const r of data) {
    if (!result[r.date]) result[r.date] = { date: r.date, tasks: [] };
    result[r.date].tasks.push({ id: r.id, text: r.text, completed: r.completed, isMIT: r.is_mit, createdAt: r.created_at });
  }
  return result;
}

// =============================================
// PRODUCTIVITY: HABITS
// =============================================

export function syncHabitAdd(id: string, name: string, icon: string, color: string) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('habits').insert({ id, user_id: userId, name, icon, color });
  });
}

export function syncHabitDelete(id: string) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('habits').delete().eq('id', id).eq('user_id', userId);
  });
}

export async function pullHabits(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('habits').select('*').eq('user_id', userId).order('created_at');
  if (!data || data.length === 0) return null;
  return data.map(r => ({ id: r.id, name: r.name, icon: r.icon, color: r.color, createdAt: r.created_at }));
}

// =============================================
// PRODUCTIVITY: HABIT LOG
// =============================================

export function syncHabitLogToggle(habitId: string, date: string, isCompleted: boolean) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    if (isCompleted) {
      await supabase.from('habit_log').upsert({ user_id: userId, habit_id: habitId, date }, { onConflict: 'user_id,habit_id,date' });
    } else {
      await supabase.from('habit_log').delete().match({ user_id: userId, habit_id: habitId, date });
    }
  });
}

export async function pullHabitLog(): Promise<Record<string, string[]> | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('habit_log').select('habit_id, date').eq('user_id', userId);
  if (!data || data.length === 0) return null;
  const result: Record<string, string[]> = {};
  for (const r of data) {
    if (!result[r.date]) result[r.date] = [];
    result[r.date].push(r.habit_id);
  }
  return result;
}

// =============================================
// PRODUCTIVITY: LIFE AREA SCORES
// =============================================

export function syncLifeAreaScores(date: string, scores: { area: string; score: number }[]) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    const rows = scores.map(s => ({ user_id: userId, date, area: s.area, score: s.score }));
    await supabase.from('life_area_scores').upsert(rows, { onConflict: 'user_id,date,area' });
  });
}

export async function pullLifeAreaScores(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('life_area_scores').select('*').eq('user_id', userId).order('date', { ascending: false });
  if (!data || data.length === 0) return null;
  // Group by date
  const grouped: Record<string, any[]> = {};
  for (const r of data) {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push({ area: r.area, score: r.score });
  }
  return Object.entries(grouped).map(([date, scores]) => ({ date, scores })).sort((a, b) => b.date.localeCompare(a.date));
}

// =============================================
// SUNNAH TRACKER
// =============================================

export function syncSunnahLog(date: string, completedItems: string[]) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('sunnah_log').upsert({ user_id: userId, date, completed_items: completedItems }, { onConflict: 'user_id,date' });
  });
}

export async function pullSunnahLog(): Promise<Record<string, { completed: string[]; date: string }> | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('sunnah_log').select('*').eq('user_id', userId);
  if (!data || data.length === 0) return null;
  const result: Record<string, any> = {};
  for (const r of data) {
    result[r.date] = { completed: r.completed_items as string[], date: r.date };
  }
  return result;
}

// =============================================
// QADA SOLAT
// =============================================

export function syncQadaSolat(setup: any, progress: any) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('qada_solat').upsert({ user_id: userId, setup, progress }, { onConflict: 'user_id' });
  });
}

export async function pullQadaSolat(): Promise<{ setup: any; progress: any } | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('qada_solat').select('setup, progress').eq('user_id', userId).single();
  if (!data) return null;
  return { setup: data.setup, progress: data.progress };
}

// =============================================
// RAMADHAN QADA
// =============================================

export function syncRamadhanQada(setup: any, progress: any) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('ramadhan_qada').upsert({ user_id: userId, setup, progress }, { onConflict: 'user_id' });
  });
}

export async function pullRamadhanQada(): Promise<{ setup: any; progress: any } | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('ramadhan_qada').select('setup, progress').eq('user_id', userId).single();
  if (!data) return null;
  return { setup: data.setup, progress: data.progress };
}

// =============================================
// FIDYAH
// =============================================

export function syncFidyahEntry(entry: any) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('fidyah_history').insert({ user_id: userId, entry });
  });
}

export async function pullFidyahHistory(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('fidyah_history').select('entry, created_at').eq('user_id', userId).order('created_at', { ascending: false });
  if (!data || data.length === 0) return null;
  return data.map(r => r.entry);
}

// =============================================
// QURAN
// =============================================

export function syncQuranLog(date: string, pagesRead: number, juzNumber: number | null, surahName: string, notes: string) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await (supabase.from('quran_log') as any).upsert({
      user_id: userId, date, pages_read: pagesRead,
      juz_number: juzNumber, surah_name: surahName, notes,
    }, { onConflict: 'user_id,date' });
  });
}

export async function pullQuranLog(): Promise<Record<string, any> | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await (supabase.from('quran_log') as any).select('date, pages_read, juz_number, surah_name, notes').eq('user_id', userId);
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
// USER ACTIVITY LOGGING
// =============================================

export function logActivity(module: string, action: string, metadata?: Record<string, any>) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('user_activity').insert({ user_id: userId, module, action, metadata: metadata || {} });
  });
}

// =============================================
// MASTER HYDRATION: Pull all DB data into localStorage
// =============================================

export async function hydrateFromDatabase(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  try {
    const [salah, dhikr, bmi, weight, hydration, sleep, fasting, ifSessions, tasks, habits, habitLog, lifeAreas, sunnah, qada, ramadhan, fidyah, quran, stepsLogs, stepsPrefs] = await Promise.all([
      pullSalahLogs(),
      pullDhikrSessions(),
      pullBMI(),
      pullWeightLog(),
      pullHydration(),
      pullSleepLog(),
      pullFastingLog(),
      pullIFSessions(),
      pullDailyTasks(),
      pullHabits(),
      pullHabitLog(),
      pullLifeAreaScores(),
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
    if (tasks) localStorage.setItem('sm_daily_tasks', JSON.stringify(tasks));
    if (habits) localStorage.setItem('sm_habits', JSON.stringify(habits));
    if (habitLog) localStorage.setItem('sm_habit_log', JSON.stringify(habitLog));
    if (lifeAreas) localStorage.setItem('sm_life_areas', JSON.stringify(lifeAreas));
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
// HEALTH: STEPS
// =============================================

export function syncStepLog(date: string, steps: number, activityType: string, distanceMeters: number, caloriesBurned: number, loggedAt: string) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('steps_logs').insert({
      user_id: userId, date, steps, activity_type: activityType,
      distance_meters: distanceMeters, calories_burned: caloriesBurned, logged_at: loggedAt, source: 'manual',
    });
  });
}

export function syncStepLogDelete(id: string) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('steps_logs').delete().eq('id', id).eq('user_id', userId);
  });
}

export function syncStepsPrefs(dailyTarget: number, strideLengthCm: number, reminderEnabled: boolean, reminderTime: string | null) {
  syncAsync(async () => {
    const userId = await getUserId();
    if (!userId) return;
    await supabase.from('steps_preferences').upsert({
      user_id: userId, daily_target: dailyTarget, stride_length_cm: strideLengthCm,
      reminder_enabled: reminderEnabled, reminder_time: reminderTime,
    }, { onConflict: 'user_id' });
  });
}

export async function pullStepsLogs(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('steps_logs').select('*').eq('user_id', userId).order('logged_at', { ascending: false });
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
  const { data } = await supabase.from('steps_preferences').select('*').eq('user_id', userId).single();
  if (!data) return null;
  return {
    dailyTarget: data.daily_target, strideLengthCm: Number(data.stride_length_cm),
    reminderEnabled: data.reminder_enabled, reminderTime: data.reminder_time,
  };
}
