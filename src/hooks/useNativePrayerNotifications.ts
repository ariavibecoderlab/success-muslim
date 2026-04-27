import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App as CapacitorApp } from '@capacitor/app';
import type { PrayerTime, PrayerSettings } from '@/lib/prayer-times';
import { getEffectiveTime } from '@/lib/prayer-times';
import type { DailySalahLog, SalahName } from '@/lib/salah-storage';

/**
 * Schedules native LocalNotifications for prayer times, pre-reminders,
 * and "log your Salah" nags for the next 7 days. Re-runs whenever inputs
 * change or the app resumes.
 */

const PRAYER_DISPLAY: Record<string, string> = {
  fajr: 'Subuh',
  dhuhr: 'Zohor',
  asr: 'Asar',
  maghrib: 'Maghrib',
  isha: 'Isyak',
};

const KEY_TO_SALAH: Record<string, SalahName> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

// ID space (must be stable so we can cancel + re-schedule cleanly).
// Each day offset 0..6, each prayer 0..4 → 5 IDs/day per category.
// main: 10000 + day*10 + prayerIdx
// pre:  20000 + day*10 + prayerIdx
// nag:  30000 + day*10 + prayerIdx
const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
const DAYS_AHEAD = 7;

function buildAllIds(): number[] {
  const ids: number[] = [];
  for (let d = 0; d < DAYS_AHEAD; d++) {
    for (let p = 0; p < PRAYER_KEYS.length; p++) {
      ids.push(10000 + d * 10 + p);
      ids.push(20000 + d * 10 + p);
      ids.push(30000 + d * 10 + p);
    }
  }
  return ids;
}

async function cancelAllOurs() {
  try {
    const ids = buildAllIds().map((id) => ({ id }));
    await LocalNotifications.cancel({ notifications: ids });
  } catch (e) {
    console.warn('[notif] cancel failed', e);
  }
}

export function useNativePrayerNotifications(
  timings: PrayerTime[] | null,
  settings: PrayerSettings,
  todayLog: DailySalahLog | undefined,
) {
  const lastScheduleKey = useRef<string>('');

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (!timings || timings.length === 0) return;

    const schedule = async () => {
      // Permission gate
      try {
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') return;
      } catch {
        return;
      }

      // Build a dedupe key so we don't reschedule on every render
      const key = JSON.stringify({
        t: timings.map((p) => `${p.key}:${getEffectiveTime(p)}`),
        a: settings.adhan_settings,
        nag: settings.log_nag_enabled,
        delay: settings.log_nag_delay_min,
        loggedToday: todayLog
          ? PRAYER_KEYS.map((k) => todayLog.prayers[KEY_TO_SALAH[k]]?.status ?? '_').join(',')
          : '',
        day: new Date().toDateString(),
      });
      if (key === lastScheduleKey.current) return;
      lastScheduleKey.current = key;

      await cancelAllOurs();

      const now = new Date();
      const nagDelayMs = (settings.log_nag_delay_min ?? 30) * 60_000;
      const nagEnabled = settings.log_nag_enabled !== false;

      const toSchedule: any[] = [];

      for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
        const baseDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + dayOffset,
        );

        timings.forEach((prayer, prayerIdx) => {
          const pKey = prayer.key.toLowerCase();
          const pIdx = PRAYER_KEYS.indexOf(pKey as (typeof PRAYER_KEYS)[number]);
          if (pIdx === -1) return;

          const config = settings.adhan_settings[pKey];
          if (!config || config.enabled === false) return;
          if (config.days && !config.days.includes(baseDate.getDay())) return;

          const [h, m] = getEffectiveTime(prayer).split(':').map(Number);
          const prayerTime = new Date(baseDate);
          prayerTime.setHours(h, m, 0, 0);
          const prayerMs = prayerTime.getTime();
          const display = PRAYER_DISPLAY[pKey] || prayer.name;

          // 1. Main prayer-time notification (skip if silent)
          if (config.mode !== 'silent' && prayerMs > now.getTime()) {
            toSchedule.push({
              id: 10000 + dayOffset * 10 + pIdx,
              title: `🕌 ${display} Prayer Time`,
              body: `It's time for ${display}. May Allah accept your ibadah.`,
              schedule: { at: prayerTime, allowWhileIdle: true },
              sound: config.mode === 'full' ? 'default' : undefined,
              smallIcon: 'ic_stat_icon',
              extra: { type: 'prayer', prayer: pKey },
            });
          }

          // 2. Pre-reminder
          if (config.preReminder > 0) {
            const preTime = new Date(prayerMs - config.preReminder * 60_000);
            if (preTime.getTime() > now.getTime()) {
              toSchedule.push({
                id: 20000 + dayOffset * 10 + pIdx,
                title: `⏰ ${display} in ${config.preReminder} min`,
                body: `${display} prayer is coming up. Prepare for salah.`,
                schedule: { at: preTime, allowWhileIdle: true },
                sound: 'default',
                smallIcon: 'ic_stat_icon',
                extra: { type: 'pre-reminder', prayer: pKey },
              });
            }
          }

          // 3. Log nag (skip if today + already logged)
          if (nagEnabled) {
            const nagTime = new Date(prayerMs + nagDelayMs);
            const isToday = dayOffset === 0;
            const alreadyLogged = isToday
              ? !!todayLog?.prayers?.[KEY_TO_SALAH[pKey]]?.status
              : false;
            if (!alreadyLogged && nagTime.getTime() > now.getTime()) {
              toSchedule.push({
                id: 30000 + dayOffset * 10 + pIdx,
                title: `📋 Log your ${display}`,
                body: 'Tap to mark as on-time, late, or missed.',
                schedule: { at: nagTime, allowWhileIdle: true },
                sound: 'default',
                smallIcon: 'ic_stat_icon',
                extra: { type: 'log-nag', prayer: pKey },
              });
            }
          }
        });
      }

      if (toSchedule.length === 0) return;

      try {
        // iOS limits to 64 pending notifications. We schedule up to 7 days × 5 prayers × 3 = 105.
        // Trim to 60 nearest-future notifications to stay safely under limit.
        const trimmed = toSchedule
          .sort((a, b) => a.schedule.at.getTime() - b.schedule.at.getTime())
          .slice(0, 60);
        await LocalNotifications.schedule({ notifications: trimmed });
        console.log(`[notif] scheduled ${trimmed.length} prayer notifications`);
      } catch (e) {
        console.error('[notif] schedule failed', e);
      }
    };

    schedule();

    // Re-schedule on app resume
    let resumeListener: any;
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        lastScheduleKey.current = '';
        schedule();
      }
    }).then((l) => (resumeListener = l));

    return () => {
      if (resumeListener?.remove) resumeListener.remove();
    };
  }, [timings, settings, todayLog]);
}

/**
 * Listens for taps on log-nag notifications and forwards the prayer key
 * via callback so the caller can open the quick-log sheet.
 */
export function useNotificationActionHandler(onLogNagTap: (prayer: SalahName) => void) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener: any;
    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      const extra = action.notification?.extra as { type?: string; prayer?: string } | undefined;
      if (extra?.type === 'log-nag' && extra.prayer) {
        const salah = KEY_TO_SALAH[extra.prayer];
        if (salah) onLogNagTap(salah);
      }
    }).then((l) => (listener = l));

    return () => {
      if (listener?.remove) listener.remove();
    };
  }, [onLogNagTap]);
}