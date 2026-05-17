# 02 · Overall Description

## 2.1 Product perspective

Success Muslim is a **green-field, single-product** system. It is not a
component of a larger suite and does not embed itself inside another host
application. It does, however, depend on several managed services:

- **Lovable Cloud (Supabase)** provides Postgres, Auth, Storage, and Edge Functions.
- **JAKIM e-Solat** and **Aladhan** provide prayer time data.
- **Google Identity** provides federated sign-in.
- **Lovable AI Gateway** provides optional LLM access (Gemini, GPT-5, etc.).
- **Apple App Store** and **Google Play Store** distribute the native shells.

The codebase is a **single React + Vite application** that is built once and
deployed to three surfaces: web/PWA, Android (Capacitor), iOS (Capacitor).
Native plugins are abstracted under `src/utils/native/*` so the same React tree
runs everywhere.

## 2.2 Product functions (summary)

The detailed list is in Section 04. At a high level the app lets a user:

1. Sign up / sign in, complete a 7-step onboarding, and configure their profile.
2. See a **Dashboard** with the next prayer, a daily check-in card, a life-score
   widget, a wealth summary strip, and a customisable widget grid.
3. Track everything in the four pillars (Iman, Health, Wealth, Productivity).
4. Receive **local notifications** for prayer times (with adhan audio option),
   IF window changes, daily check-in nudges, and announcements.
5. Read the Quran ayah-by-ayah or in **Mushaf** mode (Uthmani script),
   bookmark, and track reading progress + khatam.
6. Join a **Family / Class** group and see a shared activity feed and
   leaderboard.
7. Read CMS-managed **Blog** articles.
8. Manage account, notifications, prayer settings, cache, and data deletion in
   **Settings**.
9. Staff use a web-only **Admin Console** to manage users, content, families,
   and analytics.

## 2.3 User classes and characteristics

| Class | Description | Access |
|-------|-------------|--------|
| **Visitor (unauthenticated)** | Lands on `/home`, `/features`, `/about`, `/install`, `/blog`. May sign up or sign in. | Public marketing pages only. |
| **End User** | Authenticated Muslim user (default role `user`). Uses the full app on web + native. | All `/` app routes inside `AuthGuard`. Cannot access `/admin/*`. |
| **Family / Class member** | An end user who has joined a `families` row via `family_members`. May be `member`, `co-admin`, or `admin` **within that family** (not a global role). | Family routes for that family only, enforced by RLS. |
| **Moderator** | Staff with `user_roles.role = 'moderator'`. Limited admin operations (e.g., dakwah, announcements). | Subset of `/admin/*`, web only. |
| **Admin** | Staff with `user_roles.role = 'admin'`. Full admin console. | All `/admin/*` web routes. **Blocked on native** via `MobileAdminBlock`. |
| **System** | Edge functions and triggers acting on behalf of the platform. | Service-role only. |

Skill level assumption: end users are smartphone-literate, may have **low
bandwidth or intermittent connectivity** (offline-first is a hard requirement),
and may be of any age 13+.

## 2.4 Operating environment

| Surface | Minimum | Target |
|---------|---------|--------|
| Web | Evergreen Chromium, Firefox, Safari (last 2 majors) | Mobile Safari iOS 16+, Chrome Android 10+ |
| Android (Capacitor 8) | Android 7.0 (API 24) | Android 10+ |
| iOS (Capacitor 8) | iOS 14 | iOS 16+ |
| Screen | 320 CSS px wide | 360–430 CSS px wide (phone) |
| Network | Fully offline for cached features | 3G or better |

Server side runs on Lovable Cloud's managed Supabase plan, region as
provisioned. Edge functions run on Deno Deploy infrastructure under Supabase.

## 2.5 Design and implementation constraints

1. **Stack is fixed:** React 18 + Vite 5 + TypeScript 5 + Tailwind v3 + shadcn/ui.
   Switching frameworks is out of scope.
2. **Backend is fixed:** Lovable Cloud (Supabase). No additional backend services
   are introduced; new server logic ships as edge functions.
3. **Light mode only** for MVP.
4. **Mobile-first** at all times — every screen must look correct in a
   `max-w-md` container.
5. **Offline-first:** every loggable feature must work with no network and sync
   when reconnected.
6. **No client-side admin checks** based on `localStorage` or hard-coded
   emails. Role checks must go through `has_role()` on the server.
7. **No `auth.users` foreign keys** from app tables; user identity is mirrored
   via `profiles`.
8. **Roles never live on `profiles`.** They live in `user_roles`.
9. **Bundle ID** is `com.brainybunch.successmuslim`. Do not change without
   coordinated store update.
10. **Single source of truth** for app config is `capacitor.config.ts` and
    `src/integrations/supabase/client.ts` (auto-generated — do **not** edit
    `client.ts` or `types.ts` by hand).

## 2.6 Assumptions and dependencies

- Users grant **notification permission** to get adhan and check-in nudges
  (graceful degradation if denied).
- Users grant **location** only when explicitly enabling auto prayer-time
  lookup. Manual zone selection always works without location.
- JAKIM and Aladhan remain available; if both fail, the last-known cached
  schedule is used.
- Google OAuth client is configured as **Web application** (required for
  Capacitor WebView compatibility).
- The custom domain `successmuslim.app` resolves to the Lovable hosting.
- Hijri date is computed client-side via `src/lib/hijri.ts` and `useHijriDate`.
- Hugeicons remains the icon library; no Lucide icons are introduced in new code.

## 2.7 Apportioning of requirements

Requirements marked `WON'T-for-MVP` in Section 10 are explicitly deferred to a
post-launch release and do **not** block the 1 Ramadan 1447 AH launch.