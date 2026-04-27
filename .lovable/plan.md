
# Swap `/` ↔ `/dashboard` + Disable Marketing Landing on Native (Mobile-first)

## Goal
- Move the **marketing Landing** page from `/` to `/home`.
- Move the **authenticated Dashboard** from `/dashboard` to `/` (root becomes the app's main screen).
- On **native mobile builds (Capacitor)**, completely disable `/home` so the marketing landing never shows in the app. The app opens straight into Dashboard (or Auth if not signed in).
- Web behavior:
  - Logged-out users visiting `/` → still see Landing-style entry, but via `/home` (root redirects them to `/home` if they're not authenticated, OR keeps `/` as Dashboard with `AuthGuard` redirecting to `/auth`). See decision below.

---

## Current Behavior (for reference)
- `/` → conditionally renders `<Landing />` (web) or `<MobileLanding />` (native), via `Capacitor.isNativePlatform()`.
- `/dashboard` → `<AuthGuard><AppLayout /></AuthGuard>` with `<Dashboard />`.
- `BottomNav` "Home" tab points to `/dashboard`.
- Many internal redirects point to `/dashboard` (Auth, AuthCallback, AdminGuard, MobileAdminBlock, ErrorBoundary, Onboarding).
- `AppHeader`, `MarketingLayout`, `Install`, `Auth` headers, and `Settings.signOut()` use `/` as the marketing/home root.

---

## Proposed Changes

### 1. `src/App.tsx` — Route swap
- Move `<Dashboard />` to `path="/"` inside the `AuthGuard + AppLayout` group.
- Add a new route `path="/home"` for the marketing landing **only on web**:
  ```tsx
  {!Capacitor.isNativePlatform() && (
    <Route path="/home" element={<Landing />} />
  )}
  ```
- Remove the old `/` route that conditionally rendered Landing/MobileLanding.
- Remove the old `/dashboard` route.
- On native, since `/home` doesn't exist, any accidental nav there falls through to `NotFound`. We'll also add a redirect: on native, `/home` → `/`.

### 2. `src/components/BottomNav.tsx`
- Change `{ icon: Mosque02Icon, label: 'Home', path: '/dashboard' }` → `path: '/'`.
- Update the `active` check so `/` only matches exactly (not `startsWith('/')`, which would always be true). Use exact match for the root tab.

### 3. Update all internal redirects from `/dashboard` → `/`
Files to update:
- `src/pages/Auth.tsx` (2 places: `<Navigate to="/dashboard">` and `navigate('/dashboard')`)
- `src/pages/AuthCallback.tsx` (`redirect || '/dashboard'` → `redirect || '/'`)
- `src/pages/Onboarding.tsx` (`navigate('/dashboard', { replace: true })`)
- `src/components/AdminGuard.tsx` (`<Navigate to="/dashboard">`)
- `src/components/MobileAdminBlock.tsx` (`navigate('/dashboard')`)
- `src/components/ErrorBoundary.tsx` (`window.location.replace('/dashboard')`)
- `src/components/admin/AdminSidebar.tsx` ("Back to App" link → `/`)
- `src/pages/DeenJourney.tsx` (`<SubPageLayout backTo="/dashboard">` → `backTo="/"`)

### 4. Update marketing/home links from `/` → `/home`
Web-only marketing chrome should point to `/home` (the new marketing root), not `/` (which is now the app dashboard).
Files to update:
- `src/components/MarketingLayout.tsx` (2 logo `<Link to="/">` → `/home`)
- `src/pages/Install.tsx` ("back to home" link → `/home`)
- `src/pages/Auth.tsx` (back-to-home link → `/home`)
- `src/pages/Settings.tsx` (`navigate('/')` after signOut → `/home` on web, stay/`/auth` on native)

**Keep as `/`:**
- `src/components/AppHeader.tsx` — the in-app header logo currently links to `/`. Since `/` is now Dashboard, this is correct (logo → home dashboard). No change.

### 5. Native handling for `/home`
In `App.tsx`, add a small guard:
```tsx
<Route
  path="/home"
  element={Capacitor.isNativePlatform() ? <Navigate to="/" replace /> : <Landing />}
/>
```
This way, even if a deep link or stale link points to `/home` on the native app, it cleanly redirects to the dashboard (`/`).

### 6. Remove `MobileLanding`
Since you're going mobile-first and the native app should open straight into `/` (Dashboard / Auth), `MobileLanding` is no longer reachable. Two options:
- **(A)** Delete `src/pages/MobileLanding.tsx` and remove its import from `App.tsx`. ✅ Recommended (cleaner).
- **(B)** Keep the file unused for now in case you want to bring it back.

Plan default: **(A) delete it**, since you said you're focusing on mobile app and the OS itself acts as the "landing".

### 7. AuthGuard behavior at `/`
- On **native**: if the user isn't signed in, `AuthGuard` redirects to `/auth`. ✅ Correct flow.
- On **web**: if a logged-out visitor lands on `/`, `AuthGuard` redirects to `/auth`. They can navigate to `/home` for marketing. We'll also add a small UX touch:
  - On `/auth`, the existing "back to home" link goes to `/home` (web marketing).
  - Optionally add a "Learn more" link on `/auth` pointing to `/home` for web visitors. *(Skip unless you want it.)*

---

## Files Touched (summary)
| File | Change |
|------|--------|
| `src/App.tsx` | Swap `/` and `/dashboard`; add `/home`; native redirect |
| `src/components/BottomNav.tsx` | Home tab → `/`; fix active match |
| `src/pages/Auth.tsx` | Redirects to `/`; back link to `/home` |
| `src/pages/AuthCallback.tsx` | Default redirect to `/` |
| `src/pages/Onboarding.tsx` | Final navigate to `/` |
| `src/components/AdminGuard.tsx` | Non-admin redirect to `/` |
| `src/components/MobileAdminBlock.tsx` | Mobile redirect to `/` |
| `src/components/ErrorBoundary.tsx` | Reload to `/` |
| `src/components/admin/AdminSidebar.tsx` | "Back to App" → `/` |
| `src/pages/DeenJourney.tsx` | `backTo="/"` |
| `src/components/MarketingLayout.tsx` | Logo links → `/home` |
| `src/pages/Install.tsx` | Back link → `/home` |
| `src/pages/Settings.tsx` | Post-signOut navigate → `/home` (web) / `/auth` (native) |
| `src/pages/MobileLanding.tsx` | **Delete** |
| `.lovable/plan.md` | Update with new routing decision |
| `mem://ui/navigation-pattern` | Update Home path to `/` |
| `mem://ui/platform-specific-landing` | Update — landing now `/home`, native skips it |

---

## Decisions Needed
1. **Marketing landing on web at `/home`** — Yes, keep it (web visitors still need a marketing page).
2. **Delete `MobileLanding.tsx`?** — Default plan: **Yes, delete** (mobile-first, OS handles app launch).
3. **Logged-out web user at `/`** — Default: redirect to `/auth` (current `AuthGuard` behavior). Marketing lives at `/home`.

If any of these defaults are wrong, tell me before approving and I'll adjust the plan.

---

## Out of Scope
- No backend / Supabase changes.
- No SEO / sitemap / canonical URL updates (we can do a separate pass if needed — `/home` should probably become the canonical marketing URL and `/` should not be indexed once it's auth-gated).
- No changes to family `/family/:id/dashboard` routes (those are nested family dashboards, not the main app dashboard).
