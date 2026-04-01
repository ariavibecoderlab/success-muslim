import { Clipboard } from '@capacitor/clipboard';
import { Capacitor } from '@capacitor/core';

/**
 * Clipboard utility for mobile apps
 * Handles copy/paste operations
 */

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    // Fallback to web clipboard API
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard (web):', error);
      return false;
    }
  }

  try {
    await Clipboard.write({
      string: text,
    });
    console.log('Copied to clipboard:', text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Read text from clipboard
 */
export const readFromClipboard = async (): Promise<string | null> => {
  if (!Capacitor.isNativePlatform()) {
    // Fallback to web clipboard API
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.error('Failed to read from clipboard (web):', error);
      return null;
    }
  }

  try {
    const result = await Clipboard.read();
    return result.value || null;
  } catch (error) {
    console.error('Failed to read from clipboard:', error);
    return null;
  }
};

/**
 * Copy URL to clipboard
 */
export const copyUrl = async (url: string): Promise<boolean> => {
  return copyToClipboard(url);
};

/**
 * Share text (combines clipboard + share if available)
 */
export const copyAndShare = async (text: string): Promise<boolean> => {
  const copied = await copyToClipboard(text);
  if (copied) {
    console.log('Text copied and ready to share');
  }
  return copied;
};
