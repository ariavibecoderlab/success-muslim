# 09 · Deployment & Release

## 9.1 Environments

| Environment | URL / target | Backend | Purpose |
|-------------|--------------|---------|---------|
| Preview | Lovable preview URL | Lovable Cloud (same project) | Live editing inside Lovable. |
| Staging (web) | `https://success-muslim.lovable.app` | Lovable Cloud | Pre-prod smoke testing. |
| Production (web) | `https://successmuslim.app`, `https://www.successmuslim.app` | Lovable Cloud | End users. |
| Android | Google Play (internal → closed → production) | Lovable Cloud | Native shell over the production web build. |
| iOS | TestFlight → App Store | Lovable Cloud | Native shell over the production web build. |

The MVP runs **one Lovable Cloud project**. A separate "Test" backend can be
spun up later for non-prod data without affecting production users.

## 9.2 Build & deploy

### Web

1. Lovable builds `vite build` and deploys to its CDN.
2. SPA routing is handled by `public/_redirects`.
3. PWA assets (icons, manifest) live in `public/`.

### Native shells

```bash
npm run build         # produces dist/
npx cap sync          # copies web bundle to android/ and ios/
npx cap open android  # build & sign in Android Studio
npx cap open ios      # build & sign in Xcode
```

Reusable convenience: `npm run mobile:build` runs build + sync.

## 9.3 Versioning

- Web is continuously deployed (Lovable publishes per release).
- Native uses **semver `MAJOR.MINOR.PATCH`** (e.g., `1.0.0`).
- Android `versionCode` and iOS `CFBundleVersion` are monotonically
  incrementing integers.

## 9.4 Release checklist (per native release)

See `docs/store-listings/pre-submission-checklist.md` for the canonical list.
Highlights:

- [ ] `capacitor.config.ts` has **no** `server.url` set (no live-reload URL).
- [ ] `webContentsDebuggingEnabled: false` on Android (`capacitor.config.ts`).
- [ ] `loggingBehavior: "production"` on iOS and Android.
- [ ] App icon + splash regenerated (`npm run generate:icons` then `npm run sync:icons`).
- [ ] App Links: `public/.well-known/assetlinks.json` lists the production
      SHA-256 fingerprint.
- [ ] Universal Links: `public/.well-known/apple-app-site-association` lists
      the production Apple Team ID + bundle ID `com.brainybunch.successmuslim`.
- [ ] Privacy policy and ToS URLs reachable and current.
- [ ] Data-safety / privacy-nutrition disclosures match
      `docs/store-listings/data-safety-android.md` and `app-privacy-ios.md`.
- [ ] Demo account `appstore.review@successmuslim.app` works.
- [ ] Smoke test: sign-in, dashboard, log salah, log Quran, start IF, family
      create, dakwah share, sign-out.

## 9.5 Release notes

Use the template in `docs/store-listings/release-notes-template.md` for every
native version bump.

## 9.6 Rollback

- **Web:** publish a previous Lovable version.
- **Native:** roll back via Play Console's halt + previous track promotion or
  via App Store Connect's "release this version" toggle. Because the JS bundle
  is served by the native shell from the production web URL (live-reload
  disabled), shipping a fixed web build is often enough to recover users on
  the current native version.

## 9.7 Secrets management

- Publishable Supabase keys live in `.env`. They are **public**.
- Server-side secrets (e.g., Lovable AI API key, JAKIM proxy keys if any) are
  managed via Lovable Cloud Secrets and read by edge functions via
  `Deno.env.get(...)`.
- Rotate quarterly or after any suspected compromise.

## 9.8 Domain configuration

- DNS `successmuslim.app` and `www.successmuslim.app` point at Lovable hosting.
- HSTS + automatic HTTPS provided by the host.
- See `mem://tech/production-constraints` for badge toggles and domain rules.