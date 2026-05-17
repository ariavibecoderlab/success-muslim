# 00 · SRS Master — Success Muslim

> Single-page narrative that summarizes the full SRS and links into each
> detailed section. Use this as your map.

## 0.1 Product one-liner

**Success Muslim** is a mobile-first, offline-first Islamic lifestyle app that
helps a Muslim track and improve four life pillars — **Iman (faith),
Health, Wealth, Productivity** — and stay connected with their **Family / Class**
circle. It runs as a Progressive Web App on the web and as a native shell on
Android and iOS via Capacitor.

- **Publisher:** Brainy Bunch
- **Bundle / App ID:** `com.brainybunch.successmuslim`
- **Primary domain:** `successmuslim.app` (canonical), `success-muslim.lovable.app` (staging)
- **Backend:** Lovable Cloud (managed Supabase) — Postgres + Auth + Edge Functions + Storage
- **MVP launch target:** **1 Ramadan 1447 AH**
- **Theme:** Light mode only for MVP. Refined Islamic Calm aesthetic (white, emerald green, orange).

## 0.2 Reading order

1. **[01 Introduction](./01-introduction.md)** — scope and vocabulary.
2. **[02 Overall Description](./02-overall-description.md)** — who uses it and why.
3. **[03 System Architecture](./03-system-architecture.md)** — how the system is shaped.
4. **[04 Functional Requirements](./04-functional-requirements.md)** — what it does, module by module.
5. **[05 Data Requirements](./05-data-requirements.md)** — what it stores and how it syncs.
6. **[06 External Interfaces](./06-external-interfaces.md)** — how it talks to the world.
7. **[07 Non-Functional Requirements](./07-non-functional-requirements.md)** — how well it must behave.
8. **[08 Security & Privacy](./08-security-and-privacy.md)** — how user data is protected.
9. **[09 Deployment & Release](./09-deployment-and-release.md)** — how it ships.
10. **[10 Traceability & Acceptance](./10-traceability-and-acceptance.md)** — how we verify it.

## 0.3 System at a glance

```text
 ┌──────────────────────────────────────────────────────────────────┐
 │                       SUCCESS MUSLIM CLIENT                       │
 │  React 18 + Vite + TS + Tailwind + shadcn/ui + Hugeicons          │
 │  React Query · Zustand · localStorage (offline-first cache)       │
 │                                                                   │
 │  Web (PWA)   ◄────────►   Capacitor (Android 8.x / iOS)           │
 └─────────────────┬─────────────────────────┬─────────────────────┘
                   │ HTTPS / Supabase SDK     │ Native plugins
                   ▼                          ▼
 ┌──────────────────────────────┐   ┌───────────────────────────────┐
 │   LOVABLE CLOUD (Supabase)   │   │  Device APIs                  │
 │  Postgres (56+ tables, RLS)  │   │  StatusBar, SplashScreen,     │
 │  Auth (email + Google OAuth) │   │  LocalNotifications, Haptics, │
 │  Storage (dakwah posters,    │   │  Share, Clipboard, Network,   │
 │  blog images, CMS overrides) │   │  Preferences, Device          │
 │  Edge Functions: api-*       │   └───────────────────────────────┘
 │   profile · checkin · dhikr  │
 │   family · health · misc     │   ┌───────────────────────────────┐
 │   productivity · quran       │   │  3rd-party services           │
 │   salah · sunnah · wealth    │◄──┤  JAKIM (Malaysia prayer times)│
 │   admin · jakim-proxy        │   │  Aladhan (global prayer times)│
 └──────────────────────────────┘   │  Google OAuth                 │
                                    │  Lovable AI Gateway (optional)│
                                    └───────────────────────────────┘
```

## 0.4 Pillars and modules

| Pillar | Modules |
|--------|---------|
| **Iman** | Prayer Times & Adhan, Salah Log, Quran (Reader + Stats + Mushaf), Dhikr, Sunnah Tracker, Sadaqah, Zakat, Fidyah, Qada Solat, Ramadhan Qada, Qiyam Planner, Ramadan Optimizer, Hajj/Umrah Planner, Daily Dakwah, Deen Fasting |
| **Health** | BMI, Weight, Hydration, Sleep, Steps (manual), Intermittent Fasting (Timer + Onboarding) |
| **Wealth** | Budget / Transactions, Savings Goals, Income Sources, Sadaqah/Zakat summary |
| **Productivity** | Daily Tasks, Habit Streaks, Life Areas (scoring) |
| **Family** | Family or Class groups, members, activity feed, leaderboard, announcements, reactions, privacy |
| **Cross-cutting** | Dashboard / Today, Daily Check-in, Life Score, Onboarding, Settings, Notifications, Backdate, Admin Console, Blog/CMS |

## 0.5 Non-negotiable rules (Core Memory)

- Light mode only for MVP.
- Mobile-first layout: every authenticated screen lives inside a `max-w-md` centered container; desktop renders it as a phone mockup.
- Offline-first: Supabase is the source of truth; localStorage is the zero-latency cache; React Query handles reconciliation.
- Auth: email/password is primary; Google OAuth configured as a Web client so the Capacitor WebView works.
- Roles live in a **separate** `user_roles` table, never on `profiles`. Role checks go through the `has_role()` security definer function.
- 90-day universal backdate window applies to every loggable activity.
- Bottom nav has 7 tabs; nav state is history-aware.

## 0.6 MVP definition (1 Ramadan 1447 AH)

See [10 Traceability & Acceptance](./10-traceability-and-acceptance.md) for the
full MoSCoW table. In short, the MVP **must** ship with:

1. Auth (email + Google) and onboarding.
2. Dashboard, Today, and Daily Check-in.
3. All Iman modules listed above.
4. Health: BMI, Weight, Hydration, Sleep, Steps (manual), IF Timer.
5. Wealth: Budget, Savings, Income Sources, summary strip.
6. Productivity: Tasks, Habits, Life Areas.
7. Family/Class groups.
8. Settings + cache clear + backdate tools.
9. Capacitor Android + iOS shells with adhan-aware local notifications.
10. Web marketing pages: `/home`, `/features`, `/about`, `/install`, `/blog`.