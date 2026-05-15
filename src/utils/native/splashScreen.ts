import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

/**
 * SplashScreen utility for mobile apps
 * Controls the splash screen display and behavior
 */

export const showSplash = async (showDuration: number = 2000) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await SplashScreen.show({
      showDuration: showDuration,
      autoHide: true,
    });
    console.log('SplashScreen shown');
  } catch (error) {
    console.error('Failed to show SplashScreen:', error);
  }
};

export const hideSplash = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await SplashScreen.hide();
    console.log('SplashScreen hidden');
  } catch (error) {
    console.error('Failed to hide SplashScreen:', error);
  }
};

export const showSplashAndHide = async (showDuration: number = 2000) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Show splash screen
    await SplashScreen.show({
      showDuration: showDuration,
      autoHide: true,
    });

    // Automatically hide after specified duration
    setTimeout(async () => {
      await SplashScreen.hide();
    }, showDuration);

    console.log('SplashScreen shown and will hide after', showDuration, 'ms');
  } catch (error) {
    console.error('Failed to show/hide SplashScreen:', error);
  }
};

/**
 * Initialize splash screen with proper timing
 * Should be called on app startup
 */
export const initSplashScreen = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Show splash screen initially
    await SplashScreen.show({
      autoHide: false,
    });

    console.log('SplashScreen initialized');
  } catch (error) {
    console.error('SplashScreen initialization failed:', error);
  }
};

/**
 * Hide splash screen when app is ready
 * Should be called after app initialization is complete
 */
export const hideSplashWhenReady = async (delay: number = 500) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Add small delay for smooth transition
    setTimeout(async () => {
      await SplashScreen.hide();
    }, delay);

    console.log('SplashScreen will hide after app is ready');
  } catch (error) {
    console.error('Failed to hide SplashScreen:', error);
  }
};
