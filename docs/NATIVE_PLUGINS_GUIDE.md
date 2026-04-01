# Native Plugins Usage Guide
## Success Muslim App - Capacitor Plugins

**Last Updated:** 2026-04-01
**Installed Plugins:** 11

---

## 📦 Installed Plugins

✅ **@capacitor/app** - App lifecycle management
✅ **@capacitor/clipboard** - Copy/paste functionality
✅ **@capacitor/device** - Device information
✅ **@capacitor/haptics** - Vibration feedback
✅ **@capacitor/keyboard** - Keyboard management
✅ **@capacitor/local-notifications** - Prayer time reminders
✅ **@capacitor/network** - Network status monitoring
✅ **@capacitor/preferences** - Persistent storage
✅ **@capacitor/share** - Native share sheet
✅ **@capacitor/splash-screen** - App launch screen
✅ **@capacitor/status-bar** - Status bar customization

---

## 🚀 Quick Start

### Importing Utilities

```typescript
// Import all utilities
import * as Native from '@/utils/native';

// Or import specific utilities
import {
  schedulePrayerNotification,
  copyToClipboard,
  shareQuranVerse,
  hapticSuccess
} from '@/utils/native';
```

---

## 📱 Plugin Usage Examples

### 1. StatusBar - Status Bar Control

```typescript
import { initStatusBar, setStatusBarStyle } from '@/utils/native';

// Initialize status bar (done automatically on app start)
await initStatusBar();

// Change style dynamically
await setStatusBarStyle(Style.Light); // or Style.Dark
```

### 2. Notifications - Prayer Time Reminders

```typescript
import {
  requestNotificationPermission,
  schedulePrayerNotification,
  scheduleDailyPrayers
} from '@/utils/native';

// Request permission first
const granted = await requestNotificationPermission();

if (granted) {
  // Schedule single prayer notification
  await schedulePrayerNotification(
    'Maghrib',
    new Date('2026-04-01T18:30:00'),
    'Time for Maghrib prayer'
  );

  // Or schedule all daily prayers
  await scheduleDailyPrayers({
    fajr: new Date('2026-04-01T05:30:00'),
    dhuhr: new Date('2026-04-01T12:30:00'),
    asr: new Date('2026-04-01T15:45:00'),
    maghrib: new Date('2026-04-01T18:30:00'),
    isha: new Date('2026-04-01T19:45:00'),
  });
}
```

### 3. Haptics - Vibration Feedback

```typescript
import {
  hapticLight,
  hapticSuccess,
  hapticError,
  triggerHaptic
} from '@/utils/native';

// Different feedback types
await hapticLight();      // Button tap
await hapticSuccess();    // Task completed
await hapticError();      // Validation error
await triggerHaptic('medium'); // Generic feedback
```

### 4. Clipboard - Copy/Paste

```typescript
import { copyToClipboard, readFromClipboard } from '@/utils/native';

// Copy Quran verse
await copyToClipboard('Surah Al-Fatihah:1');

// Read from clipboard
const text = await readFromClipboard();
```

### 5. Share - Native Share Sheet

```typescript
import {
  shareQuranVerse,
  sharePrayerTime,
  shareAppInvitation
} from '@/utils/native';

// Share Quran verse
await shareQuranVerse(
  'Al-Fatihah',
  1,
  'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  'In the name of Allah, the Most Gracious, the Most Merciful'
);

// Share prayer time
await sharePrayerTime('Maghrib', '18:30', '2026-04-01');

// Share app invitation
await shareAppInvitation();
```

### 6. Network - Connection Status

```typescript
import {
  isOnline,
  isOffline,
  addNetworkListener
} from '@/utils/native';

// Check connection
const online = await isOnline();

// Monitor network changes
const cleanup = addNetworkListener((status) => {
  if (status.connected) {
    console.log('Back online!');
    // Sync data
  } else {
    console.log('Connection lost');
    // Show offline mode
  }
});

// Cleanup when done
cleanup();
```

### 7. Storage - Persistent Data

```typescript
import {
  setItem,
  getItem,
  setObject,
  getObject,
  STORAGE_KEYS
} from '@/utils/native';

// Save simple value
await setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify({ theme: 'dark' }));

// Get value
const settings = await getItem(STORAGE_KEYS.USER_SETTINGS);

// Save object (auto JSON handling)
await setObject(STORAGE_KEYS.QURAN_BOOKMARKS, {
  '2:255': { timestamp: Date.now() }
});

// Get object (auto JSON parsing)
const bookmarks = await getObject<{ [key: string]: any }>(STORAGE_KEYS.QURAN_BOOKMARKS);
```

### 8. Device - Device Information

```typescript
import {
  getDeviceInfo,
  getDeviceId,
  isIOS,
  isAndroid
} from '@/utils/native';

// Get device info
const info = await getDeviceInfo();
console.log('Platform:', info?.platform);
console.log('Model:', info?.model);

// Get unique device ID
const deviceId = await getDeviceId();

// Check platform
const onIOS = await isIOS();
const onAndroid = await isAndroid();
```

---

## 🎯 Real-World Implementation Examples

### Prayer Times Feature

```typescript
import { requestNotificationPermission, scheduleDailyPrayers } from '@/utils/native';

export const setupPrayerNotifications = async (prayerTimes: PrayerTimes) => {
  // Request permission
  const granted = await requestNotificationPermission();

  if (!granted) {
    // Show permission prompt to user
    return;
  }

  // Schedule all prayers
  const success = await scheduleDailyPrayers({
    fajr: prayerTimes.fajr,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
  });

  if (success) {
    // Show success message
    await hapticSuccess();
  }
};
```

### Quran Reading with Sharing

```typescript
import { shareQuranVerse, copyToClipboard, hapticLight } from '@/utils/native';

export const shareVerse = async (surah: string, ayah: number, text: string, translation: string) => {
  // Share verse
  const shared = await shareQuranVerse(surah, ayah, text, translation);

  if (shared) {
    await hapticLight(); // Success feedback
  }
};

export const copyVerse = async (text: string) => {
  const copied = await copyToClipboard(text);

  if (copied) {
    await hapticLight(); // Success feedback
  }
};
```

### Offline Support

```typescript
import { isOnline, addNetworkListener } from '@/utils/native';

export const setupOfflineSupport = () => {
  // Monitor network status
  const cleanup = addNetworkListener((status) => {
    if (!status.connected) {
      // Show offline banner
      showOfflineBanner();
    } else {
      // Hide offline banner
      hideOfflineBanner();
      // Sync offline data
      syncOfflineData();
    }
  });

  return cleanup;
};

export const syncDataIfOnline = async () => {
  const online = await isOnline();

  if (online) {
    // Sync with server
    await syncWithServer();
  } else {
    // Save locally
    await saveLocally();
  }
};
```

### Fasting Tracker with Notifications

```typescript
import {
  scheduleNotification,
  copyToClipboard,
  shareContent
} from '@/utils/native';

export const setupFastingReminders = async (suhoorTime: Date, iftarTime: Date) => {
  // Suhoor reminder
  await scheduleNotification(
    '🌙 Suhoor Time',
    'Wake up for Suhoor - 1 hour before Fajr',
    suhoorTime
  );

  // Iftar reminder
  await scheduleNotification(
    '🍽️ Iftar Time',
    'Break your fast now',
    iftarTime
  );
};

export const shareFastingProgress = async (days: number, streak: number) => {
  await shareContent({
    text: `Day ${days} of fasting! 🔥\nStreak: ${streak} days\n\n#Ramadan #SuccessMuslim`,
    title: 'Share Fasting Progress'
  });
};
```

---

## 🎨 UI Component Integration

### Add Haptic Feedback to Buttons

```typescript
import { hapticLight } from '@/utils/native';

const Button = ({ onClick, children, ...props }) => {
  const handleClick = async (e) => {
    // Haptic feedback on tap
    await hapticLight();

    // Call original handler
    onClick?.(e);
  };

  return <button onClick={handleClick} {...props}>{children}</button>;
};
```

### Add Share Button to Quran Reader

```typescript
import { shareQuranVerse, copyToClipboard, hapticSuccess } from '@/utils/native';

const QuranShareMenu = ({ surah, ayah, text, translation }) => {
  const handleShare = async () => {
    const shared = await shareQuranVerse(surah, ayah, text, translation);
    if (shared) await hapticSuccess();
  };

  const handleCopy = async () => {
    const copied = await copyToClipboard(`${surah}:${ayah}\n${text}`);
    if (copied) await hapticSuccess();
  };

  return (
    <div>
      <button onClick={handleShare}>Share</button>
      <button onClick={handleCopy}>Copy</button>
    </div>
  );
};
```

---

## ⚡ Performance Tips

1. **Cache Device Info**: Device info is cached after first call
2. **Debounce Haptics**: Don't call haptic functions too rapidly
3. **Check Platform**: Always check if running on native platform
4. **Batch Notifications**: Schedule multiple notifications at once
5. **Lazy Loading**: Native utilities are tree-shakeable

---

## 🐛 Debugging

### Enable Native Logs

```typescript
// In App.tsx, useEffect
useEffect(() => {
  if (Capacitor.isNativePlatform()) {
    // Logs are already enabled in development
    console.log('Native platform detected');
  }
}, []);
```

### Test Notifications

```typescript
// Test notification immediately (not scheduled)
import { scheduleNotification } from '@/utils/native';

await scheduleNotification(
  'Test Notification',
  'This is a test',
  new Date(Date.now() + 5000) // 5 seconds from now
);
```

### Check Plugin Installation

```bash
# List installed plugins
npx cap plugin ls

# Sync plugins
npx cap sync

# Check specific plugin
npx cap plugin android | grep @capacitor/local-notifications
```

---

## 📝 Permission Handling

### Android (android/app/src/main/AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### iOS (ios/App/App/Info.plist)

```xml
<key>NSUserNotificationAlertStyle</key>
<string>alert</string>
```

---

## 🔧 Platform-Specific Notes

### iOS
- Haptics work on compatible devices only
- Status bar styling is limited
- Notifications require user permission

### Android
- All haptics styles work
- Status bar fully customizable
- Notifications can be scheduled without permission (but recommended)

---

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Local Notifications Guide](https://capacitorjs.com/docs/apis/local-notifications)
- [Haptics Guide](https://capacitorjs.com/docs/apis/haptics)

---

**Last Updated:** 2026-04-01
**Status:** ✅ All Plugins Installed & Ready
