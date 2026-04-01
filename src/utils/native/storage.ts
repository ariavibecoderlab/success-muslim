import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

/**
 * Storage utility for mobile apps
 * Wraps Capacitor Preferences for persistent key-value storage
 */

const STORAGE_PREFIX = 'sm_'; // Success Muslim prefix

/**
 * Set a value in storage
 */
export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await Preferences.set({
      key: `${STORAGE_PREFIX}${key}`,
      value,
    });
    console.log(`Storage set: ${key}`);
  } catch (error) {
    console.error(`Failed to set ${key} in storage:`, error);
    throw error;
  }
};

/**
 * Get a value from storage
 */
export const getItem = async (key: string): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({
      key: `${STORAGE_PREFIX}${key}`,
    });
    return value;
  } catch (error) {
    console.error(`Failed to get ${key} from storage:`, error);
    return null;
  }
};

/**
 * Remove a value from storage
 */
export const removeItem = async (key: string): Promise<void> => {
  try {
    await Preferences.remove({
      key: `${STORAGE_PREFIX}${key}`,
    });
    console.log(`Storage removed: ${key}`);
  } catch (error) {
    console.error(`Failed to remove ${key} from storage:`, error);
    throw error;
  }
};

/**
 * Clear all values from storage
 */
export const clear = async (): Promise<void> => {
  try {
    await Preferences.clear();
    console.log('Storage cleared');
  } catch (error) {
    console.error('Failed to clear storage:', error);
    throw error;
  }
};

/**
 * Check if a key exists in storage
 */
export const hasItem = async (key: string): Promise<boolean> => {
  try {
    const { value } = await Preferences.get({
      key: `${STORAGE_PREFIX}${key}`,
    });
    return value !== null;
  } catch (error) {
    console.error(`Failed to check ${key} in storage:`, error);
    return false;
  }
};

/**
 * Get all keys from storage
 */
export const keys = async (): Promise<string[]> => {
  try {
    const { keys: allKeys } = await Preferences.keys();
    // Remove prefix from keys
    return allKeys
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .map(key => key.substring(STORAGE_PREFIX.length));
  } catch (error) {
    console.error('Failed to get storage keys:', error);
    return [];
  }
};

/**
 * Set JSON object in storage
 */
export const setObject = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonString = JSON.stringify(value);
    await setItem(key, jsonString);
  } catch (error) {
    console.error(`Failed to set object ${key} in storage:`, error);
    throw error;
  }
};

/**
 * Get JSON object from storage
 */
export const getObject = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await getItem(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Failed to get object ${key} from storage:`, error);
    return null;
  }
};

/**
 * Storage keys used in the app
 */
export const STORAGE_KEYS = {
  // User preferences
  USER_SETTINGS: 'user_settings',
  THEME: 'theme',
  LANGUAGE: 'language',

  // Auth
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',

  // Prayer times
  PRAYER_SETTINGS: 'prayer_settings',
  PRAYER_NOTIFICATIONS: 'prayer_notifications',
  LAST_PRAYER_UPDATE: 'last_prayer_update',

  // Quran
  QURAN_BOOKMARKS: 'quran_bookmarks',
  QURAN_PROGRESS: 'quran_progress',
  LAST_READ_SURAH: 'last_read_surah',

  // Fasting
  FASTING_TRACKER: 'fasting_tracker',
  FASTING_STREAK: 'fasting_streak',

  // Health
  HEALTH_PROFILE: 'health_profile',
  WEIGHT_LOG: 'weight_log',
  HYDRATION_LOG: 'hydration_log',

  // Productivity
  TASKS: 'tasks',
  HABITS: 'habits',
  LIFE_AREAS: 'life_areas',

  // Family
  FAMILY_ID: 'family_id',
  FAMILY_SETTINGS: 'family_settings',

  // Onboarding
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FIRST_TIME: 'first_time',

  // App
  LAST_SYNC: 'last_sync',
  OFFLINE_DATA: 'offline_data',
} as const;

/**
 * Helper functions for common storage operations
 */

export const saveAuthTokens = async (accessToken: string, refreshToken: string) => {
  await setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
  await setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

export const getAuthToken = async (): Promise<string | null> => {
  return getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const clearAuthTokens = async () => {
  await removeItem(STORAGE_KEYS.AUTH_TOKEN);
  await removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const saveUserSettings = async (settings: Record<string, any>) => {
  await setObject(STORAGE_KEYS.USER_SETTINGS, settings);
};

export const getUserSettings = async () => {
  return getObject<Record<string, any>>(STORAGE_KEYS.USER_SETTINGS);
};

export const isOnboardingCompleted = async (): Promise<boolean> => {
  const completed = await getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
  return completed === 'true';
};

export const setOnboardingCompleted = async () => {
  await setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
};

export const isFirstTime = async (): Promise<boolean> => {
  const firstTime = await getItem(STORAGE_KEYS.FIRST_TIME);
  return firstTime !== 'false'; // Default is true
};

export const setFirstTime = async (value: boolean) => {
  await setItem(STORAGE_KEYS.FIRST_TIME, value.toString());
};

/**
 * Export storage data for backup
 */
export const exportStorageData = async (): Promise<Record<string, string>> => {
  const allKeys = await keys();
  const data: Record<string, string> = {};

  for (const key of allKeys) {
    const value = await getItem(key);
    if (value !== null) {
      data[key] = value;
    }
  }

  return data;
};

/**
 * Import storage data from backup
 */
export const importStorageData = async (data: Record<string, string>): Promise<void> => {
  for (const [key, value] of Object.entries(data)) {
    await setItem(key, value);
  }
};
