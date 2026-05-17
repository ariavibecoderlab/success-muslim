# 10 · Traceability & Acceptance

## 10.1 Requirement → source traceability

| Requirement | Primary source file(s) |
|-------------|------------------------|
| FR-AUTH-001..009 | `src/pages/Auth.tsx`, `AuthCallback.tsx`, `ResetPassword.tsx`, `src/contexts/AuthContext.tsx`, `src/components/AuthGuard.tsx`, `src/integrations/supabase/client.ts` |
| FR-ONB-001..002 | `src/pages/Onboarding.tsx`, `src/components/OnboardingTooltips.tsx` |
| FR-DASH-001..009 | `src/pages/Dashboard.tsx`, `Today.tsx`, `src/components/dashboard/*`, `src/components/today/*`, `src/hooks/useDashboardData.ts` |
| FR-IMAN-PRAYER-* | `src/pages/deen/PrayerTimes.tsx`, `src/lib/prayer-times.ts`, `supabase/functions/jakim-proxy/index.ts`, `useNativePrayerNotifications`, `usePrayerNotifications`, `usePrayerSettings` |
| FR-IMAN-QURAN-* | `src/pages/deen/QuranReader.tsx`, `QuranStats.tsx`, `SurahReader.tsx`, `src/components/quran/*`, `src/lib/quran-*.ts`, `useQuranReadingLog`, `useQuranStorageQuery`, `supabase/functions/api-quran` |
| FR-IMAN-DHIKR-* | `src/pages/DhikrCounter.tsx`, `useDhikrQuery`, `supabase/functions/api-dhikr` |
| FR-IMAN-SUNNAH-* | `src/pages/SunnahTracker.tsx`, `useSunnahQuery`, `supabase/functions/api-sunnah` |
| FR-IMAN-SADAQAH-001 | `src/pages/deen/SadaqahTracker.tsx` |
| FR-IMAN-ZAKAT-001 | `src/pages/ZakatCalculator.tsx`, `src/lib/zakat.ts` |
| FR-IMAN-FIDYAH-001 | `src/pages/Fidyah.tsx`, `useFidyahQuery` |
| FR-IMAN-QADA-001..003 | `src/pages/QadaSolatSetup.tsx`, `QadaSolatTrack.tsx`, `RamadhanQadaSetup.tsx`, `RamadhanQadaTrack.tsx`, `useQadaQuery` |
| FR-IMAN-QIYAM-001 | `src/pages/deen/QiyamPlanner.tsx` |
| FR-IMAN-RAMADAN-001 | `src/pages/deen/RamadanOptimizer.tsx` |
| FR-IMAN-HAJJ-001 | `src/pages/deen/HajjUmrahPlanner.tsx` |
| FR-IMAN-DAKWAH-001 | `src/pages/deen/DailyDakwah.tsx` |
| FR-IMAN-FAST-001 | `src/pages/deen/DeenFasting.tsx` |
| FR-IMAN-JOURNEY-001 | `src/pages/DeenJourney.tsx` |
| FR-HEALTH-* | `src/pages/health/*`, `src/hooks/useHealth*`, `src/stores/fastingStore.ts`, `src/lib/fasting-stages.ts`, `supabase/functions/api-health` |
| FR-WEALTH-* | `src/pages/wealth/*`, `src/components/wealth/*`, `useIncomeSources`, `useWealthSummary`, `supabase/functions/api-wealth` |
| FR-PROD-* | `src/pages/productivity/*`, `useTasksQuery`, `useHabitsQuery`, `useLifeAreasQuery`, `supabase/functions/api-productivity` |
| FR-FAMILY-* | `src/pages/Family.tsx`, `src/pages/family/*`, `src/components/family/*`, `useFamily`, `useFamilyDashboard`, `supabase/functions/api-family` |
| FR-BLOG-001..002 | `src/pages/Blog.tsx`, `BlogPost.tsx`, `src/pages/admin/AdminBlog.tsx`, `src/components/admin/BlogEditor.tsx` |
| FR-CMS-001 | `src/components/cms/*`, `src/contexts/EditModeContext.tsx` |
| FR-ADMIN-001..010 | `src/pages/admin/*`, `src/components/AdminGuard.tsx`, `MobileAdminBlock.tsx`, `src/hooks/useAdmin*.ts`, `supabase/functions/api-admin` |
| FR-SET-001..006 | `src/pages/Settings.tsx`, `supabase/functions/api-profile`, `src/components/BackdateDatePicker.tsx`, `BackdatePrompt.tsx` |
| FR-NAV-001..004 | `src/components/AppLayout.tsx`, `BottomNav.tsx`, `SubPageLayout.tsx`, `NavLink.tsx`, `NativeBridge.tsx`, `OfflineBanner.tsx` |
| FR-MKT-001..002 | `src/pages/Landing.tsx`, `Features.tsx`, `About.tsx`, `Install.tsx` |
| FR-NOTIF-001..003 | `src/utils/native/notifications.ts`, `src/components/NotificationScheduler.tsx`, `useNativePrayerNotifications` |

## 10.2 MVP MoSCoW scope (1 Ramadan 1447 AH)

| Module | MUST | SHOULD | COULD | WON'T-for-MVP |
|--------|------|--------|-------|---------------|
| Auth & onboarding | All FR-AUTH-*, FR-ONB-001 | FR-ONB-002 | | Biometric unlock |
| Dashboard / Today | DASH-001..006, 008 | DASH-007, 009 | | Themes |
| Iman — prayer & Quran & dhikr & sunnah | All FR-IMAN-PRAYER, QURAN, DHIKR, SUNNAH (except QURAN-007) | IMAN-JOURNEY-001 | IMAN-QURAN-007 | |
| Iman — financial | All FR-IMAN-SADAQAH/ZAKAT/FIDYAH | | | |
| Iman — qada | All FR-IMAN-QADA | | | |
| Iman — advanced | | QIYAM-001, RAMADAN-001 | HAJJ-001 | |
| Iman — dakwah & fasting | All | | | |
| Health | All FR-HEALTH | | | HealthKit / Google Fit auto-import |
| Wealth | All FR-WEALTH | | | Bank sync |
| Productivity | All FR-PROD | | | Pomodoro analytics |
| Family | FR-FAMILY-001..004 | 005, 006 | | Realtime chat |
| Blog / CMS | FR-BLOG-001..002 | FR-CMS-001 | | Comments |
| Admin | All FR-ADMIN MUSTs | FR-ADMIN-004, 005, 009 | | |
| Settings | All FR-SET | | | |
| Navigation | All FR-NAV | | | |
| Marketing | All FR-MKT | | | |
| Notifications | FR-NOTIF-001 | 002, 003 | | Server-push |
| Languages | English only | | | MS / ID / AR translations |
| Theme | Light | | | Dark mode |

## 10.3 Acceptance criteria (smoke suite)

The MVP is shippable when **every** item below passes on web, Android, and iOS:

1. **Sign up** with a new email; verify email; sign in; land on `/`.
2. **Google sign-in** completes and lands on `/`.
3. **Onboarding** completes and updates `profiles`.
4. **Dashboard** renders within 500 ms with cached data.
5. **Prayer times** show for the configured zone; next-prayer countdown is correct.
6. **Local adhan notification** fires for the next prayer (when permission granted).
7. **Salah quick log** writes a row visible in `/iman/salah-log`.
8. **Quran +5 pages** updates `quran_daily_log`; `/iman/quran/stats` reflects the change.
9. **Dhikr** counter persists a session.
10. **Sunnah** items toggle and persist.
11. **Sadaqah, Zakat, Fidyah** each accept a new entry.
12. **Qada Solat setup** seeds counts; track screen decrements them.
13. **Health BMI / Weight / Hydration / Sleep / Steps** each accept a log.
14. **IF Timer** starts, runs, and can be ended; session lands in `if_sessions`.
15. **Wealth** add transaction, savings contribution, income source.
16. **Productivity** add task, mark done, log a habit.
17. **Family** create a family, invite by code, second device joins, activity
    feed reflects an action.
18. **Daily Dakwah** share opens native share sheet.
19. **Backdate** picker rejects > 90 days back; accepts within window.
20. **Offline:** disable network, perform a log, re-enable network; record syncs.
21. **Sign out** clears caches but preserves an active IF session.
22. **Admin Console** (web only) reachable with admin role; blocked inside
    Capacitor; audit log records the admin's action.
23. **Blog** post is publicly readable at `/blog/:slug`.
24. **Deep link** `https://successmuslim.app/iman/quran` opens the Quran reader
    after auth.
25. **PWA install** prompt works from `/install`.

## 10.4 Change control

- This SRS is versioned in git alongside the source.
- Material changes require:
  1. PR updating the affected section,
  2. corresponding code change or migration in the same PR,
  3. and a note in `PROGRESS.md` if the change affects MVP scope.
- ID retirement: never reuse a removed FR-/NFR- ID.

---

**End of SRS.**