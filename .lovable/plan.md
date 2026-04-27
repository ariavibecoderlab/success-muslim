## Goal
Schedule **native** (Capacitor LocalNotifications) reminders on iOS/Android so the user gets prayer-time alerts and a follow-up "log your Salah" nag if a prayer hasn't been logged. Web fallback (browser `Notification`) stays as-is.

## Current State (verified)

| Layer | Status |
|---|---|
| `@capacitor/local-notifications` package | ✅ installed |
| `src/utils/native/notifications.ts` (schedule/cancel helpers) | ✅ exists, but **never called** |
| `src/hooks/usePrayerNotifications.ts` | ⚠️ Web-only (`new Notification(...)` + `setTimeout`) — won't fire when app is backgrounded on native |
| Permission request | ⚠️ Uses only `Notification.requestPermission()` — fails on native |
| Salah "you haven't logged" nag | ❌ Doesn't exist |
| Settings UI to toggle nag | ❌ Doesn't exist |

Call sites of the existing hook: `PrayerTimes.tsx`, `HeroPrayerCard.tsx`, `Onboarding.tsx`.

## Plan

### 1. Unified permission helper (`src/utils/notification-permission.ts` — new)
- Detect `Capacitor.isNativePlatform()`.
- On native → call `LocalNotifications.requestPermissions()`.
- On web → call `Notification.requestPermission()`.
- Export `requestNotificationPermission()` and `getNotificationPermission()` returning the same shape (`'granted' | 'denied' | 'default' | 'unsupported'`).
- Update `HeroPrayerCard.tsx` and `Onboarding.tsx` imports to use this helper instead of the web-only one in `usePrayerNotifications.ts`.

### 2. Native scheduler (`src/hooks/useNativePrayerNotifications.ts` — new)
- Runs only when `Capacitor.isNativePlatform()` is true; otherwise no-op (web path keeps using `usePrayerNotifications`).
- On every change to `timings` or `settings`:
  - `LocalNotifications.cancel(...)` all of our scheduled IDs (use a deterministic ID space, e.g. `1000–1099` for prayers, `1100–1199` for pre-reminders, `1200–1299` for log nags) so we don't double-schedule.
  - For each enabled prayer in `settings.adhan_settings`:
    - Schedule **main** notification at the prayer time (skip if mode = `silent`, respect `enabled` + `days`).
    - Schedule **pre-reminder** at `prayerMs - preReminder*60000` if `preReminder > 0`.
    - Schedule **log nag** at `prayerMs + nagDelayMin*60000` (default 30 min) — title: "Log your {Prayer}", body: "Tap to mark as on-time, late, or missed". Tapping deep-links to `/iman/prayer-times`.
  - Schedule for **today + next 6 days** so reminders survive even if the app is never opened (Capacitor doesn't have true repeating with our config-per-prayer needs, so we re-schedule a 7-day rolling window each app open).
- Add a listener via `addActionListener` so tapping the nag opens the Salah quick-log sheet (route param `?salah=open`).

### 3. Skip nag when already logged
- Before scheduling each day's nag, read today's `salah_log` (and tomorrow's snapshot via `salah_log` cache for future days isn't possible — only skip *today's* nags based on `useSalahLog`). Future-day nags always schedule; on app open we re-sync.
- Also re-run scheduling whenever `useSalahLog(today)` updates → cancels today's nag for prayers already logged.

### 4. Wire into app
- In `src/App.tsx` (or a new top-level `<NotificationScheduler/>` mounted inside `AppLayout`), call:
  - `useNativePrayerNotifications(timings, settings)` — fed from `usePrayerSettings()` + `fetchPrayerTimes()`.
  - Keep `usePrayerNotifications(...)` mounted for web (it already runs in `PrayerTimes.tsx`; move the call to a global mount so it works from any page on web too).
- Add a Capacitor `App` `appStateChange` listener: when app resumes, re-run scheduling (handles timezone changes, day rollover).

### 5. Settings UI (in `src/pages/deen/PrayerTimes.tsx` notification tab)
- Add new toggle row: **"Remind me to log my Salah"** (default ON).
- Add slider/select: **Nag delay** — 15 / 30 / 45 / 60 min after prayer time (default 30).
- Persist on `PrayerSettings.adhan_settings` as new fields:
  - `log_nag_enabled: boolean` (per-app, store at top level — see schema note below).
  - `log_nag_delay_min: number`.
- Since `prayer_settings` table stores `adhan_settings` as `jsonb`, no DB migration needed — just extend the TS type in `src/lib/prayer-times.ts` (`PrayerSettings`) with the two new optional fields and default them in `DEFAULT_SETTINGS`.

### 6. Permission prompt UX
- On first launch after onboarding (or first visit to `/iman/prayer-times`), if `getNotificationPermission() === 'default'`, show an inline card: "Get reminded for every Salah — Enable notifications". One-tap → `requestNotificationPermission()`.
- Already partially exists for web in `HeroPrayerCard` — extend to native.

## Files

**New**
- `src/utils/notification-permission.ts` — unified permission API
- `src/hooks/useNativePrayerNotifications.ts` — native scheduler with nag logic

**Modified**
- `src/lib/prayer-times.ts` — add `log_nag_enabled` + `log_nag_delay_min` to `PrayerSettings` + defaults
- `src/App.tsx` (or `AppLayout.tsx`) — mount global notification scheduler
- `src/pages/deen/PrayerTimes.tsx` — add nag toggle + delay control in notification settings tab; switch permission imports to the unified helper
- `src/components/dashboard/HeroPrayerCard.tsx` — use unified permission helper
- `src/pages/Onboarding.tsx` — use unified permission helper
- `src/components/SalahQuickLogSheet.tsx` — auto-open when URL param `?salah=open` is present (deep link from notification tap)

**Untouched**
- `src/utils/native/notifications.ts` (helpers already correct)
- `src/hooks/usePrayerNotifications.ts` (kept as web fallback)
- DB schema (settings stored in existing `adhan_settings` jsonb)

## Acceptance criteria
- On a native build (iOS/Android), with permission granted: 5 prayer-time notifications + optional pre-reminders + log-nags fire reliably for the next 7 days even if the app is closed.
- Tapping a "Log your Maghrib" nag opens the app to the Salah quick-log sheet pre-focused on Maghrib.
- Logging a prayer cancels its pending nag for today.
- On web, behavior is unchanged (existing in-foreground browser notifications).
- Settings → Prayer → Notifications shows the new "Remind to log" toggle + delay picker.