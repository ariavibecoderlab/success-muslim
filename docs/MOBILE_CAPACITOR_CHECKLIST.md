# Mobile Capacitor Checklist

Production readiness guide for the iOS + Android Capacitor builds of Success Muslim.

## 1. Local development

```bash
npm install
npm run mobile:build          # build web + cap sync
npx cap add ios               # only first time
npx cap add android           # only first time
npm run cap:run:ios           # or cap:run:android
```

Open native projects in IDE:
```bash
npm run cap:open:ios          # Xcode
npm run cap:open:android      # Android Studio
```

After any web change:
```bash
npm run mobile:build
```

## 2. Live reload from Lovable sandbox (optional)

Uncomment the `server.url` block in `capacitor.config.ts`, then `npx cap sync`. **Must be removed before release.**

## 3. Permissions

The app currently requires no native permissions. When adding features:

| Feature | iOS Info.plist key | Android permission |
|---|---|---|
| Camera | NSCameraUsageDescription | android.permission.CAMERA |
| Photo library | NSPhotoLibraryUsageDescription | READ_MEDIA_IMAGES |
| Location | NSLocationWhenInUseUsageDescription | ACCESS_FINE_LOCATION |
| Push | (APNs entitlement) | POST_NOTIFICATIONS (API 33+) |

## 4. Deep links

- Custom scheme: `successmuslim://path` (works immediately)
- Universal links: `https://successmuslim.app/*`
  - **iOS**: enable Associated Domains capability in Xcode → add `applinks:successmuslim.app`. Host `apple-app-site-association` at `https://successmuslim.app/.well-known/apple-app-site-association`.
  - **Android**: host `assetlinks.json` at `https://successmuslim.app/.well-known/assetlinks.json` (autoVerify is already enabled in the manifest).

Test:
```bash
# iOS simulator
xcrun simctl openurl booted "successmuslim://today"
# Android emulator
adb shell am start -W -a android.intent.action.VIEW -d "successmuslim://today"
```

## 5. OAuth / payment redirects

- All external URLs are opened via `openExternal()` in `src/utils/native/browser.ts` (in-app Safari/Chrome on native).
- After return from OAuth, `NativeBridge.tsx` parses `appUrlOpen` and routes via React Router. `post_auth_redirect` in localStorage is preserved.

## 6. Release builds

### iOS
1. Open `ios/App/App.xcworkspace` in Xcode.
2. Set your Team in Signing & Capabilities for the `App` target.
3. Bump `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION`.
4. Product → Archive → Distribute to App Store Connect.

### Android
1. Generate a release keystore (locally — never commit):
   ```bash
   keytool -genkey -v -keystore success-muslim-release.keystore \
     -alias success-muslim -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Reference it in `android/app/build.gradle` `signingConfigs.release` (do not commit credentials — use `~/.gradle/gradle.properties`).
3. `cd android && ./gradlew bundleRelease` produces `app-release.aab` for Play Console.

## 7. App icons & splash

```bash
npm run generate:icons        # produces all sizes from source
npm run sync:icons            # copies into ios/ + android/
```

Source: `public/smlogo.webp` (1024x1024 recommended).

## 8. Pre-submission checklist

- [ ] `capacitor.config.ts` has no `server.url`
- [ ] Android `webContentsDebuggingEnabled` is `false`
- [ ] Android `usesCleartextTraffic` is `false`
- [ ] iOS `NSAllowsArbitraryLoads` is `false`
- [ ] App icons generated for all densities
- [ ] Splash screen shows brand color (#10B981)
- [ ] Tested deep link round trip
- [ ] Tested OAuth login round trip
- [ ] Tested airplane-mode offline banner appears
- [ ] Tested hardware back button on Android (history.back, exits at root)
- [ ] Tested app resume refreshes prayer/salah/fasting data
- [ ] Bundle ID + version codes incremented from previous release
- [ ] Privacy policy URL ready for App Store / Play Console
- [ ] No secrets in client bundle (check `.env` only contains `VITE_*` publishable keys)

## 9. Push notifications (deferred)

The `@capacitor/local-notifications` plugin is wired (used by prayer reminders). Remote push via `@capacitor/push-notifications` requires:
- Firebase project + `google-services.json` in `android/app/`
- APNs key + `GoogleService-Info.plist` in `ios/App/App/`
- Push capability enabled in Xcode

Not configured yet — add when you have credentials.