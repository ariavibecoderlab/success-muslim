/**
 * health-bridge — unified access to on-device health data.
 *
 * Wraps the `capacitor-health` plugin so the rest of the app talks to a
 * single, stable interface regardless of platform:
 *   - iOS      -> Apple HealthKit
 *   - Android  -> Google Health Connect
 *   - Web      -> gracefully unavailable (returns empty / false)
 *
 * The plugin is imported dynamically so the web build never tries to
 * load native code. Install with:  npm i capacitor-health && npx cap sync
 *
 * Apple Watch / Wear OS / Samsung / Fitbit data all flow into HealthKit
 * or Health Connect, so syncing those two sources covers the whole
 * smart-watch + phone ecosystem.
 */
import { Capacitor } from '@capacitor/core';
import type { HealthPlugin, Workout } from 'capacitor-health';

export type HealthProvider = 'apple_health' | 'health_connect';

export interface DailySteps {
  date: string;          // yyyy-MM-dd
  steps: number;
  distanceMeters: number;
  calories: number;
  activityType: 'walking';
}

export interface HealthWorkout {
  external_id: string;
  activity_type: string;     // run, walk, ride, swim, workout...
  started_at: string;        // ISO
  duration_sec: number;
  distance_meters: number;
  calories: number;
  steps?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  raw?: Record<string, unknown>;
}

// ── Plugin loader ───────────────────────────────────────────
let pluginPromise: Promise<HealthPlugin | null> | null = null;

async function loadPlugin(): Promise<HealthPlugin | null> {
  if (!Capacitor.isNativePlatform()) return null;
  if (pluginPromise) return pluginPromise;
  pluginPromise = (async () => {
    try {
      const mod = await import('capacitor-health');
      return mod.Health ?? null;
    } catch (e) {
      console.warn('[health-bridge] capacitor-health plugin not available', e);
      return null;
    }
  })();
  return pluginPromise;
}

// ── Public API ──────────────────────────────────────────────

export function getHealthProvider(): HealthProvider | null {
  const p = Capacitor.getPlatform();
  if (p === 'ios') return 'apple_health';
  if (p === 'android') return 'health_connect';
  return null;
}

export async function isHealthSyncAvailable(): Promise<boolean> {
  const plugin = await loadPlugin();
  if (!plugin) return false;
  try {
    const res = await plugin.isHealthAvailable();
    return !!res?.available;
  } catch {
    return false;
  }
}

const PERMISSIONS = [
  'READ_STEPS', 'READ_DISTANCE', 'READ_ACTIVE_CALORIES',
  'READ_WORKOUTS', 'READ_HEART_RATE',
] as const;

export async function requestHealthPermissions(): Promise<boolean> {
  const plugin = await loadPlugin();
  if (!plugin) return false;
  try {
    const res = await plugin.requestHealthPermissions({
      permissions: [...PERMISSIONS],
    });
    // iOS always reports granted; Android returns a per-permission map.
    // Treat "no explicit denial" as success — reads simply return empty
    // for any metric the user withheld.
    return Array.isArray(res?.permissions);
  } catch (e) {
    console.warn('[health-bridge] permission request failed', e);
    return false;
  }
}

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Daily step totals for the last `daysBack` days. Steps and active
 * calories are queried separately (the plugin aggregates one metric
 * at a time) and merged by day.
 */
export async function readDailySteps(daysBack = 30): Promise<DailySteps[]> {
  const plugin = await loadPlugin();
  if (!plugin) return [];
  const startDate = isoDaysAgo(daysBack);
  const endDate = new Date().toISOString();

  try {
    const [stepsRes, calRes] = await Promise.all([
      plugin.queryAggregated({ startDate, endDate, dataType: 'steps', bucket: 'day' }),
      plugin.queryAggregated({ startDate, endDate, dataType: 'active-calories', bucket: 'day' })
        .catch(() => ({ aggregatedData: [] })),
    ]);

    const calByDate = new Map<string, number>();
    for (const c of calRes.aggregatedData ?? []) {
      calByDate.set(c.startDate.split('T')[0], c.value);
    }

    return (stepsRes.aggregatedData ?? [])
      .map((s) => {
        const date = s.startDate.split('T')[0];
        return {
          date,
          steps: Math.round(s.value),
          distanceMeters: 0, // derived server-side from stride if needed
          calories: Math.round(calByDate.get(date) ?? 0),
          activityType: 'walking' as const,
        };
      })
      .filter((d) => d.date && d.steps > 0);
  } catch (e) {
    console.warn('[health-bridge] readDailySteps failed', e);
    return [];
  }
}

function hrStats(workout: Workout): { avg?: number; max?: number } {
  const samples = workout.heartRate ?? [];
  if (!samples.length) return {};
  let sum = 0, max = 0;
  for (const s of samples) {
    sum += s.bpm;
    if (s.bpm > max) max = s.bpm;
  }
  return { avg: Math.round(sum / samples.length), max };
}

/**
 * Workout / activity records for the last `daysBack` days.
 */
export async function readWorkouts(daysBack = 30): Promise<HealthWorkout[]> {
  const plugin = await loadPlugin();
  if (!plugin) return [];
  try {
    const res = await plugin.queryWorkouts({
      startDate: isoDaysAgo(daysBack),
      endDate: new Date().toISOString(),
      includeHeartRate: true,
      includeRoute: false,
      includeSteps: true,
    });
    return (res.workouts ?? []).map((w, i) => {
      const { avg, max } = hrStats(w);
      return {
        external_id: String(w.id ?? `${w.startDate}-${i}`),
        activity_type: String(w.workoutType ?? 'workout').toLowerCase(),
        started_at: w.startDate,
        duration_sec: Math.round(w.duration ?? 0),
        distance_meters: w.distance ?? 0,
        calories: w.calories ?? 0,
        steps: w.steps,
        avg_heart_rate: avg,
        max_heart_rate: max,
        raw: { source: w.sourceName, bundleId: w.sourceBundleId },
      };
    });
  } catch (e) {
    console.warn('[health-bridge] readWorkouts failed', e);
    return [];
  }
}
