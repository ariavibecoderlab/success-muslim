# 16 · Traceability

Maps SRS requirement IDs → SDS section → primary source file(s). When
the codebase moves, update this table. If a requirement has no SDS
section, the design is missing; if a source file is gone, the design
has drifted.

## 16.1 Functional requirements

| SRS | SDS | Source |
|-----|-----|--------|
| FR-AUTH-* | §7.1, §11.1 | `pages/Auth.tsx`, `pages/AuthCallback.tsx`, `pages/ResetPassword.tsx`, `contexts/AuthContext.tsx`, `hooks/useAuth.ts`, `components/AuthGuard.tsx` |
| FR-ONBOARD-* | §7.2 | `pages/Onboarding.tsx`, `supabase/functions/api-profile` |
| FR-DASH-* | §7.3, §10.1 | `pages/Dashboard.tsx`, `pages/Today.tsx`, `hooks/useDashboardData.ts`, `hooks/useWidgetPreferences.ts`, `lib/widget-registry.ts`, `lib/life-score.ts` |
| FR-IMAN-PRAYER-* | §7.4.1, §8.3 | `pages/deen/PrayerTimes.tsx`, `components/today/TodayPrayerDuo.tsx`, `hooks/usePrayer*.ts`, `lib/prayer-times.ts`, `lib/jakim-zones.ts`, `supabase/functions/jakim-proxy` |
| FR-IMAN-QURAN-* | §7.4.2, §8.2, §10.4.4 | `pages/QuranTracker.tsx`, `pages/deen/QuranReader.tsx`, `pages/deen/QuranStats.tsx`, `pages/deen/SurahReader.tsx`, `components/quran/*`, `hooks/useQuran*.ts`, `lib/quran-*.ts`, `supabase/functions/api-quran` |
| FR-IMAN-DHIKR-* | §7.4.3 | `pages/DhikrCounter.tsx`, `hooks/useDhikrQuery.ts`, `lib/dhikr-storage.ts`, `supabase/functions/api-dhikr` |
| FR-IMAN-SUNNAH-* | §7.4.4 | `pages/SunnahTracker.tsx`, `hooks/useSunnahQuery.ts`, `lib/sunnah-storage.ts`, `supabase/functions/api-sunnah` |
| FR-IMAN-SADAQAH-* | §7.4.5, §8.10 | `pages/deen/SadaqahTracker.tsx`, `pages/ZakatCalculator.tsx`, `pages/Fidyah.tsx`, `lib/zakat.ts`, `supabase/functions/api-misc` |
| FR-IMAN-QADA-* | §7.4.6 | `pages/QadaSolatSetup.tsx`, `pages/QadaSolatTrack.tsx`, `pages/RamadhanQadaSetup.tsx`, `pages/RamadhanQadaTrack.tsx`, `hooks/useQadaQuery.ts` |
| FR-IMAN-QIYAM-* | §7.4.7 | `pages/deen/QiyamPlanner.tsx`, `pages/deen/HajjUmrahPlanner.tsx`, `pages/deen/RamadanOptimizer.tsx` |
| FR-IMAN-DAKWAH-* | §7.4.8 | `pages/deen/DailyDakwah.tsx`, `pages/admin/AdminDawah.tsx` |
| FR-IMAN-SALAH-LOG-* | §7.4.9 | `pages/deen/SalahLog.tsx`, `components/SalahQuickLogSheet.tsx`, `hooks/useSalahQuery.ts`, `lib/salah-storage.ts`, `supabase/functions/api-salah` |
| FR-IMAN-FAST-* | §7.4.10 | `pages/deen/DeenFasting.tsx` |
| FR-HEALTH-* | §7.5, §8.4, §8.11 | `pages/Health.tsx`, `pages/health/*`, `hooks/useHealth*.ts`, `hooks/useStepsQuery.ts`, `lib/health-storage.ts`, `lib/fasting-stages.ts`, `stores/fastingStore.ts`, `supabase/functions/api-health` |
| FR-WEALTH-* | §7.6 | `pages/Wealth.tsx`, `pages/wealth/*`, `hooks/useWealthSummary.ts`, `hooks/useIncomeSources.ts`, `lib/wealth-categories.ts`, `supabase/functions/api-wealth` |
| FR-PROD-* | §7.7 | `pages/Productivity.tsx`, `pages/productivity/*`, `hooks/useTasksQuery.ts`, `hooks/useHabitsQuery.ts`, `hooks/useLifeAreasQuery.ts`, `lib/productivity-storage.ts`, `supabase/functions/api-productivity` |
| FR-FAMILY-* | §7.8, §8.6 | `pages/Family.tsx`, `pages/family/*`, `components/family/*`, `hooks/useFamily.ts`, `hooks/useFamilyDashboard.ts`, `lib/family-*.ts`, `supabase/functions/api-family`, RPCs `get_family_leaderboard`, `is_family_member`, `is_family_admin` |
| FR-CMS-* | §7.9, §9.9 | `pages/Blog.tsx`, `pages/BlogPost.tsx`, `pages/admin/AdminBlog.tsx`, `components/admin/BlogEditor.tsx`, `components/cms/*`, `contexts/EditModeContext.tsx` |
| FR-ADMIN-* | §7.10, §11.4, §13.5 | `pages/admin/*`, `components/admin/*`, `hooks/useAdmin*.ts`, `components/AdminGuard.tsx`, `components/MobileAdminBlock.tsx`, admin SECURITY DEFINER RPCs |
| FR-SETTINGS-* | §7.11 | `pages/Settings.tsx`, `supabase/functions/api-profile` |
| FR-CHECKIN-* | §8.5 | `hooks/useDailyCheckin.ts`, `supabase/functions/api-checkin` |
| FR-BACKDATE-* | §5.8, §8.7 | `components/BackdateDatePicker.tsx`, `components/BackdatePrompt.tsx` |

## 16.2 Non-functional requirements

| SRS | SDS | Source |
|-----|-----|--------|
| NFR-PERF-* | §14 | `vite.config.ts`, `src/App.tsx` (lazy routes), `hooks/useDashboardData.ts` |
| NFR-OFFLINE-* | §5.6, §5.7, §8.8, §10.4.2 | `lib/db-sync.ts`, `lib/*-storage.ts`, `components/OfflineBanner.tsx`, `utils/native/network.ts` |
| NFR-A11Y-* | §9.7 | components and pages globally |
| NFR-SEC-* | §11 | `supabase/functions/*`, RLS policies, `has_role()`, `AdminGuard`, `useAdminTimeout` |
| NFR-RELIAB-* | §8.8, §8.9, §13 | `lib/db-sync.ts`, `components/ErrorBoundary.tsx` |
| NFR-PORT-* | §6.6, §12.4, §12.5 | `src/utils/native/*`, `capacitor.config.ts`, `android/`, `ios/` |
| NFR-I18N-* | §9.3 | strings inline; deferred i18n layer |
| NFR-MAINT-* | §4 | folder structure, hook contracts |
| NFR-PRIVACY-* | §11.9, §11.11 | `supabase/functions/api-profile` (export, delete), `docs/store-listings/privacy-policy.md` |

## 16.3 Data requirements

| SRS | SDS | Source |
|-----|-----|--------|
| DR-SCHEMA-* | §5.1, §5.2 | `src/integrations/supabase/types.ts` (generated) |
| DR-RLS-* | §5.3, §11.3 | migrations + `has_role`, `is_family_member`, `is_family_admin` |
| DR-INDEX-* | §5.4 | migrations |
| DR-RETAIN-* | §5.11 | `api-profile` delete, audit log policy |
| DR-STORAGE-* | §5.10 | buckets `avatars`, `dakwah-posters`, `blog-images`, `cms-uploads` |

## 16.4 Acceptance

SRS §10 acceptance items map 1:1 to the 25-point smoke matrix in
SDS §15.5. Release sign-off requires both to pass.