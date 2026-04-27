/**
 * Unified notification permission helper.
 * Works on native (Capacitor LocalNotifications) and web (browser Notification API).
 */
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermission(): NotificationPermissionState {
  if (Capacitor.isNativePlatform()) {
    // Native permission is checked async; assume 'default' until requestNotificationPermission()
    // is called. Components that need accuracy can use checkNativePermission().
    return 'default';
  }
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission as NotificationPermissionState;
}

export async function checkNotificationPermission(): Promise<NotificationPermissionState> {
  if (Capacitor.isNativePlatform()) {
    try {
      const result = await LocalNotifications.checkPermissions();
      if (result.display === 'granted') return 'granted';
      if (result.display === 'denied') return 'denied';
      return 'default';
    } catch {
      return 'unsupported';
    }
  }
  return getNotificationPermission();
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (Capacitor.isNativePlatform()) {
    try {
      const result = await LocalNotifications.requestPermissions();
      if (result.display === 'granted') return 'granted';
      if (result.display === 'denied') return 'denied';
      return 'default';
    } catch {
      return 'unsupported';
    }
  }
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  const result = await Notification.requestPermission();
  return result as NotificationPermissionState;
}

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}