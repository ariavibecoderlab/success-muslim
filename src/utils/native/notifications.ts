import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface PrayerNotification {
  id: number;
  prayerName: string;
  time: Date;
  body?: string;
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
};

export const checkNotificationPermission = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Failed to check notification permission:', error);
    return false;
  }
};

export const schedulePrayerNotification = async (
  prayerName: string,
  time: Date,
  body?: string
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const id = Math.floor(Math.random() * 1000000);
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title: `🕌 ${prayerName}`,
          body: body || `It's time for ${prayerName} prayer`,
          schedule: { at: time },
          sound: 'default',
          smallIcon: 'ic_stat_icon',
          largeIcon: 'ic_stat_icon',
          extra: { prayerName, type: 'prayer' },
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Failed to schedule prayer notification:', error);
    return false;
  }
};

export const scheduleDailyPrayers = async (
  prayerTimes: Record<string, Date>
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const notifications = prayers
      .map((prayer) => {
        const time = prayerTimes[prayer.toLowerCase()];
        if (!time) return null;
        return {
          id: Math.floor(Math.random() * 1000000),
          title: `🕌 ${prayer}`,
          body: `It's time for ${prayer} prayer`,
          schedule: { at: time, every: 'day' as const },
          sound: 'default',
          smallIcon: 'ic_stat_icon',
          largeIcon: 'ic_stat_icon',
          extra: { prayerName: prayer, type: 'prayer' },
        };
      })
      .filter(Boolean) as LocalNotificationSchema[];

    await LocalNotifications.schedule({ notifications });
    return true;
  } catch (error) {
    console.error('Failed to schedule daily prayers:', error);
    return false;
  }
};

export const scheduleNotification = async (
  title: string,
  body: string,
  scheduleAt?: Date,
  id?: number
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: id || Math.floor(Math.random() * 1000000),
          title,
          body,
          schedule: scheduleAt ? { at: scheduleAt } : undefined,
          sound: 'default',
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return false;
  }
};

export const cancelNotification = async (id: number): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({ notifications: [] });
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
};

export const getScheduledNotifications = async (): Promise<LocalNotificationSchema[]> => {
  if (!Capacitor.isNativePlatform()) return [];
  try {
    const result = await LocalNotifications.getPending();
    return result.notifications || [];
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
};

export const getDeliveredNotifications = async (): Promise<any[]> => {
  if (!Capacitor.isNativePlatform()) return [];
  try {
    const result = await LocalNotifications.getDeliveredNotifications();
    return result.notifications || [];
  } catch (error) {
    console.error('Failed to get delivered notifications:', error);
    return [];
  }
};

export const removeDeliveredNotifications = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.removeAllDeliveredNotifications();
  } catch (error) {
    console.error('Failed to remove delivered notifications:', error);
  }
};

export const addNotificationListener = (
  callback: (notification: LocalNotificationSchema) => void
) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      callback(notification);
    });
  } catch (error) {
    console.error('Failed to add notification listener:', error);
  }
};

export const addActionListener = (
  callback: (notificationAction: { notificationId: number; actionId: string }) => void
) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      callback({
        notificationId: action.notification.id,
        actionId: action.actionId,
      });
    });
  } catch (error) {
    console.error('Failed to add action listener:', error);
  }
};
