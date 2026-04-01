import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * LocalNotifications utility for mobile apps
 * Handles prayer time reminders and other notifications
 */

export interface PrayerNotification {
  id: number;
  prayerName: string;
  time: Date;
  body?: string;
}

/**
 * Request notification permissions from user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Not running on native platform, skipping notification permission');
    return false;
  }

  try {
    const result = await LocalNotifications.requestPermissions();
    const granted = result.display === 'granted';
    console.log('Notification permission:', granted ? 'granted' : 'denied');
    return granted;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
};

/**
 * Check if notification permissions are granted
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Failed to check notification permission:', error);
    return false;
  }
};

/**
 * Schedule a prayer time notification
 */
export const schedulePrayerNotification = async (
  prayerName: string,
  time: Date,
  body?: string
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

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
          priority: 5, // High priority
          // Enable this for Android to wake up device
          extra: { prayerName, type: 'prayer' },
        },
      ],
    });

    console.log(`Scheduled ${prayerName} notification for`, time);
    return true;
  } catch (error) {
    console.error('Failed to schedule prayer notification:', error);
    return false;
  }
};

/**
 * Schedule all daily prayer notifications
 */
export const scheduleDailyPrayers = async (
  prayerTimes: Record<string, Date>
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const notifications = prayers.map((prayer) => {
      const time = prayerTimes[prayer.toLowerCase()];
      if (!time) return null;

      return {
        id: Math.floor(Math.random() * 1000000),
        title: `🕌 ${prayer}`,
        body: `It's time for ${prayer} prayer`,
        schedule: { at: time, every: 'day' },
        sound: 'default',
        smallIcon: 'ic_stat_icon',
        largeIcon: 'ic_stat_icon',
        priority: 5,
        extra: { prayerName: prayer, type: 'prayer' },
      };
    }).filter(Boolean) as LocalNotificationSchema[];

    await LocalNotifications.schedule({
      notifications,
    });

    console.log(`Scheduled ${notifications.length} daily prayer notifications`);
    return true;
  } catch (error) {
    console.error('Failed to schedule daily prayers:', error);
    return false;
  }
};

/**
 * Schedule a custom notification
 */
export const scheduleNotification = async (
  title: string,
  body: string,
  scheduleAt?: Date,
  id?: number
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: id || Math.floor(Math.random() * 1000000),
          title,
          body,
          schedule: scheduleAt ? { at: scheduleAt } : undefined,
          sound: 'default',
          priority: 5,
        },
      ],
    });

    console.log('Scheduled notification:', title);
    return true;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return false;
  }
};

/**
 * Cancel a specific notification
 */
export const cancelNotification = async (id: number): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await LocalNotifications.cancel({ notifications: [{ id }] });
    console.log('Cancelled notification:', id);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await LocalNotifications.cancel();
    console.log('Cancelled all notifications');
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<LocalNotificationSchema[]> => {
  if (!Capacitor.isNativePlatform()) {
    return [];
  }

  try {
    const result = await LocalNotifications.getPending();
    return result.notifications || [];
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
};

/**
 * Get list of delivered notifications
 */
export const getDeliveredNotifications = async (): Promise<LocalNotificationSchema[]> => {
  if (!Capacitor.isNativePlatform()) {
    return [];
  }

  try {
    const result = await LocalNotifications.getDelivered();
    return result.notifications || [];
  } catch (error) {
    console.error('Failed to get delivered notifications:', error);
    return [];
  }
};

/**
 * Remove all delivered notifications
 */
export const removeDeliveredNotifications = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await LocalNotifications.removeDelivered();
    console.log('Removed all delivered notifications');
  } catch (error) {
    console.error('Failed to remove delivered notifications:', error);
  }
};

/**
 * Register notification action listener
 */
export const addNotificationListener = (
  callback: (notification: LocalNotificationSchema) => void
) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Notification received:', notification);
      callback(notification);
    });
  } catch (error) {
    console.error('Failed to add notification listener:', error);
  }
};

/**
 * Register notification action tap listener
 */
export const addActionListener = (
  callback: (notificationAction: { notificationId: number; actionId: string }) => void
) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
      console.log('Notification action performed:', notificationAction);
      callback(notificationAction);
    });
  } catch (error) {
    console.error('Failed to add action listener:', error);
  }
};
