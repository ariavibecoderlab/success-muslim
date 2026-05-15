import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

/**
 * Share utility for mobile apps
 * Handles native share functionality
 */

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}

/**
 * Share content using native share sheet
 */
export const shareContent = async (options: ShareOptions): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    // Fallback to Web Share API
    if (navigator.share) {
      try {
        await navigator.share(options);
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Web share failed:', error);
        }
        return false;
      }
    } else {
      console.error('Web Share API not supported');
      return false;
    }
  }

  try {
    await Share.share(options);
    console.log('Shared successfully:', options);
    return true;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Share failed:', error);
    }
    return false;
  }
};

/**
 * Share text
 */
export const shareText = async (text: string, title?: string): Promise<boolean> => {
  return shareContent({
    text,
    title: title || 'Share',
  });
};

/**
 * Share URL
 */
export const shareUrl = async (url: string, title?: string, text?: string): Promise<boolean> => {
  return shareContent({
    url,
    text,
    title: title || 'Share Link',
  });
};

/**
 * Share Quran verse
 */
export const shareQuranVerse = async (
  surahName: string,
  ayahNumber: number,
  text: string,
  translation?: string
): Promise<boolean> => {
  const content = `📖 ${surahName}:${ayahNumber}\n\n${text}\n\n${translation ? `${translation}\n\n` : ''}— Success Muslim App`;

  return shareContent({
    text: content,
    title: 'Share Quran Verse',
  });
};

/**
 * Share prayer time
 */
export const sharePrayerTime = async (
  prayerName: string,
  time: string,
  date?: string
): Promise<boolean> => {
  const content = `🕌 ${prayerName} Prayer Time\n${date ? `Date: ${date}\n` : ''}Time: ${time}\n\n— Success Muslim App`;

  return shareContent({
    text: content,
    title: 'Share Prayer Time',
  });
};

/**
 * Share app invitation
 */
export const shareAppInvitation = async (): Promise<boolean> => {
  const content = `Check out Success Muslim - the all-in-one Muslim lifestyle app!\n\nTrack prayers, Quran, fasting, health, wealth, and productivity all in one place.\n\nDownload now: https://successmuslim.app`;

  return shareContent({
    text: content,
    title: 'Invite Friends',
    url: 'https://successmuslim.app',
  });
};

/**
 * Share achievement
 */
export const shareAchievement = async (
  achievementTitle: string,
  achievementDescription: string
): Promise<boolean> => {
  const content = `🎉 Achievement Unlocked!\n\n${achievementTitle}\n${achievementDescription}\n\n— Success Muslim App`;

  return shareContent({
    text: content,
    title: 'Share Achievement',
  });
};

/**
 * Share daily quote
 */
export const shareDailyQuote = async (quote: string, author?: string): Promise<boolean> => {
  const content = `"${quote}"${author ? `\n\n— ${author}` : ''}\n\n— Success Muslim App`;

  return shareContent({
    text: content,
    title: 'Share Quote',
  });
};

/**
 * Check if share is available
 */
export const canShare = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return typeof navigator.share !== 'undefined';
  }

  try {
    // Try to check if share is available
    return true; // Capacitor Share is always available on mobile
  } catch {
    return false;
  }
};
