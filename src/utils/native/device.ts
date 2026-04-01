import { Device, DeviceInfo } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

/**
 * Device utility for mobile apps
 * Provides device information and platform detection
 */

let cachedDeviceInfo: DeviceInfo | null = null;

/**
 * Get device information
 */
export const getDeviceInfo = async (): Promise<DeviceInfo | null> => {
  if (!Capacitor.isNativePlatform()) {
    // Return basic browser info
    return {
      model: 'Web Browser',
      platform: 'web',
      appVersion: '1.0.0',
      appBuild: '1',
      osVersion: navigator.userAgent,
      manufacturer: 'Unknown',
      isVirtual: false,
      name: 'Web App',
    } as DeviceInfo;
  }

  try {
    const info = await Device.getInfo();
    cachedDeviceInfo = info;
    console.log('Device info:', info);
    return info;
  } catch (error) {
    console.error('Failed to get device info:', error);
    return null;
  }
};

/**
 * Get device ID (unique identifier)
 */
export const getDeviceId = async (): Promise<string | null> => {
  if (!Capacitor.isNativePlatform()) {
    // Generate a random ID for web
    const storedId = localStorage.getItem('device_id');
    if (storedId) return storedId;

    const newId = `web_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('device_id', newId);
    return newId;
  }

  try {
    const id = await Device.getId();
    console.log('Device ID:', id.identifier);
    return id.identifier;
  } catch (error) {
    console.error('Failed to get device ID:', error);
    return null;
  }
};

/**
 * Get battery info (if available)
 */
export const getBatteryInfo = async (): Promise<{ level: number; isCharging: boolean } | null> => {
  if (!Capacitor.isNativePlatform()) {
    // Fallback to Battery API if available
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return {
          level: battery.level,
          isCharging: battery.charging,
        };
      } catch (error) {
        console.error('Failed to get battery info (web):', error);
        return null;
      }
    }
    return null;
  }

  // Battery API requires a plugin, return null for now
  return null;
};

/**
 * Check if running on iOS
 */
export const isIOS = async (): Promise<boolean> => {
  const info = await getDeviceInfo();
  return info?.platform === 'ios';
};

/**
 * Check if running on Android
 */
export const isAndroid = async (): Promise<boolean> => {
  const info = await getDeviceInfo();
  return info?.platform === 'android';
};

/**
 * Check if running on native platform
 */
export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if running on web
 */
export const isWeb = (): boolean => {
  return Capacitor.getPlatform() === 'web';
};

/**
 * Get platform name
 */
export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};

/**
 * Get app version
 */
export const getAppVersion = async (): Promise<string | null> => {
  const info = await getDeviceInfo();
  return info?.appVersion || null;
};

/**
 * Log device info for debugging
 */
export const logDeviceInfo = async () => {
  const info = await getDeviceInfo();
  if (info) {
    console.table({
      platform: info.platform,
      model: info.model,
      osVersion: info.osVersion,
      appVersion: info.appVersion,
      appBuild: info.appBuild,
      manufacturer: info.manufacturer,
      isVirtual: info.isVirtual,
      name: info.name,
    });
  }
};

/**
 * Get cached device info (faster, doesn't call native API)
 */
export const getCachedDeviceInfo = (): DeviceInfo | null => {
  return cachedDeviceInfo;
};
