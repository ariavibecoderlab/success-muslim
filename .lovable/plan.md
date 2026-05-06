# Verify & Harden Deep Linking (iOS + Android)

I cannot run simulators from the sandbox, so this plan does two things:
1. Closes the remaining gaps so deep links actually work end-to-end.
2. Gives you a copy-paste verification checklist to run on your machine.

## Code gaps to close first

### A. Register iOS custom URL scheme
Add to `ios/App/App/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.successmuslim.app</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>successmuslim</string>
    </array>
  </dict>
</array>
```

### B. Preserve deep-link target through auth redirect
Update `src/components/NativeBridge.tsx`:
- Before `navigate(target)`, if the target is a protected route and there is no auth session, write `target` to `localStorage.post_auth_redirect` (matches existing memory pattern in `Post-Auth Redirect`).
- Existing `AuthGuard` / `AuthCallback` will then route the user to the original page after login.

### C. Generate the verification files
Create two **example** files under `public/.well-known/` so they ship at `https://successmuslim.app/.well-known/...`:

- `public/.well-known/assetlinks.json` (Android — needs the release SHA-256 fingerprint, leave a clear placeholder)
- `public/.well-known/apple-app-site-association` (iOS — uses Team ID + bundle ID, leave Team ID placeholder)

Both files must be served as `application/json` — Lovable hosting does this automatically for files in `public/`.

### D. (iOS only) Document the Xcode-side capability
The Associated Domains capability cannot be added from code — it must be added in Xcode → Signing & Capabilities → `applinks:successmuslim.app`. Add a one-paragraph note in `MOBILE_CAPACITOR_CHECKLIST.md` step 4.

## Verification checklist (run locally)

After `npm run mobile:build` and installing on simulator/emulator:

### Android — custom scheme (works immediately)
```bash
adb shell am start -W -a android.intent.action.VIEW -d "successmuslim://today"
adb shell am start -W -a android.intent.action.VIEW -d "successmuslim://health/if-timer"
adb shell am start -W -a android.intent.action.VIEW -d "successmuslim://iman/quran"
```
Expected: app opens directly on the named route.

### Android — universal links (requires hosted assetlinks.json)
```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://successmuslim.app/today" com.successmuslim.app
```
Expected with `assetlinks.json` live + matching SHA-256: opens app without chooser.
Verify the autoVerify status:
```bash
adb shell pm get-app-links com.successmuslim.app
```
Should show `verified` for `successmuslim.app`.

### iOS — custom scheme (after step A above)
```bash
xcrun simctl openurl booted "successmuslim://today"
xcrun simctl openurl booted "successmuslim://health/if-timer"
```
Expected: app opens on the named route.

### iOS — universal links (after step D + AASA hosted)
1. In Xcode add Associated Domain `applinks:successmuslim.app`.
2. Send yourself an iMessage with `https://successmuslim.app/today`, tap the link.
3. Or in Notes app, long-press the link → "Open in Success Muslim".
Expected: opens app, lands on `/today`. (iOS does **not** support universal links from `xcrun simctl openurl` — must test via Messages/Notes.)

### Foreground vs cold-start
Test each link in **two states**:
- App killed (cold start) — `appUrlOpen` fires after `BrowserRouter` mounts, our listener handles it.
- App in background (warm) — `appUrlOpen` fires immediately, listener navigates.

### Auth-required routes
Sign out, then trigger `successmuslim://settings`. Expected (after step B):
- Redirected to `/auth`.
- After login, lands on `/settings`, not `/`.

## Out of scope
- Real release-keystore SHA-256 (you must paste it into `assetlinks.json` from your Play Console signing config).
- Apple Team ID (paste into AASA from Apple Developer account).
- Push notification deep links (separate flow).
