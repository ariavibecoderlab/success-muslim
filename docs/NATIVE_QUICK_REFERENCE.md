# Native Plugins Quick Reference
## Copy-Paste Ready Code Snippets

---

## 📢 Notifications (Prayer Times)

### Request Permission
```typescript
import { requestNotificationPermission } from '@/utils/native';

useEffect(() => {
  requestNotificationPermission().then(granted => {
    if (!granted) {
      // Show permission request UI
    }
  });
}, []);
```

### Schedule Single Prayer
```typescript
import { schedulePrayerNotification } from '@/utils/native';

await schedulePrayerNotification(
  'Maghrib',
  new Date('2026-04-01T18:30:00'),
  'Time for Maghrib prayer'
);
```

### Schedule All Daily Prayers
```typescript
import { scheduleDailyPrayers } from '@/utils/native';

await scheduleDailyPrayers({
  fajr: new Date('2026-04-01T05:30:00'),
  dhuhr: new Date('2026-04-01T12:30:00'),
  asr: new Date('2026-04-01T15:45:00'),
  maghrib: new Date('2026-04-01T18:30:00'),
  isha: new Date('2026-04-01T19:45:00'),
});
```

---

## 📳 Haptics (Feedback)

### Button Tap Feedback
```typescript
import { hapticLight } from '@/utils/native';

const Button = ({ onClick, children, ...props }) => {
  const handleClick = async (e) => {
    await hapticLight();
    onClick?.(e);
  };

  return <button onClick={handleClick} {...props}>{children}</button>;
};
```

### Success/Error Feedback
```typescript
import { hapticSuccess, hapticError } from '@/utils/native';

// On success
await hapticSuccess();

// On error
await hapticError();
```

### Generic Feedback
```typescript
import { triggerHaptic } from '@/utils/native';

await triggerHaptic('light');    // or 'medium', 'heavy'
await triggerHaptic('success');
await triggerHaptic('error');
```

---

## 📋 Clipboard (Copy/Paste)

### Copy Text
```typescript
import { copyToClipboard, hapticLight } from '@/utils/native';

const handleCopy = async (text: string) => {
  const copied = await copyToClipboard(text);
  if (copied) {
    await hapticLight();
    toast.success('Copied to clipboard');
  }
};
```

### Copy Quran Verse
```typescript
const copyVerse = async (surah: string, ayah: number, text: string) => {
  const verseText = `${surah}:${ayah}\n${text}`;
  await copyToClipboard(verseText);
  toast.success('Verse copied');
};
```

---

## 📤 Share (Native Share Sheet)

### Share Quran Verse
```typescript
import { shareQuranVerse } from '@/utils/native';

await shareQuranVerse(
  'Al-Fatihah',
  1,
  'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  'In the name of Allah, the Most Gracious, the Most Merciful'
);
```

### Share Prayer Time
```typescript
import { sharePrayerTime } from '@/utils/native';

await sharePrayerTime('Maghrib', '18:30', '2026-04-01');
```

### Share App Invitation
```typescript
import { shareAppInvitation } from '@/utils/native';

await shareAppInvitation();
```

### Share Custom Content
```typescript
import { shareContent } from '@/utils/native';

await shareContent({
  title: 'My Achievement',
  text: 'I completed 30 days of fasting! 🎉',
  url: 'https://successmuslim.app',
});
```

---

## 📡 Network (Connection Status)

### Check If Online
```typescript
import { isOnline } from '@/utils/native';

const online = await isOnline();
if (!online) {
  toast.error('No internet connection');
}
```

### Monitor Network Changes
```typescript
import { addNetworkListener } from '@/utils/native';

useEffect(() => {
  const cleanup = addNetworkListener((status) => {
    if (!status.connected) {
      // Show offline banner
      setShowOfflineBanner(true);
    } else {
      // Hide offline banner
      setShowOfflineBanner(false);
      // Sync data
      syncData();
    }
  });

  return cleanup;
}, []);
```

### Sync Only When Online
```typescript
import { isOnline } from '@/utils/native';

const saveData = async (data: any) => {
  const online = await isOnline();

  if (online) {
    await syncToServer(data);
  } else {
    await saveLocally(data);
    toast.info('Saved locally. Will sync when online.');
  }
};
```

---

## 💾 Storage (Persistent Data)

### Save User Settings
```typescript
import { setObject, getObject, STORAGE_KEYS } from '@/utils/native';

// Save
await setObject(STORAGE_KEYS.USER_SETTINGS, {
  theme: 'dark',
  language: 'en',
  notificationsEnabled: true,
});

// Load
const settings = await getObject(STORAGE_KEYS.USER_SETTINGS);
```

### Save Auth Tokens
```typescript
import { saveAuthTokens, getAuthToken, clearAuthTokens } from '@/utils/native';

// Save tokens
await saveAuthTokens(accessToken, refreshToken);

// Get token
const token = await getAuthToken();

// Clear tokens
await clearAuthTokens();
```

### Quran Bookmarks
```typescript
import { setItem, getItem } from '@/utils/native';

// Add bookmark
await setItem('quran_bookmark_2_255', JSON.stringify({
  surah: 2,
  ayah: 255,
  timestamp: Date.now(),
}));

// Get bookmark
const bookmark = await getItem('quran_bookmark_2_255');
```

---

## 📱 Device Information

### Get Device Info
```typescript
import { getDeviceInfo } from '@/utils/native';

const info = await getDeviceInfo();
console.log('Platform:', info?.platform); // 'ios', 'android', 'web'
console.log('Model:', info?.model);
```

### Check Platform
```typescript
import { isIOS, isAndroid, isNative } from '@/utils/native';

if (await isIOS()) {
  // iOS-specific behavior
}

if (await isAndroid()) {
  // Android-specific behavior
}

if (isNative()) {
  // Native app behavior
} else {
  // Web behavior
}
```

### Get Device ID
```typescript
import { getDeviceId } from '@/utils/native';

const deviceId = await getDeviceId();
// Use for analytics, etc.
```

---

## 🎨 UI Patterns

### Share Button Component
```typescript
import { shareQuranVerse, copyToClipboard, hapticSuccess } from '@/utils/native';

const ShareButton = ({ surah, ayah, text, translation }) => {
  const handleShare = async () => {
    const shared = await shareQuranVerse(surah, ayah, text, translation);
    if (shared) await hapticSuccess();
  };

  const handleCopy = async () => {
    const copied = await copyToClipboard(`${surah}:${ayah}\n${text}`);
    if (copied) await hapticSuccess();
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleShare}>Share</button>
      <button onClick={handleCopy}>Copy</button>
    </div>
  );
};
```

### Network Status Banner
```typescript
import { addNetworkListener } from '@/utils/native';

const NetworkBanner = () => {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const cleanup = addNetworkListener((status) => {
      setOffline(!status.connected);
    });

    return cleanup;
  }, []);

  if (!offline) return null;

  return (
    <div className="bg-yellow-500 text-black p-2 text-center">
      ⚠️ You're offline. Some features may be limited.
    </div>
  );
};
```

### Offline-Aware Data Fetching
```typescript
import { isOnline } from '@/utils/native';

const useDataFetch = (url: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const online = await isOnline();

      if (online) {
        // Fetch from server
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
        await setObject('cached_data', result); // Cache it
      } else {
        // Load from cache
        const cached = await getObject('cached_data');
        setData(cached);
        toast.info('Using cached data');
      }

      setLoading(false);
    };

    fetchData();
  }, [url]);

  return { data, loading };
};
```

---

## ⚡ Performance Tips

### Debounce Haptics
```typescript
import { hapticLight } from '@/utils/native';

let hapticTimeout: NodeJS.Timeout;

const debouncedHaptic = () => {
  clearTimeout(hapticTimeout);
  hapticTimeout = setTimeout(() => {
    hapticLight();
  }, 100);
};
```

### Lazy Load Native Utilities
```typescript
// Instead of importing at top
// import { hapticLight } from '@/utils/native';

// Import dynamically when needed
const handleTap = async () => {
  const { hapticLight } = await import('@/utils/native');
  await hapticLight();
};
```

---

## 🐛 Debugging

### Check Native Platform
```typescript
import { Capacitor } from '@capacitor/core';

console.log('Platform:', Capacitor.getPlatform());
console.log('Is native:', Capacitor.isNativePlatform());
```

### Test Notification Immediately
```typescript
import { scheduleNotification } from '@/utils/native';

// Schedule 5 seconds from now
await scheduleNotification(
  'Test',
  'This is a test notification',
  new Date(Date.now() + 5000)
);
```

### Log All Native Actions
```typescript
// In your native utility files, add logs
export const hapticLight = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Haptics] Not on native platform');
    return;
  }

  console.log('[Haptics] Triggering light haptic');
  await Haptics.impact({ style: ImpactStyle.Light });
  console.log('[Haptics] Light haptic triggered');
};
```

---

## 📝 Common Imports

```typescript
// All utilities
import * as Native from '@/utils/native';

// Specific utilities
import {
  // Notifications
  requestNotificationPermission,
  schedulePrayerNotification,
  scheduleDailyPrayers,

  // Haptics
  hapticLight,
  hapticSuccess,
  hapticError,
  triggerHaptic,

  // Clipboard
  copyToClipboard,

  // Share
  shareQuranVerse,
  sharePrayerTime,
  shareAppInvitation,

  // Network
  isOnline,
  addNetworkListener,

  // Storage
  setItem,
  getItem,
  setObject,
  getObject,
  STORAGE_KEYS,

  // Device
  getDeviceInfo,
  isIOS,
  isAndroid,
  isNative,
} from '@/utils/native';
```

---

**Pro Tip:** All utilities are type-safe and have web fallbacks!
