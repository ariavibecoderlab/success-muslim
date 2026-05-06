import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

/**
 * Open an external URL safely.
 * - Native: in-app browser via Capacitor Browser plugin (keeps app state)
 * - Web: window.open with noopener noreferrer
 */
export const openExternal = async (url: string) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Browser.open({ url, presentationStyle: 'popover' });
      return;
    } catch (e) {
      console.error('Browser.open failed, falling back', e);
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};