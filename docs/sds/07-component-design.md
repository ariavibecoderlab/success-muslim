# 07 · Component Design

Each module below documents: **responsibility · public surface · key
collaborators · state · error paths**. Source paths are real; if a path
disappears, the design has drifted and the code is authoritative.

## 7.1 Auth

- **Responsibility:** Email/password + Google OAuth sign-in, signup,
  password reset, post-auth redirect.
- **Surface:** `Auth.tsx`, `AuthCallback.tsx`, `ResetPassword.tsx`;
  context `AuthContext`; hook `useAuth`.
- **Collaborators:** `integrations/supabase/client`, `AuthGuard`.
- **State:** `session`, `user`, `loading`. Initial render blocks data
  hooks until `loading=false` (`mem://tech/auth-guarded-data-fetching`).
- **Errors:** Surface as toasts; `AuthCallback` clears `post_auth_redirect`
  only on success.
- **Notes:** Email-only signup (no phone). Google client is **Web
  application** type so Capacitor WebView works (`mem://auth/google-oauth`).

## 7.2 Onboarding

- **Responsibility:** 7-step welcome capturing identity, location,
  consistency level, focus areas, calc method, prayer settings, finish.
- **Surface:** `Onboarding.tsx`.
- **Collaborators:** `api-profile` (`update`), `usePrayerSettings`.
- **State:** Local wizard state; persisted incrementally.
- **Errors:** Step-level inline; final commit retries via offline queue.

## 7.3 Dashboard & Today

- **Responsibility:** Composite home view; widget registry; greeting;
  life score; next prayer; today's logs; check-in CTA.
- **Surface:** `Dashboard.tsx`, `Today.tsx`, `components/dashboard/*`,
  `components/widgets/*`, `lib/widget-registry.ts`.
- **Collaborators:** `useDashboardData`, `useWidgetPreferences`,
  `useDailyCheckin`, `useContextualGreeting`, `useHijriDate`.
- **State:** Widget order/visibility from `widget_preferences`.
- **Errors:** Empty states per widget; never blocks the page.

## 7.4 Iman pillar

### 7.4.1 Prayer & Adhan
- **Files:** `deen/PrayerTimes.tsx`, `today/TodayPrayerDuo.tsx`,
  `NotificationScheduler.tsx`, `hooks/usePrayer*.ts`,
  `lib/prayer-times.ts`, `lib/jakim-zones.ts`.
- **Logic:** Method selection JAKIM (MY zones) vs Aladhan (else);
  notifications via `utils/native/notifications`.
- **Errors:** Falls back to last cached times on upstream failure.

### 7.4.2 Quran
- **Files:** `QuranTracker.tsx`, `deen/QuranReader.tsx`, `deen/QuranStats.tsx`,
  `deen/SurahReader.tsx`, `components/quran/*`, `hooks/useQuran*.ts`,
  `lib/quran-*.ts`.
- **Design:** Reader paginates with Intersection Observer; partial
  sessions persist to `sm:quran:session` and flush to `api-quran` on
  focus (`mem://tech/quran-session-persistence`).
- **Stats page:** Khatam %, ETA, streak, heatmap. Split from reader for
  UX clarity.
- **Mushaf:** Uthmani font, Ayah-by-Ayah and full-page modes.

### 7.4.3 Dhikr
- **File:** `DhikrCounter.tsx`, `useDhikrQuery`.
- **Design:** Haptic tick on increment; session flushed on save.

### 7.4.4 Sunnah
- **File:** `SunnahTracker.tsx`, `useSunnahQuery`.

### 7.4.5 Sadaqah / Zakat / Fidyah
- **Files:** `deen/SadaqahTracker.tsx`, `ZakatCalculator.tsx`, `Fidyah.tsx`.
- **Logic:** Zakat uses `lib/zakat.ts` (nisab thresholds, gold/silver
  selectable); Sadaqah categorized; Fidyah per missed-fast quantum.

### 7.4.6 Qada / Ramadhan Qada
- **Files:** `QadaSolatSetup.tsx`, `QadaSolatTrack.tsx`,
  `RamadhanQadaSetup.tsx`, `RamadhanQadaTrack.tsx`, `useQadaQuery`.
- **Logic:** Remaining counts per prayer; decrement is server-side in
  `api-misc` to avoid client tampering.

### 7.4.7 Qiyam / Hajj-Umrah / Ramadan optimizer
- **Files:** `deen/QiyamPlanner.tsx`, `deen/HajjUmrahPlanner.tsx`,
  `deen/RamadanOptimizer.tsx`.

### 7.4.8 Daily Dakwah
- **Files:** `deen/DailyDakwah.tsx`, `admin/AdminDawah.tsx`.
- **Design:** Public posters via `dakwah-posters` bucket; Web Share API
  for native share sheet (`utils/native/share`).

### 7.4.9 Salah log
- **Files:** `deen/SalahLog.tsx`, `SalahQuickLogSheet.tsx`,
  `useSalahQuery`, `lib/salah-storage.ts`.
- **Statuses:** `on_time` / `late` / `missed`.

### 7.4.10 Fasting (religious)
- **File:** `deen/DeenFasting.tsx` — Sunnah fasts (Mondays/Thursdays,
  Ayyamul Bidh, Ashura, etc.) logged into `fasting_log`.

## 7.5 Health pillar

- **Files:** `Health.tsx`, `health/Health*.tsx`, `health/IFOnboarding.tsx`,
  `health/HealthIFTimer.tsx`, `hooks/useHealth*.ts`, `useStepsQuery`,
  `lib/health-storage.ts`, `lib/steps-storage.ts`, `lib/fasting-stages.ts`,
  `stores/fastingStore.ts`.
- **IF timer:** Zustand store holds active session; persists to
  `sm:fasting:active`; ends → posts to `api-health`.
- **Steps:** Manual entry only for MVP (no HealthKit/Health Connect).
- **Profile:** `user_health_profiles` drives protocol recommendation.

## 7.6 Wealth pillar

- **Files:** `Wealth.tsx`, `wealth/BudgetTracker.tsx`,
  `wealth/SavingsGoals.tsx`, `wealth/IncomeSources*.tsx`,
  `useWealthSummary`, `useIncomeSources`, `lib/wealth-categories.ts`.
- **Design:** Income/expense/savings as `transactions` with `type`;
  budgets are period-scoped; goals roll up contributions.

## 7.7 Productivity pillar

- **Files:** `Productivity.tsx`, `productivity/DailyTasks.tsx`,
  `productivity/HabitStreaks.tsx`, `productivity/LifeAreas.tsx`,
  hooks `useTasks/Habits/LifeAreasQuery`, `lib/productivity-storage.ts`.
- **Design:** Tasks daily-scoped; habits scored daily into `habit_log`;
  life areas update `life_area_scores`.

## 7.8 Family

- **Files:** `Family.tsx`, `family/CreateFamily.tsx`, `family/JoinFamily.tsx`,
  `family/FamilyDashboard.tsx`, `family/FamilySettings.tsx`,
  `family/MemberProfile.tsx`, `components/family/*`,
  `useFamily`, `useFamilyDashboard`, `lib/family-feed.ts`,
  `lib/family-helpers.ts`.
- **Design:** WhatsApp-style group (`group_type='family'|'class'`); invite
  codes via `lookup_family_by_invite`; leaderboard via
  `get_family_leaderboard` (security definer); privacy via
  `family_privacy_settings` (ghost mode, show on leaderboard).

## 7.9 Blog / CMS

- **Files:** `Blog.tsx`, `BlogPost.tsx`, `admin/AdminBlog.tsx`,
  `components/admin/BlogEditor.tsx`, `components/cms/*`, `EditModeContext`.
- **Design:** Tiptap block editor; published posts in `blog_posts`;
  CMS overlay (`EditMode`) lets admins edit marketing surfaces in place
  via `page_overrides`.

## 7.10 Admin console

- **Files:** `admin/AdminLayout.tsx`, `admin/AdminSidebar.tsx`,
  `admin/Admin*.tsx`, `components/admin/LiveActivityFeed.tsx`,
  `useAdmin`, `useAdminAudit`, `useAdminTimeout`, `AdminGuard`,
  `MobileAdminBlock`.
- **Design:** Desktop-only (`MobileAdminBlock`); idle timeout
  (`useAdminTimeout`); all reads via `admin_*` SECURITY DEFINER RPCs.
- **Pages:** Dashboard, Users, Engagement, Iman Analytics, Health
  Analytics, Families, Audit Log, Blog, Dawah, Announcements, System,
  Analytics.

## 7.11 Settings

- **File:** `Settings.tsx`.
- **Design:** Profile, notifications, prayer/calc method, account
  delete/export, selective cache clear (preserves auth + active IF per
  `mem://tech/data-management-policy`).

## 7.12 Marketing presence

- **Files:** `Landing.tsx`, `Features.tsx`, `About.tsx`, `Install.tsx`,
  `Blog.tsx`, `BlogPost.tsx`, `MarketingLayout.tsx`.
- **Design:** Bento grid landing; platform-aware (Web vs Capacitor
  variants); `/install` documents PWA install path.

## 7.13 Shared infrastructure components

- `ErrorBoundary` — App root catch with reload CTA.
- `OfflineBanner` — Driven by `utils/native/network`.
- `NotificationScheduler` — Schedules adhan + reminders on session start.
- `NativeBridge` — Boots status bar, splash hide, network listener.
- `BackdatePrompt` / `BackdateDatePicker` — Universal 90-day backdate UI.
- `OnboardingTooltips` — Coachmarks; dismissed state in localStorage.