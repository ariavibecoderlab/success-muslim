import { Device, DeviceInfo } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

let cachedDeviceInfo: DeviceInfo | null = null;

export const getDeviceInfo = async (): Promise<DeviceInfo | null> => {
  if (!Capacitor.isNativePlatform()) {
    return {
      model: 'Web Browser',
      platform: 'web',
      operatingSystem: 'unknown',
      osVersion: navigator.userAgent,
      manufacturer: 'Unknown',
      isVirtual: false,
      name: 'Web App',
      webViewVersion: 'N/A',
    } as DeviceInfo;
  }

  try {
    const info = await Device.getInfo();
    cachedDeviceInfo = info;
    return info;
  } catch (error) {
    console.error('Failed to get device info:', error);
    return null;
  }
};

export const getDeviceId = async (): Promise<string | null> => {
  if (!Capacitor.isNativePlatform()) {
    const storedId = localStorage.getItem('device_id');
    if (storedId) return storedId;
    const newId = `web_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('device_id', newId);
    return newId;
  }

  try {
    const id = await Device.getId();
    return id.identifier;
  } catch (error) {
    console.error('Failed to get device ID:', error);
    return null;
  }
};

export const getBatteryInfo = async (): Promise<{ level: number; isCharging: boolean } | null> => {
  if (!Capacitor.isNativePlatform()) {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return { level: battery.level, isCharging: battery.charging };
      } catch {
        return null;
      }
    }
    return null;
  }
  return null;
};

export const isIOS = async (): Promise<boolean> => {
  const info = await getDeviceInfo();
  return info?.platform === 'ios';
};

export const isAndroid = async (): Promise<boolean> => {
  const info = await getDeviceInfo();
  return info?.platform === 'android';
};

export const isNative = (): boolean => Capacitor.isNativePlatform();
export const isWeb = (): boolean => Capacitor.getPlatform() === 'web';
export const getPlatform = (): string => Capacitor.getPlatform();

export const getAppVersion = async (): Promise<string | null> => {
  if (!Capacitor.isNativePlatform()) return '1.0.0';
  try {
    const info = await Device.getInfo();
    return (info as any).appVersion || null;
  } catch {
    return null;
  }
};

export const logDeviceInfo = async () => {
  const info = await getDeviceInfo();
  if (info) {
    console.table({
      platform: info.platform,
      model: info.model,
      osVersion: info.osVersion,
      manufacturer: info.manufacturer,
      isVirtual: info.isVirtual,
      name: info.name,
    });
  }
};

export const getCachedDeviceInfo = (): DeviceInfo | null => cachedDeviceInfo;
