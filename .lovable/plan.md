
# Simplify Quran Tracker — Daily Target System ✅ COMPLETED

## Status: Implemented 2026-02-20

The complex session-tracking system has been fully replaced with a simple, beautiful daily check-in system.

## What Was Done

### Database
- Added `daily_target_type TEXT` and `target_selected_at TIMESTAMPTZ` columns to `quran_preferences`
- Created `quran_daily_log` table with RLS (SELECT/INSERT/UPDATE per user)

### Hook (`src/hooks/useQuranData.ts`)
- Added `useQuranDailyTarget` hook: loads prefs + 90-day log, computes streak, exposes `markTodayDone` and `selectTarget`
- Removed `prompted`/`setPrompted` complexity from `useQuranPrefs`
- `useQuranSessions.logSession` is now a no-op (backward compat preserved)

### QuranReader (`src/pages/deen/QuranReader.tsx`)
- **View A (Onboarding):** Clean target picker with 8 options, quote, estimated completion date, "Begin My Journey" CTA
- **View B (Dashboard):** Progress ring, today's target card, mark-as-done sheet, stats row, 30-day calendar, achievements, settings dialog with target change option
- Surah/Juz/Bookmarks tabs kept at bottom

### SurahReader (`src/pages/deen/SurahReader.tsx`)
- Removed `logSession` call on unmount
- Position (`last_surah`/`last_ayah`) now always saved (not gated behind `tracker_enabled`)
- Removed unused refs (`sessionStart`, `firstAyahRead`, `prefsRef`, `ayahsRef`, `numRef`)

## User Experience
Fresh user → target picker → picks target → dashboard with 0% ring → taps "Mark Today as Done" → optional surah/ayah → streak starts at 1 → builds habit.
