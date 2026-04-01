import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

/**
 * StatusBar utility for mobile apps
 * Controls the status bar appearance and behavior
 */

export const initStatusBar = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Set status bar style to light (dark text on light background)
    await StatusBar.setStyle({ style: Style.Light });

    // Set background color to match app theme
    await StatusBar.setBackgroundColor({ color: '#10B981' });

    // Show status bar (in case it was hidden)
    await StatusBar.show();

    console.log('StatusBar initialized');
  } catch (error) {
    console.error('StatusBar initialization failed:', error);
  }
};

export const hideStatusBar = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.hide();
  } catch (error) {
    console.error('Failed to hide StatusBar:', error);
  }
};

export const showStatusBar = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.show();
  } catch (error) {
    console.error('Failed to show StatusBar:', error);
  }
};

export const setStatusBarStyle = async (style: Style.Light | Style.Dark) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.setStyle({ style });
  } catch (error) {
    console.error('Failed to set StatusBar style:', error);
  }
};

export const setStatusBarBackgroundColor = async (color: string) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.setBackgroundColor({ color });
  } catch (error) {
    console.error('Failed to set StatusBar background color:', error);
  }
};

export const getStatusInfo = async () => {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    const info = await StatusBar.getInfo();
    return info;
  } catch (error) {
    console.error('Failed to get StatusBar info:', error);
    return null;
  }
};
