import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { PrayerTime, PrayerSettings } from '@/lib/prayer-times';
import { getEffectiveTime } from '@/lib/prayer-times';

const PRAYER_DISPLAY: Record<string, string> = {
  fajr: 'Subuh',
  dhuhr: 'Zohor',
  asr: 'Asar',
  maghrib: 'Maghrib',
  isha: 'Isyak',
};

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermission(): NotificationPermissionState {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!('Notification' in window)) return 'unsupported';
  const result = await Notification.requestPermission();
  return result;
}

function showNotification(title: string, body: string, tag: string) {
  if (getNotificationPermission() !== 'granted') return;

  try {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag, // prevents duplicate notifications
      requireInteraction: true,
    });

    // Auto-close after 30 seconds
    setTimeout(() => notification.close(), 30000);
  } catch {
    // Fallback to in-app toast
    toast(title, { description: body });
  }
}

function vibrateDevice() {
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }
}

interface ScheduledTimer {
  prayerKey: string;
  type: 'main' | 'pre';
  timeoutId: ReturnType<typeof setTimeout>;
}

export function usePrayerNotifications(
  timings: PrayerTime[] | null,
  settings: PrayerSettings
) {
  const timersRef = useRef<ScheduledTimer[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t.timeoutId));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    clearAllTimers();

    if (!timings || timings.length === 0) return;
    if (getNotificationPermission() !== 'granted') return;

    const now = new Date();
    const todayBase = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    timings.forEach(prayer => {
      const key = prayer.key.toLowerCase();
      const config = settings.adhan_settings[key];
      if (!config || config.mode === 'silent') return;
      if (config.enabled === false) return;
      if (config.days && !config.days.includes(now.getDay())) return;

      const effectiveTime = getEffectiveTime(prayer);
      const [h, m] = effectiveTime.split(':').map(Number);
      const prayerMs = todayBase.getTime() + h * 3600000 + m * 60000;
      const displayName = PRAYER_DISPLAY[key] || prayer.name;

      // Main prayer notification
      const mainDelay = prayerMs - now.getTime();
      if (mainDelay > 0) {
        const timeoutId = setTimeout(() => {
          if (config.mode === 'vibrate') {
            vibrateDevice();
            toast(`🕌 ${displayName}`, {
              description: 'It\'s time for prayer',
            });
          } else {
            showNotification(
              `🕌 ${displayName} - Prayer Time`,
              `It's time for ${displayName} prayer. May Allah accept your ibadah.`,
              `prayer-${key}`
            );
          }
        }, mainDelay);

        timersRef.current.push({ prayerKey: key, type: 'main', timeoutId });
      }

      // Pre-reminder notification
      if (config.preReminder > 0) {
        const preDelay = prayerMs - config.preReminder * 60000 - now.getTime();
        if (preDelay > 0) {
          const timeoutId = setTimeout(() => {
            showNotification(
              `⏰ ${displayName} in ${config.preReminder} min`,
              `${displayName} prayer is coming up. Prepare for salah.`,
              `prayer-pre-${key}`
            );
          }, preDelay);

          timersRef.current.push({ prayerKey: key, type: 'pre', timeoutId });
        }
      }
    });

    return clearAllTimers;
  }, [timings, settings.adhan_settings, clearAllTimers]);
}
