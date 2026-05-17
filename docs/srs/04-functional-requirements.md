# 04 · Functional Requirements

> Every requirement has an **ID**, **Priority** (MoSCoW), **Description**, and
> **Source file(s)**. Priorities default to `MUST` for MVP unless stated.

## 4.1 Authentication & Session (AUTH)

### FR-AUTH-001 — Email/password sign up
- **Priority:** MUST.
- Users sign up with email + password at `/auth`. Email is the primary identifier.
  Anonymous sign-ups are forbidden.
- **Source:** `src/pages/Auth.tsx`, `mem://auth/authentication-flow`.

### FR-AUTH-002 — Email/password sign in
- **Priority:** MUST.
- Same form supports sign in. On success the user is routed to `post_auth_redirect`
  (stored in `localStorage`) or `/`.
- **Source:** `src/pages/Auth.tsx`, `src/components/AuthGuard.tsx`, `mem://tech/post-auth-redirect`.

### FR-AUTH-003 — Google OAuth
- **Priority:** MUST.
- The Google client is configured as **Web application** (so the Capacitor
  WebView accepts the redirect). The callback lands on `/auth/callback`.
- **Source:** `src/pages/AuthCallback.tsx`, `mem://auth/google-oauth`.

### FR-AUTH-004 — Password reset
- **Priority:** MUST. Reset link → `/reset-password`.
- **Source:** `src/pages/ResetPassword.tsx`.

### FR-AUTH-005 — HIBP password screen
- **Priority:** MUST. Supabase Auth's HIBP integration must remain enabled.
- **Source:** `mem://tech/security-hardening`.

### FR-AUTH-006 — Session persistence
- **Priority:** MUST. Sessions persist in `localStorage` with auto-refresh.
- **Source:** `src/integrations/supabase/client.ts`.

### FR-AUTH-007 — Deep-link preservation
- **Priority:** MUST. If an unauthenticated user opens any protected route, the
  path is stored in `post_auth_redirect` and restored after sign-in.
- **Source:** `src/components/AuthGuard.tsx`, `mem://tech/post-auth-redirect`.

### FR-AUTH-008 — Auth-guarded data fetching
- **Priority:** MUST. No data hook executes before `AuthContext.loading === false`.
- **Source:** `mem://tech/auth-guarded-data-fetching`.

### FR-AUTH-009 — Cache clearing on sign-out
- **Priority:** MUST. Selective clear: keep auth tokens and active fast.
- **Source:** `src/pages/Settings.tsx`, `mem://tech/data-management-policy`.

## 4.2 Onboarding (ONB)

### FR-ONB-001 — 7-step welcome
- **Priority:** MUST. First-time users see a 7-step onboarding at `/onboarding`
  covering: welcome, pillars overview, profile (name, gender, DOB),
  location/zone, prayer method, notifications opt-in, and finish.
- **Source:** `src/pages/Onboarding.tsx`, `mem://features/onboarding-flow`.

### FR-ONB-002 — Onboarding tooltips on Dashboard
- **Priority:** SHOULD.
- **Source:** `src/components/OnboardingTooltips.tsx`.

## 4.3 Dashboard / Today (DASH)

### FR-DASH-001 — Greeting header
- **Priority:** MUST. Time-aware Salaam + Hijri date.
- **Source:** `src/components/dashboard/GreetingHeader.tsx`, `useContextualGreeting`, `useHijriDate`.

### FR-DASH-002 — Next prayer hero card
- **Priority:** MUST. Shows next prayer time, countdown, and a "Log Salah" CTA.
- **Source:** `src/components/dashboard/HeroPrayerCard.tsx`.

### FR-DASH-003 — Daily check-in card (7-day reward)
- **Priority:** MUST. Awards streaks for daily check-in; a 7-day completion is celebrated.
- **Source:** `src/components/dashboard/DailyCheckinCard.tsx`, `useDailyCheckin`, `mem://features/spiritual-gamification`.

### FR-DASH-004 — Life Score card
- **Priority:** MUST.
- Composite score = weighted blend of **Iman**, **Wellness**, **Productivity**.
- See `src/lib/life-score.ts` and `mem://features/life-score-logic` for weights.
- **Source:** `src/components/dashboard/LifeScoreCard.tsx`.

### FR-DASH-005 — Wealth summary strip
- **Priority:** MUST. Income, expenses, savings, zakat, sadaqah totals.
- **Source:** `src/components/dashboard/WealthSummaryStrip.tsx`, `useWealthSummary`.

### FR-DASH-006 — Quick log grid
- **Priority:** MUST. User-customisable shortcuts via `useQuickLogPreferences`.
- **Source:** `src/components/dashboard/QuickLogGrid.tsx`.

### FR-DASH-007 — Widget grid
- **Priority:** SHOULD. Reorderable widget grid hydrated from `widget_preferences`.
- **Source:** `src/components/dashboard/WidgetGrid.tsx`, `useWidgetPreferences`, `src/lib/widget-registry.ts`.

### FR-DASH-008 — Announcements & Ramadan banners
- **Priority:** MUST. Reads from `announcements` (active range) and a Ramadan-window banner.
- **Source:** `src/components/dashboard/AnnouncementsBanner.tsx`, `RamadanBanner.tsx`.

### FR-DASH-009 — Today screen feature rail
- **Priority:** SHOULD. `/today` shows today-focused widgets (prayer duo, feature rail).
- **Source:** `src/pages/Today.tsx`, `src/components/today/*`.

## 4.4 Iman pillar (IMAN)

### 4.4.1 Prayer Times & Adhan

#### FR-IMAN-PRAYER-001 — Daily prayer schedule
- **Priority:** MUST. Shows the 5 daily prayers + Sunrise + Imsak.
- **Source:** `src/pages/deen/PrayerTimes.tsx`, `src/lib/prayer-times.ts`.

#### FR-IMAN-PRAYER-002 — Calculation methods
- **Priority:** MUST. Supports JAKIM (Malaysia zones) and Aladhan global methods.
- **Source:** `usePrayerSettings`, `src/lib/jakim-zones.ts`, `supabase/functions/jakim-proxy/index.ts`, `mem://features/prayer-adhan-system`.

#### FR-IMAN-PRAYER-003 — Local adhan notification
- **Priority:** MUST. Schedules native local notifications for the next 24h on
  iOS/Android; uses Web Notifications API on PWA. Respects per-prayer mute and
  adhan-style preference.
- **Source:** `useNativePrayerNotifications`, `usePrayerNotifications`, `src/utils/native/notifications.ts`.

#### FR-IMAN-PRAYER-004 — Salah quick log
- **Priority:** MUST. Bottom sheet to log each of the 5 prayers as on-time, late,
  jamaah, qada, or missed.
- **Source:** `src/components/SalahQuickLogSheet.tsx`, `useSalahQuery`, `supabase/functions/api-salah/index.ts`.

#### FR-IMAN-PRAYER-005 — Salah log history
- **Priority:** MUST. `/iman/salah-log` shows 7-day and 30-day breakdowns.
- **Source:** `src/pages/deen/SalahLog.tsx`.

### 4.4.2 Quran

#### FR-IMAN-QURAN-001 — Reader & reading logger
- **Priority:** MUST. `/iman/quran` lets the user "Continue Reading", log a
  session, and quickly add +1/+5/+10 pages or +1 Juz.
- **Source:** `src/pages/deen/QuranReader.tsx`, `useQuranReadingLog`, `mem://features/quran-module`.

#### FR-IMAN-QURAN-002 — Surah / Mushaf reader
- **Priority:** MUST. Ayah-by-ayah and Mushaf (Uthmani) pagination with
  intersection-observer progress tracking.
- **Source:** `src/pages/deen/SurahReader.tsx`, `src/components/quran/MushafPageView.tsx`, `mem://tech/quran-reader-implementation`.

#### FR-IMAN-QURAN-003 — Bookmarks & context menu
- **Priority:** MUST. Long-press an ayah to bookmark / copy / share.
- **Source:** `src/components/quran/AyahContextMenu.tsx`, `quran_bookmarks` table.

#### FR-IMAN-QURAN-004 — Stats page
- **Priority:** MUST. `/iman/quran/stats` shows khatam progress ring, percent,
  ETA, stat tiles, 7-day bar chart, and reading heatmap.
- **Source:** `src/pages/deen/QuranStats.tsx`, `src/components/quran/ReadingHeatmap.tsx`.

#### FR-IMAN-QURAN-005 — Khatam math
- **Priority:** MUST. Khatam denominator = 6,236 ayahs. Progress = read/6236.
- **Source:** `src/lib/quran-mapping.ts`, `mem://tech/quran-data-mapping`.

#### FR-IMAN-QURAN-006 — Reading-session persistence
- **Priority:** MUST. Pending sessions buffered in `localStorage` and flushed
  to `quran_reading_sessions` on next sync.
- **Source:** `useQuranStorageQuery`, `mem://tech/quran-session-persistence`.

#### FR-IMAN-QURAN-007 — Memorization log
- **Priority:** COULD. Tracked in `quran_memorization`.
- **Source:** edge function `api-quran`.

### 4.4.3 Dhikr

#### FR-IMAN-DHIKR-001 — Counter
- **Priority:** MUST. Tap-to-count with haptic feedback (native) and audible
  tick (optional).
- **Source:** `src/pages/DhikrCounter.tsx`, `useDhikrQuery`, `src/utils/native/haptics.ts`.

#### FR-IMAN-DHIKR-002 — Sessions log
- **Priority:** MUST. Saves to `dhikr_sessions` with timestamp, count, and label.

### 4.4.4 Sunnah

#### FR-IMAN-SUNNAH-001 — Daily sunnah checklist
- **Priority:** MUST. Default list (e.g., siwak, dhuha, witr) + custom items.
- **Source:** `src/pages/SunnahTracker.tsx`, `useSunnahQuery`, `sunnah_log` table.

### 4.4.5 Sadaqah & Zakat & Fidyah

#### FR-IMAN-SADAQAH-001 — Sadaqah donations log + goals
- **Priority:** MUST.
- **Source:** `src/pages/deen/SadaqahTracker.tsx`, `sadaqah_donations`, `sadaqah_goals`.

#### FR-IMAN-ZAKAT-001 — Zakat calculator
- **Priority:** MUST. Computes 2.5% on wealth above nisab; stores attempts in
  `zakat_history`.
- **Source:** `src/pages/ZakatCalculator.tsx`, `src/lib/zakat.ts`.

#### FR-IMAN-FIDYAH-001 — Fidyah tracker
- **Priority:** MUST.
- **Source:** `src/pages/Fidyah.tsx`, `useFidyahQuery`, `fidyah_history`.

### 4.4.6 Qada Solat & Ramadhan Qada

#### FR-IMAN-QADA-001 — Qada Solat setup
- **Priority:** MUST. User enters baligh age + current age; system seeds
  remaining counts per prayer. See `mem://features/qada-logic`.
- **Source:** `src/pages/QadaSolatSetup.tsx`.

#### FR-IMAN-QADA-002 — Qada Solat tracking
- **Priority:** MUST.
- **Source:** `src/pages/QadaSolatTrack.tsx`, `useQadaQuery`, `qada_solat` table.

#### FR-IMAN-QADA-003 — Ramadhan Qada (missed fasts) setup + track
- **Priority:** MUST.
- **Source:** `src/pages/RamadhanQadaSetup.tsx`, `src/pages/RamadhanQadaTrack.tsx`, `ramadhan_qada` table.

### 4.4.7 Advanced spiritual planning

#### FR-IMAN-QIYAM-001 — Qiyam planner
- **Priority:** SHOULD. Schedule + log night prayers; settings in `qiyam_settings`,
  log in `qiyam_log`.
- **Source:** `src/pages/deen/QiyamPlanner.tsx`.

#### FR-IMAN-RAMADAN-001 — Ramadan optimizer
- **Priority:** SHOULD. Per-day Ramadan goals (`ramadan_settings`, `ramadan_daily_log`).
- **Source:** `src/pages/deen/RamadanOptimizer.tsx`.

#### FR-IMAN-HAJJ-001 — Hajj/Umrah planner
- **Priority:** COULD. Checklist persisted to `hajj_umrah_progress`.
- **Source:** `src/pages/deen/HajjUmrahPlanner.tsx`.

### 4.4.8 Daily Dakwah

#### FR-IMAN-DAKWAH-001 — Spiritual posters feed
- **Priority:** MUST. `/iman/dakwah` shows admin-published posters from
  `dakwah_posters`. Share uses Web Share API / native share.
- **Source:** `src/pages/deen/DailyDakwah.tsx`, `src/utils/native/share.ts`, `mem://features/daily-dakwah`.

### 4.4.9 Deen Fasting (Sunnah & Ramadan fasts)

#### FR-IMAN-FAST-001 — Fasting log
- **Priority:** MUST. Distinct from health IF: tracks Islamic fasts (Ramadan,
  Monday/Thursday, Ayyamul Bidh, etc.) in `fasting_log`.
- **Source:** `src/pages/deen/DeenFasting.tsx`.

### 4.4.10 Deen Journey (analytics)

#### FR-IMAN-JOURNEY-001 — Worship analytics
- **Priority:** SHOULD. 7-day trends across prayer, Quran, dhikr, fasting,
  sadaqah.
- **Source:** `src/pages/DeenJourney.tsx`, `mem://features/deen-journey`.

## 4.5 Health pillar (HEALTH)

### FR-HEALTH-PROFILE-001 — Health profile
- **Priority:** MUST. Height, weight, DOB, activity level stored in
  `user_health_profiles`.
- **Source:** `useHealthProfile`.

### FR-HEALTH-BMI-001 — BMI
- **Priority:** MUST. Computes BMI from latest weight + height. Records to `health_bmi`.
- **Source:** `src/pages/health/HealthBMI.tsx`, `src/lib/calculations.ts`.

### FR-HEALTH-WEIGHT-001 — Weight tracker
- **Priority:** MUST. Log entries to `weight_log`; chart 30-day trend.
- **Source:** `src/pages/health/HealthWeight.tsx`.

### FR-HEALTH-HYDRATION-001 — Hydration log
- **Priority:** MUST. Custom cup sizes; data in `hydration_log`.
- **Source:** `src/pages/health/HealthHydration.tsx`.

### FR-HEALTH-SLEEP-001 — Sleep log
- **Priority:** MUST. Bed/wake times + quality; data in `sleep_log`.
- **Source:** `src/pages/health/HealthSleep.tsx`.

### FR-HEALTH-STEPS-001 — Manual steps
- **Priority:** MUST (manual entry only for MVP; no HealthKit / Google Fit).
- **Source:** `src/pages/health/HealthSteps.tsx`, `useStepsQuery`, `steps_logs`, `steps_preferences`.

### FR-HEALTH-IF-001 — Intermittent Fasting onboarding
- **Priority:** MUST. Educational flow + protocol selection (16:8, 18:6, OMAD…).
- **Source:** `src/pages/health/IFOnboarding.tsx`, `src/lib/if-onboarding-data.ts`, `mem://features/intermittent-fasting`.

### FR-HEALTH-IF-002 — IF Timer
- **Priority:** MUST. 3-tap start; ring shows elapsed and remaining; stages
  cards via `src/lib/fasting-stages.ts`.
- **Source:** `src/pages/health/HealthIFTimer.tsx`, `src/stores/fastingStore.ts`.

### FR-HEALTH-IF-003 — IF history & heatmap
- **Priority:** MUST. `if_sessions` powers calendar heatmap + streak.
- **Source:** `src/components/health/FastingCalendarHeatmap.tsx`.

### FR-HEALTH-IF-004 — Active-fast survives sign-out
- **Priority:** MUST. Active IF session is preserved during cache clear.
- **Source:** `mem://tech/data-management-policy`.

## 4.6 Wealth pillar (WEALTH)

### FR-WEALTH-BUDGET-001 — Budget & transactions
- **Priority:** MUST. `/wealth/budget` lists `transactions` grouped by category
  with monthly totals from `budget_periods`.
- **Source:** `src/pages/wealth/BudgetTracker.tsx`, `src/lib/wealth-categories.ts`.

### FR-WEALTH-SAVINGS-001 — Savings goals
- **Priority:** MUST. `savings_goals` + `savings_contributions`.
- **Source:** `src/pages/wealth/SavingsGoals.tsx`.

### FR-WEALTH-INCOME-001 — Income sources
- **Priority:** MUST. Editable list with sparkline; supports inline quick-add.
- **Source:** `src/components/wealth/*`, `useIncomeSources`.

### FR-WEALTH-SUMMARY-001 — Wealth summary strip
- **Priority:** MUST. Aggregates income, expenses, savings, zakat, sadaqah for
  the dashboard.
- **Source:** `useWealthSummary`.

## 4.7 Productivity pillar (PROD)

### FR-PROD-TASKS-001 — Daily tasks
- **Priority:** MUST. CRUD on `daily_tasks`; supports priority and due time.
- **Source:** `src/pages/productivity/DailyTasks.tsx`, `useTasksQuery`.

### FR-PROD-HABITS-001 — Habit streaks
- **Priority:** MUST. Habits and completion in `habits` + `habit_log`.
- **Source:** `src/pages/productivity/HabitStreaks.tsx`, `useHabitsQuery`.

### FR-PROD-LIFEAREAS-001 — Life areas scoring
- **Priority:** MUST. User-defined life areas with rolling scores in `life_area_scores`.
- **Source:** `src/pages/productivity/LifeAreas.tsx`, `useLifeAreasQuery`.

## 4.8 Family / Class (FAMILY)

### FR-FAMILY-001 — Create or join a family
- **Priority:** MUST. Two flows: `/family/create` and `/family/join/:code`.
  Code is randomly generated and unique.
- **Source:** `src/pages/family/CreateFamily.tsx`, `JoinFamily.tsx`, `families`, `family_members`.

### FR-FAMILY-002 — Family dashboard
- **Priority:** MUST. `/family/:id/dashboard` shows TodaySnapshot, leaderboard,
  activity feed, announcements.
- **Source:** `src/pages/family/FamilyDashboard.tsx`, `useFamilyDashboard`,
  `src/components/family/*`, `mem://features/family-module`.

### FR-FAMILY-003 — Member profile
- **Priority:** MUST. Member's shared stats subject to their privacy settings.
- **Source:** `src/pages/family/MemberProfile.tsx`, `family_privacy_settings`.

### FR-FAMILY-004 — Privacy controls
- **Priority:** MUST. Each member opts in per metric (e.g., share prayer, share
  Quran progress).
- **Source:** `src/components/family/FamilyPrivacySettings.tsx`.

### FR-FAMILY-005 — Reactions & announcements
- **Priority:** SHOULD. `family_reactions`, `family_announcements`.

### FR-FAMILY-006 — Class type
- **Priority:** SHOULD. Same model with a "class" flavour (teacher + students).

## 4.9 Blog / CMS (BLOG)

### FR-BLOG-001 — Public blog
- **Priority:** MUST. `/blog` lists published posts; `/blog/:slug` renders one.
- **Source:** `src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`, `blog_posts`.

### FR-BLOG-002 — Admin editor
- **Priority:** MUST. Tiptap-based block editor with image upload.
- **Source:** `src/pages/admin/AdminBlog.tsx`, `src/components/admin/BlogEditor.tsx`, `mem://features/blog-cms`.

### FR-CMS-001 — Visual editor for marketing pages
- **Priority:** SHOULD. Admins toggle Edit Mode and override text/images/icons
  on marketing pages; persisted to `page_overrides`.
- **Source:** `src/components/cms/*`, `src/contexts/EditModeContext.tsx`, `mem://tech/cms-visual-editor`.

## 4.10 Admin Console (ADMIN, web only)

### FR-ADMIN-001 — Admin guard + mobile block
- **Priority:** MUST. `AdminGuard` checks `has_role(uid, 'admin')` server-side;
  `MobileAdminBlock` hides admin routes inside Capacitor.
- **Source:** `src/components/AdminGuard.tsx`, `MobileAdminBlock.tsx`, `mem://admin/access-configuration`.

### FR-ADMIN-002 — Admin dashboard
- **Priority:** MUST. KPI tiles + live activity feed.
- **Source:** `src/pages/admin/AdminDashboard.tsx`, `src/components/admin/LiveActivityFeed.tsx`, `app_stats`, `user_activity`.

### FR-ADMIN-003 — Users
- **Priority:** MUST. List users, view profile, change role, suspend.
- **Source:** `src/pages/admin/AdminUsers.tsx`, `supabase/functions/api-admin/index.ts`.

### FR-ADMIN-004 — Engagement, Iman, Health analytics
- **Priority:** SHOULD.
- **Source:** `AdminEngagement.tsx`, `AdminImanAnalytics.tsx`, `AdminHealthAnalytics.tsx`, `AdminAnalytics.tsx`.

### FR-ADMIN-005 — Families admin
- **Priority:** SHOULD.
- **Source:** `AdminFamilies.tsx`.

### FR-ADMIN-006 — Audit log
- **Priority:** MUST. Every privileged action goes through `useAdminAudit`
  into `admin_audit_log`.
- **Source:** `AdminAuditLog.tsx`, `useAdminAudit`.

### FR-ADMIN-007 — Announcements
- **Priority:** MUST. CRUD active announcements with date range.
- **Source:** `AdminAnnouncements.tsx`, `announcements`.

### FR-ADMIN-008 — Dakwah posters
- **Priority:** MUST.
- **Source:** `AdminDawah.tsx`, `dakwah_posters`.

### FR-ADMIN-009 — System page
- **Priority:** SHOULD. System health, cache controls.
- **Source:** `AdminSystem.tsx`.

### FR-ADMIN-010 — Admin session timeout
- **Priority:** MUST. Inactivity timeout in `useAdminTimeout`.
- **Source:** `useAdminTimeout`.

## 4.11 Settings (SET)

### FR-SET-001 — Profile & account
- **Priority:** MUST. Edit display name, photo, email, password.
- **Source:** `src/pages/Settings.tsx`, `supabase/functions/api-profile/index.ts`.

### FR-SET-002 — Prayer settings
- **Priority:** MUST. Method, zone, adhan style, per-prayer mute, time tweaks.
- **Source:** `usePrayerSettings`, `prayer_settings`.

### FR-SET-003 — Notification permission
- **Priority:** MUST. Request, status display, deep-link to OS settings on denial.
- **Source:** `src/utils/notification-permission.ts`.

### FR-SET-004 — Selective cache clear
- **Priority:** MUST. Wipes app caches but preserves auth tokens and active fast.
- **Source:** `mem://tech/data-management-policy`.

### FR-SET-005 — Delete account
- **Priority:** MUST. Soft path: sign out + request deletion via edge function.
- **Source:** `supabase/functions/api-profile`.

### FR-SET-006 — Backdate tools
- **Priority:** MUST. Universal 90-day backdate selector reused across modules.
- **Source:** `src/components/BackdateDatePicker.tsx`, `BackdatePrompt.tsx`, `mem://features/backdate-capability`.

## 4.12 Navigation & shell (NAV)

### FR-NAV-001 — Bottom navigation
- **Priority:** MUST. 7 tabs (Dashboard, Today, Iman, Health, Wealth,
  Productivity, Family). Active state highlighted.
- **Source:** `src/components/BottomNav.tsx`, `mem://ui/navigation-pattern`.

### FR-NAV-002 — History-aware back
- **Priority:** MUST. Subpages back to previous in-app route; deep links from
  the OS go to the right page.
- **Source:** `src/components/SubPageLayout.tsx`, `NativeBridge.tsx`, `mem://ui/navigation-logic`.

### FR-NAV-003 — Mobile-first container
- **Priority:** MUST. `max-w-md` centered, phone-mockup shadow on desktop.
- **Source:** `src/components/AppLayout.tsx`, `mem://ui/mobile-first-layout`.

### FR-NAV-004 — Offline banner
- **Priority:** MUST.
- **Source:** `src/components/OfflineBanner.tsx`.

## 4.13 Marketing & install (MKT)

### FR-MKT-001 — Landing
- **Priority:** MUST. `/home` is the marketing landing page on web;
  redirects to `/` inside Capacitor.
- **Source:** `src/pages/Landing.tsx`, `mem://ui/platform-specific-landing`.

### FR-MKT-002 — Features, About, Install
- **Priority:** MUST.
- **Source:** `src/pages/Features.tsx`, `About.tsx`, `Install.tsx`, `mem://tech/pwa-support`.

## 4.14 Notifications (NOTIF)

### FR-NOTIF-001 — Prayer-time notifications
- **Priority:** MUST. See FR-IMAN-PRAYER-003.

### FR-NOTIF-002 — IF window notifications
- **Priority:** SHOULD. Start / fast complete / window-end notifications.
- **Source:** `src/components/NotificationScheduler.tsx`.

### FR-NOTIF-003 — Daily check-in nudge
- **Priority:** SHOULD. Soft nudge if no check-in by user-defined time.