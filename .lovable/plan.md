# Production-Ready Capacitor Hardening

The project **already has Capacitor v8 installed** with iOS + Android platforms, `capacitor.config.ts`, `mobile.css` (safe-area utilities), `src/utils/native/*` wrappers (statusBar, splash, haptics, network, share, storage, notifications, etc.), and `MainActivity` / `AppDelegate` scaffolded. Bundle ID is `com.successmuslim.app`.

So this plan focuses on **gaps**, not a fresh install — the safest minimal changes to take it from "scaffolded" to "production-ready".

## What's already done (skip)
- Capacitor core/ios/android/cli installed
- Native plugin wrappers in `src/utils/native/`
- `capacitor.config.ts` with iOS contentInset + Android debugging
- Safe-area CSS utilities in `src/styles/mobile.css`
- iOS/Android native projects added with correct appId

## Plan

### 1. Tighten `capacitor.config.ts` for production
- Remove `server.cleartext: true` (security risk in release; keep only behind a dev flag comment)
- Set `android.webContentsDebuggingEnabled: false` for release (comment with dev override)
- Add `loggingBehavior: "production"` for ios + android
- Add `SplashScreen` plugin config (launchAutoHide: false, background colors matching `--primary` emerald, fade duration)
- Add `Keyboard` plugin config (resize: "native", style: "light")
- Add `StatusBar` plugin config (overlaysWebView: false, style: light, bg `#10B981`)

### 2. Wire native init on app boot
- `src/App.tsx` imports `initStatusBar` and `hideSplashWhenReady` but verify they actually run inside a `useEffect` guarded by `Capacitor.isNativePlatform()`. Add `App.addListener('appUrlOpen', ...)` for deep links and `App.addListener('backButton', ...)` for Android hardware back navigation (history.back, exit on root).
- Add `Network` listener to expose offline state (toast + offline banner via existing toaster).

### 3. Safe-area + viewport audit
- Add `viewport-fit=cover` to `index.html` meta viewport (required for iOS notch safe areas).
- Replace any `min-h-screen` / `h-screen` on root layouts with `min-h-dvh` (already present in `mobile.css` as `.mobile-100vh`); audit `AppLayout.tsx`, `BottomNav.tsx`, modals.
- Ensure `BottomNav` uses `bottom-nav-safe` (env safe-area-inset-bottom).
- Ensure top headers respect `safe-top`.

### 4. Replace unsafe browser-only behavior
Audit and branch with `Capacitor.isNativePlatform()`:
- `window.open(...)` and external `<a target="_blank">` for blog/marketing/share links → use `@capacitor/browser` `Browser.open()` on native.
- `window.location.href = "https://..."` for any external redirects (OAuth callback excluded — that already uses `/~oauth` flow).
- Keep `localStorage` for cache, but mirror critical auth/onboarding flags to `@capacitor/preferences` via the existing `src/utils/native/storage.ts` helpers.

### 5. Deep link / OAuth return readiness
- Add `App.addListener('appUrlOpen')` handler that parses URL and `navigate()`s into the SPA route, restoring `post_auth_redirect` from localStorage (matches existing memory).
- Android: add intent-filter scaffold in `AndroidManifest.xml` for `https://successmuslim.app` + custom scheme `successmuslim://` (with TODO for assetlinks.json).
- iOS: add Associated Domains placeholder in `Info.plist` capabilities + TODO for `apple-app-site-association`.

### 6. Android native polish
- Set `android:usesCleartextTraffic="false"` for release (network_security_config for dev override).
- Confirm `minSdkVersion` ≥ 23 and `targetSdkVersion` = 35 (Capacitor 8 requirement; bump in `variables.gradle` if low).
- Hardware back button: handled in step 2.

### 7. iOS native polish
- `Info.plist`: add `UIViewControllerBasedStatusBarAppearance=false` (already true — flip), `NSAppTransportSecurity` defaults (no arbitrary loads), and stub `NSCameraUsageDescription` / `NSPhotoLibraryUsageDescription` / `NSLocationWhenInUseUsageDescription` only with TODO comments since the app currently uses none.
- Confirm `iOS Deployment Target` ≥ 14.0 in `project.pbxproj`.

### 8. Mobile UX wins (small, high-impact)
- Add light haptic on primary buttons via `useHaptics()` hook (wrap `@capacitor/haptics`); fire on Salah log, fasting start/stop, dhikr tap.
- Offline banner: small top bar when `Network.getStatus().connected === false`.
- App resume hook: on `App.addListener('resume')`, invalidate critical React Query keys (prayer times, salah, fasting) so stale data refreshes.

### 9. Package scripts
Add the missing scripts to `package.json`:
- `cap:copy`: `npx cap copy`
- `cap:run:ios`: `npx cap run ios`
- `cap:run:android`: `npx cap run android`
- `mobile:build`: `npm run build && npx cap sync`

### 10. Documentation
Create `docs/MOBILE_CAPACITOR_CHECKLIST.md` covering:
- Local dev build & run on simulator/device
- Sync workflow (`npm run mobile:build`)
- Permissions checklist (none required today; how to add)
- Deep link verification (assetlinks.json, AASA file URLs)
- Release signing (manual — no fake keystore)
- App Store / Play Store readiness checklist
- App icon + splash regeneration via existing `scripts/generate-icons.js`

## Out of scope (explicitly NOT changing)
- Routing, auth flow, business logic, Supabase wiring
- Visual design / theme / fonts
- Existing service worker / PWA `/install` page
- No Ionic UI introduction
- No React Native migration
- Push notifications stay scaffolded only (no Firebase/APNs keys yet)

## Manual steps user must do after
1. Pull repo locally, `npm install`, `npm run mobile:build`.
2. `npx cap open ios` / `npx cap open android` to build & sign.
3. Generate real icons: `npm run generate:icons` then `npm run sync:icons`.
4. For deep links: host real `assetlinks.json` and `apple-app-site-association` on `successmuslim.app/.well-known/`.
5. Add Firebase config + APNs key when push is needed.
