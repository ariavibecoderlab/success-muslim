# 04 · Module Decomposition

The frontend is organized by **responsibility layer** (top of tree) and
then by **domain** (within each layer). The convention is enforced by
folder structure under `src/`.

## 4.1 Top-level layers

| Folder | Layer | Rule |
|--------|-------|------|
| `src/pages/` | Route components | One route = one file; no business logic; compose hooks + components. |
| `src/components/` | Reusable UI | Presentational; receives data via props; domain subfolders for cohesion. |
| `src/hooks/` | Domain hooks | All data access; one `use*Query` per domain; hides storage + sync. |
| `src/lib/` | Pure logic + adapters | No React; storage adapters, calculations, mappings, API client. |
| `src/stores/` | Zustand stores | Ephemeral cross-component state (UI store, fasting timer). |
| `src/contexts/` | React contexts | Process-wide: Auth, EditMode. |
| `src/utils/native/` | Capacitor wrappers | Web-safe fallbacks; only place plugins are imported. |
| `src/integrations/` | External SDK glue | Supabase client + types; Lovable adapter. |
| `src/styles/` | Global CSS | `mobile.css`; tokens live in `src/index.css`. |
| `src/assets/` | Static assets | Image, SVG. |

## 4.2 Page → hook → lib map (highlights)

| Domain | Page(s) | Hook(s) | Lib(s) | Edge fn |
|--------|---------|---------|--------|---------|
| Auth | `Auth.tsx`, `AuthCallback.tsx`, `ResetPassword.tsx` | `useAuth`, `AuthContext` | `integrations/supabase/client` | (GoTrue) |
| Onboarding | `Onboarding.tsx` | `useAuth` | `lib/storage` | `api-profile` |
| Dashboard | `Dashboard.tsx` | `useDashboardData`, `useWidgetPreferences` | `lib/life-score` | mixed |
| Today | `Today.tsx` | `useDashboardData` | — | — |
| Prayer | `deen/PrayerTimes.tsx`, `today/TodayPrayerDuo.tsx` | `usePrayerSettings`, `usePrayerNotifications`, `useNativePrayerNotifications` | `lib/prayer-times`, `lib/jakim-zones` | `jakim-proxy` |
| Salah log | `deen/SalahLog.tsx`, `SalahQuickLogSheet.tsx` | `useSalahQuery` | `lib/salah-storage` | `api-salah` |
| Quran | `QuranTracker.tsx`, `deen/QuranReader.tsx`, `deen/QuranStats.tsx`, `deen/SurahReader.tsx` | `useQuranData`, `useQuranReadingLog`, `useQuranStorageQuery` | `lib/quran-api`, `lib/quran-mapping`, `lib/quran-storage` | `api-quran` |
| Dhikr | `DhikrCounter.tsx` | `useDhikrQuery` | `lib/dhikr-storage` | `api-dhikr` |
| Sunnah | `SunnahTracker.tsx` | `useSunnahQuery` | `lib/sunnah-storage` | `api-sunnah` |
| Sadaqah | `deen/SadaqahTracker.tsx` | (inline) | — | `api-misc` |
| Zakat | `ZakatCalculator.tsx` | (inline) | `lib/zakat` | `api-misc` |
| Fidyah | `Fidyah.tsx` | `useFidyahQuery` | — | `api-misc` |
| Qada | `QadaSolatSetup.tsx`, `QadaSolatTrack.tsx` | `useQadaQuery` | — | `api-misc` |
| Ramadhan Qada | `RamadhanQadaSetup.tsx`, `RamadhanQadaTrack.tsx` | `useQadaQuery` | — | `api-misc` |
| Qiyam | `deen/QiyamPlanner.tsx` | inline | — | `api-misc` |
| Hajj/Umrah | `deen/HajjUmrahPlanner.tsx` | inline | — | `api-misc` |
| Dakwah | `deen/DailyDakwah.tsx`, `admin/AdminDawah.tsx` | inline | — | `api-admin` |
| Fasting (IF) | `health/HealthFasting.tsx`, `health/HealthIFTimer.tsx`, `health/IFOnboarding.tsx`, `deen/DeenFasting.tsx` | (fastingStore) | `lib/fasting-stages`, `lib/if-*` | `api-health` |
| Health | `Health.tsx`, `health/Health*.tsx` | `useHealthQuery`, `useHealthProfile`, `useStepsQuery` | `lib/health-storage`, `lib/steps-storage` | `api-health` |
| Wealth | `Wealth.tsx`, `wealth/*` | `useWealthSummary`, `useIncomeSources` | `lib/wealth-categories` | `api-wealth` |
| Productivity | `Productivity.tsx`, `productivity/*` | `useTasksQuery`, `useHabitsQuery`, `useLifeAreasQuery` | `lib/productivity-storage` | `api-productivity` |
| Family | `Family.tsx`, `family/*` | `useFamily`, `useFamilyDashboard` | `lib/family-feed`, `lib/family-helpers` | `api-family` |
| Blog/CMS | `Blog.tsx`, `BlogPost.tsx`, `admin/AdminBlog.tsx`, `components/cms/*` | `EditModeContext` | — | `api-admin` |
| Settings | `Settings.tsx` | inline | `lib/storage` | `api-profile` |
| Admin | `admin/*` | `useAdmin`, `useAdminAudit`, `useAdminTimeout` | — | `api-admin` |
| Daily check-in | (Dashboard widget) | `useDailyCheckin` | — | `api-checkin` |

## 4.3 Shared components

| Component | Purpose |
|-----------|---------|
| `AppLayout` | Authenticated shell: `max-w-md`, offline banner, bottom nav. |
| `SubPageLayout` | Subpage shell with history-aware back. |
| `MarketingLayout` | Full-width landing/blog shell. |
| `AppHeader` | Branded header with smlogo. |
| `BottomNav` | 7-tab bottom navigation. |
| `AuthGuard` | Redirects unauthenticated users; preserves `post_auth_redirect`. |
| `AdminGuard` | Wraps admin routes; requires `has_role('admin')` + idle timeout. |
| `MobileAdminBlock` | Blocks admin on small viewports for safety. |
| `OfflineBanner` | Driven by `@capacitor/network`. |
| `BackdateDatePicker` / `BackdatePrompt` | Universal backdate UI. |
| `NotificationScheduler` | Schedules adhan + reminders. |
| `NativeBridge` | Boots native plugins on mount. |
| `ErrorBoundary` | App-level error catch. |
| `OnboardingTooltips` | Coachmarks for first-run hints. |
| `components/cms/*` | `EditableText/Image/Icon/Box` and `EditModeToggle`. |
| `components/dashboard/*` | Dashboard widget primitives. |
| `components/widgets/*` | Widget registry items. |

## 4.4 Cross-domain libs

| File | Responsibility |
|------|----------------|
| `lib/api-client.ts` | Typed fetch wrapper for edge functions. |
| `lib/db-sync.ts` | Pending-queue flush on focus / online / auth restore. |
| `lib/storage.ts` | Low-level localStorage helpers (namespaced). |
| `lib/life-score.ts` | Composite Iman/Wellness/Productivity score. |
| `lib/calculations.ts` | Shared numeric helpers (BMI, percentages). |
| `lib/hijri.ts` | Hijri date conversion. |
| `lib/types.ts` | Shared TS types. |
| `lib/utils.ts` | `cn`, formatting, generic helpers. |
| `lib/widget-registry.ts` | Map widget id → component for the dashboard. |

## 4.5 Ownership rules

1. **Pages own composition, not data.** Pages call hooks; they never call
   Supabase directly.
2. **Hooks own data.** All reads/writes flow through `use*Query`; UI never
   touches `localStorage` or `supabase` itself except in the auth flow.
3. **Lib owns logic.** Pure functions live in `lib/`; they are unit-testable.
4. **Native code is wrapped.** Components never import `@capacitor/*`
   directly — always via `src/utils/native/*`.