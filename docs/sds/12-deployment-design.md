# 12 · Deployment Design

## 12.1 Environments

| Environment | Web URL | Backend |
|-------------|---------|---------|
| Preview (per branch) | `https://id-preview--<projectId>.lovable.app` | Lovable Cloud (Test) |
| Published (Lovable) | `https://success-muslim.lovable.app` | Lovable Cloud (Live) |
| Production custom domain | `https://successmuslim.app`, `https://www.successmuslim.app` | Lovable Cloud (Live) |
| Native Android | `com.brainybunch.successmuslim` (Play) | Lovable Cloud (Live) |
| Native iOS | App Store bundle id matching `com.brainybunch.successmuslim` | Lovable Cloud (Live) |

## 12.2 Web deployment

- Built by Vite. Static assets served by Lovable hosting with edge CDN.
- `public/_redirects` rewrites unknown paths to `/index.html` for SPA
  routing.
- `public/.well-known/assetlinks.json` and
  `public/.well-known/apple-app-site-association` served as JSON for
  App Links / Universal Links verification.
- Lovable badge visibility toggleable via publish settings.

## 12.3 PWA

- `public/manifest.json` declares name, icons, theme color, display
  `standalone`.
- Service worker (if present) handles asset caching only — application
  data continues to use the React Query + localStorage pattern.
- `/install` page documents install prompts for iOS Safari (Add to Home
  Screen) and Android Chrome (Install app).

## 12.4 Android (Capacitor)

- App ID: `com.brainybunch.successmuslim` (Gradle `applicationId`).
- `android/app/src/main/res/values/strings.xml` carries app name.
- `MainActivity.java` lives in `android/app/src/main/java/com/brainybunch/successmuslim/`.
- Splash + icons synced via `scripts/sync-icons.js`.
- App Links: domain ownership verified through
  `assetlinks.json`; intent filter declared in `AndroidManifest.xml`.
- Build artifact: signed `.aab` uploaded to Google Play Console.
- Versioning: `versionCode` monotonically increasing; `versionName`
  semver (e.g., `1.0.0`).

## 12.5 iOS (Capacitor)

- Xcode project at `ios/App/App.xcodeproj`.
- `Info.plist` carries display name, schemes, and permissions copy
  (notifications, optional location for prayer times).
- Universal Links: AASA file served from `successmuslim.app`; entitlement
  added in Xcode (`Associated Domains` = `applinks:successmuslim.app`).
- Build artifact: `.ipa` uploaded via Xcode Organizer / Transporter.
- Versioning: `CFBundleShortVersionString` semver; `CFBundleVersion`
  monotonically increasing build number.

## 12.6 Capacitor configuration

`capacitor.config.ts`:

- `appId: 'com.brainybunch.successmuslim'`
- `appName: 'Success Muslim'`
- `webDir: 'dist'`
- `server.androidScheme: 'https'`
- Plugin configs for SplashScreen (hide manually after boot),
  StatusBar (emerald), LocalNotifications (default sound).

## 12.7 Edge functions

- Source: `supabase/functions/*/index.ts`.
- Per-function config in `supabase/config.toml` (currently only
  `jakim-proxy` sets `verify_jwt = false`).
- Auto-deployed on push by Lovable Cloud integration.

## 12.8 Database changes

- All schema changes via Supabase migrations (Lovable Cloud manages
  approval).
- `src/integrations/supabase/types.ts` regenerates automatically.
- No `ALTER DATABASE postgres` statements.

## 12.9 Release flow

```text
 feature branch ──► preview deploy (Lovable Test backend)
      │
      ▼
 merge → published web (Lovable Live backend) + custom domain
      │
      ▼
 build Android (.aab)  ──► Play Console (internal → closed → production)
 build iOS (.ipa)      ──► App Store Connect (TestFlight → review → release)
      │
      ▼
 post-release: monitor admin live feed + audit log
```

## 12.10 Rollback

- Web: redeploy previous Lovable build snapshot.
- Native: increase version, ship hotfix; older binaries cannot be
  un-published, only superseded.
- Database: forward-only migrations (no destructive rollbacks; write a
  new migration that reverses the change if needed).

## 12.11 Backups & DR

- Postgres backups managed by Lovable Cloud (daily, point-in-time
  recovery window).
- Storage buckets versioned per provider defaults.
- Client-side `pending` queues serve as a write-side buffer for
  short-lived outages.