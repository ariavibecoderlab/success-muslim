# Pre-Submission Checklist — Success Muslim

Run through this list before tapping **Submit for Review** on either store. Tick items in order — each row is a hard gate.

## 0. Build & code hygiene

- [ ] `capacitor.config.ts` has **no** `server.url` block (production must run bundled assets)
- [ ] Android `webContentsDebuggingEnabled: false`
- [ ] Android `usesCleartextTraffic="false"` in `AndroidManifest.xml`
- [ ] iOS `NSAllowsArbitraryLoads = false` in `Info.plist`
- [ ] All `console.log` debug noise stripped or guarded behind `import.meta.env.DEV`
- [ ] No secrets/API keys in client bundle (only `VITE_*` publishable values)
- [ ] `npm run build` succeeds with zero TypeScript errors
- [ ] `npm run mobile:build && npx cap sync` succeeds

## 1. Bundle identity

- [ ] `appId = com.brainybunch.successmuslim` consistent across:
  - `capacitor.config.ts`
  - `android/app/build.gradle` (`applicationId` + `namespace`)
  - `ios` Xcode project (`PRODUCT_BUNDLE_IDENTIFIER`)
  - `public/.well-known/assetlinks.json` `package_name`
  - `public/.well-known/apple-app-site-association` `appID` suffix
- [ ] iOS Team ID set in Xcode Signing & Capabilities
- [ ] Android Play App Signing enabled and keystore secured offline
- [ ] `versionCode` (Android) and `CFBundleVersion` (iOS) incremented from previous release
- [ ] `versionName` and `CFBundleShortVersionString` match (e.g. `1.0.0`)

## 2. Deep linking

- [ ] Custom scheme `successmuslim://` opens correct routes on iOS and Android
- [ ] `https://successmuslim.app/.well-known/apple-app-site-association` returns 200, `application/json`, no `.json` extension, with real Team ID
- [ ] `https://successmuslim.app/.well-known/assetlinks.json` returns 200 with real release SHA-256
- [ ] iOS Associated Domains capability added (`applinks:successmuslim.app` + `applinks:www.successmuslim.app`)
- [ ] `adb shell pm get-app-links com.brainybunch.successmuslim` shows `verified`

## 3. Auth

- [ ] Email + password sign-in works on both platforms
- [ ] Google sign-in works on both platforms (web client type for Capacitor)
- [ ] **Sign in with Apple** offered alongside Google (iOS Guideline 4.8 — required if Google is offered)
- [ ] OAuth round trip preserves `post_auth_redirect`
- [ ] Account deletion in-app works end-to-end

## 4. Permissions and privacy

- [ ] iOS Info.plist usage descriptions are present and human-readable for every permission used
- [ ] Android only requests `INTERNET` + `POST_NOTIFICATIONS` (no surprise permissions)
- [ ] App Tracking Transparency NOT prompted (we do not track)
- [ ] App Privacy nutrition label completed (`app-privacy-ios.md`)
- [ ] Play Data Safety form completed (`data-safety-android.md`)
- [ ] Privacy policy URL returns 200
- [ ] Terms of service URL returns 200
- [ ] Support URL returns 200

## 5. Content and quality

- [ ] No placeholder Lorem Ipsum or `TODO` text visible anywhere in UI
- [ ] All Quran ayat verified against Mushaf Madinah Uthmani encoding
- [ ] Prayer times verified for Kuala Lumpur (JAKIM zone WLY01) and one global city (e.g. London) on the day of build
- [ ] Hijri date verified against Umm al-Qura
- [ ] No 404 routes from any in-app navigation
- [ ] Hardware Android back button does sensible navigation
- [ ] Pull-to-refresh either disabled or hooked correctly
- [ ] Offline banner appears in airplane mode and disappears when reconnected
- [ ] App resume refreshes prayer / fasting / salah data

## 6. Store assets

- [ ] App icon 1024×1024 PNG (no alpha) uploaded
- [ ] Android adaptive icon foreground+background uploaded
- [ ] Feature graphic 1024×500 uploaded (Play)
- [ ] 8 iPhone 6.9" screenshots in 4 locales uploaded
- [ ] 8 Android phone screenshots in 4 locales uploaded
- [ ] Title, subtitle/short desc, full description, keywords pasted (per `app-store-listing.md` and `play-store-listing.md`)
- [ ] Release notes pasted (`release-notes-template.md`)

## 7. Reviewer access

- [ ] Demo account `appstore.review@successmuslim.app` created and seeded
- [ ] Demo account `playstore.review@successmuslim.app` created and seeded
- [ ] Demo passwords entered in App Store Connect / Play Console
- [ ] Reviewer notes pasted (`app-store-review-notes.md` / `play-store-review-notes.md`)
- [ ] Reviewer-monitored mailbox checked daily during review window

## 8. Legal & compliance

- [ ] Content rating questionnaire completed
- [ ] Export compliance: app uses HTTPS only — declare standard encryption exemption
- [ ] Copyright string set: `© 2026 BrainyBunch. All rights reserved.`
- [ ] If using any third-party fonts, licences confirmed for commercial mobile distribution
- [ ] No copyrighted recitation audio bundled at v1.0

## 9. Final smoke test on physical devices

- [ ] iPhone (latest iOS) — fresh install, sign up, do every nav tab, sign out, sign back in
- [ ] Android phone (Android 14) — same flow
- [ ] Tablet (optional) — verify layout doesn't break
- [ ] Slow 3G — verify offline banner + cached data
- [ ] Reboot device with app installed — verify scheduled prayer notifications still fire

## 10. Submit

- [ ] Apple: Submit for Review (Manual release recommended for first launch)
- [ ] Google: Production release with **20% staged rollout** for first 48h, then 100%
- [ ] Tag the git commit with the build version
- [ ] Announce in `#release` channel and on social once approved
