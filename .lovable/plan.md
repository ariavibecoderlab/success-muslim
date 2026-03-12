

## Two Changes: Prayer Notification Drawer + HeroPrayerCard Location Bug Fix

### 1. Bug Fix: HeroPrayerCard ignores user's saved location

**Problem**: `HeroPrayerCard.tsx` line 32 calls `fetchPrayerTimes()` with **no arguments**, so it always uses default settings (Kuala Lumpur, Malaysia) instead of the user's saved prayer settings.

**Fix**: Import and use `usePrayerSettings()` hook, then pass `settings` to `fetchPrayerTimes(settings)`.

**File**: `src/components/dashboard/HeroPrayerCard.tsx`
- Add `import { usePrayerSettings } from '@/hooks/usePrayerSettings'`
- Call `const { settings } = usePrayerSettings()` inside the component
- Change `fetchPrayerTimes()` to `fetchPrayerTimes(settings)` and add `settings` to the useEffect dependency

---

### 2. Prayer Notification Settings Drawer (per-prayer)

**What**: When tapping the bell icon on each prayer row in the Prayer Times page, a bottom drawer slides up with per-prayer notification settings matching the reference image:
- **Prayer name header** + close button
- **Notify toggle** (Switch)
- **Repeats** row showing "Everyday" with day-of-week circle selectors (S M T W T F S)
- **Notification sound** row → opens a sub-select (Full / Vibrate / Silent)
- **Pre-Adhan Reminder** row → select (None, 5m, 10m, 15m, 20m, 30m)
- **Save button**

**Design**: Dark emerald background (`bg-emerald-900`) to match the reference image, white text, green accent circles for day selectors.

**Backend**: The existing `prayer_settings.adhan_settings` JSON column already stores per-prayer config (`mode`, `audio`, `preReminder`). We extend the `AdhanConfig` type to include `enabled: boolean` and `days: number[]` (0-6, Sun-Sat). No new DB migration needed — the `adhan_settings` JSONB column is flexible.

**Files**:
- **Modify** `src/lib/prayer-times.ts` — extend `AdhanConfig` interface with `enabled` and `days` fields, update defaults
- **Modify** `src/pages/deen/PrayerTimes.tsx`:
  - Add drawer state (`openPrayer: string | null`)
  - Replace the small bell/vibrate/belloff icon button with a tappable bell that opens the drawer
  - Add a `Drawer` component (from vaul, already in `src/components/ui/drawer.tsx`) with the dark emerald notification settings UI
  - On Save, call `saveSettings()` to persist the updated `adhan_settings`
- **Modify** `src/hooks/usePrayerNotifications.ts` — respect `enabled` and `days` fields (skip notification if disabled or day not selected)

