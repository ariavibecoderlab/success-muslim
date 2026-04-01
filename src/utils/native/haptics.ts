import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Haptics utility for mobile apps
 * Provides vibration feedback for user interactions
 */

/**
 * Light haptic feedback for subtle interactions
 * Use for: Button taps, switches, toggles
 */
export const hapticLight = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    console.error('Failed to trigger light haptic:', error);
  }
};

/**
 * Medium haptic feedback for confirmations
 * Use for: Confirming actions, selection changes
 */
export const hapticMedium = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    console.error('Failed to trigger medium haptic:', error);
  }
};

/**
 * Heavy haptic feedback for important actions
 * Use for: Success, completion, warnings
 */
export const hapticHeavy = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (error) {
    console.error('Failed to trigger heavy haptic:', error);
  }
};

/**
 * Success feedback (light + custom pattern)
 * Use for: Task completion, form submission success
 */
export const hapticSuccess = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await Haptics.impact({ style: ImpactStyle.Light });
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    console.error('Failed to trigger success haptic:', error);
  }
};

/**
 * Error feedback (heavy + custom pattern)
 * Use for: Validation errors, failures
 */
export const hapticError = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    await new Promise(resolve => setTimeout(resolve, 50));
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (error) {
    console.error('Failed to trigger error haptic:', error);
  }
};

/**
 * Selection haptic feedback
 * Use for: Scrolling, wheel pickers, selection changes
 */
export const hapticSelection = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await Haptics.selectionChanged();
  } catch (error) {
    console.error('Failed to trigger selection haptic:', error);
  }
};

/**
 * Notification haptic (vibration pattern)
 * Use for: New messages, reminders, alerts
 */
export const hapticNotification = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Pattern: short-long-short
    await Haptics.impact({ style: ImpactStyle.Medium });
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.impact({ style: ImpactStyle.Heavy });
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    console.error('Failed to trigger notification haptic:', error);
  }
};

/**
 * Start continuous vibration
 * Use for: Loading, processing (remember to call stopVibration)
 */
export const startVibration = async (duration: number = 200) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await Haptics.vibrate({ duration });
    console.log('Vibration started for', duration, 'ms');
  } catch (error) {
    console.error('Failed to start vibration:', error);
  }
};

/**
 * Trigger haptic based on action type
 * Convenient helper for common actions
 */
export const triggerHaptic = async (action: 'success' | 'error' | 'warning' | 'selection' | 'light' | 'medium' | 'heavy') => {
  switch (action) {
    case 'success':
      await hapticSuccess();
      break;
    case 'error':
      await hapticError();
      break;
    case 'warning':
      await hapticMedium();
      break;
    case 'selection':
      await hapticSelection();
      break;
    case 'light':
      await hapticLight();
      break;
    case 'medium':
      await hapticMedium();
      break;
    case 'heavy':
      await hapticHeavy();
      break;
    default:
      await hapticLight();
  }
};

/**
 * Check if haptics are enabled/supported
 */
export const isHapticsAvailable = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    // Try a light impact to test availability
    await Haptics.impact({ style: ImpactStyle.Light });
    return true;
  } catch (error) {
    console.error('Haptics not available:', error);
    return false;
  }
};
