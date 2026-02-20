
# Simplify Quran Tracker — Daily Target System

## Overview

The current Quran Tracker uses a complex automatic session-tracking system (recording every page change, duration, ayah position silently). This will be replaced with a simple, beautiful, intentional daily check-in system. The user picks one target once, taps "Mark Today as Done" each day, and builds a streak. That's it.

## What Gets Removed

- The complex opt-in/opt-out prompt (Yes/No to enable tracker)
- Automatic page/ayah tracking in SurahReader
- `logSession` calls and session duration tracking
- The `useQuranSessions` hook usage in QuranReader
- `ReadingHeatmap` (replaced by a simple monthly calendar view)
- Old tracker stats section (pages today, daily goal progress bar based on sessions)

## What Gets Built

### 1. Database Schema Changes

Two new columns added to `quran_preferences` via migration:
- `daily_target_type TEXT` — stores the chosen target key (e.g., `'khatam_30'`, `'page_10'`, `'ayah_1'`)
- `target_selected_at TIMESTAMPTZ` — when the user first picked a target (marks onboarding complete)

A new table `quran_daily_log` for the simple daily check-in:
```sql
CREATE TABLE quran_daily_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_met BOOLEAN NOT NULL DEFAULT false,
  surah_number INTEGER,
  ayah_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);
```
With RLS: users can only read/insert/update their own rows.

### 2. Target Options Definition

Eight targets, defined as constants:

| Key | Label | Daily Amount | Est. Completion |
|---|---|---|---|
| `khatam_30` | Khatam 30 Juz | 1 juz/day | 30 days |
| `khatam_60` | Khatam 15 Juz | ½ juz/day | 60 days |
| `khatam_90` | Khatam 10 Juz | ~3 pages/day | 90 days |
| `khatam_180` | Khatam 5 Juz | ~1.5 pages/day | 180 days |
| `khatam_365` | Khatam 1 Juz | ~⅓ page/day | 365 days |
| `page_10` | 10 Pages/day | 10 pages | ~60 days |
| `page_1` | 1 Page/day | 1 page | ~600 days |
| `ayah_1` | 1 Ayah/day | 1 ayah | ongoing |

Each shows an emoji, estimated completion date below the card.

### 3. New Hook — `useQuranDailyTarget`

A new hook in `src/hooks/useQuranData.ts` that:
- Loads `daily_target_type` and `target_selected_at` from `quran_preferences`
- Loads today's `quran_daily_log` row (did user mark done today?)
- Loads last 90 days of `quran_daily_log` for the calendar heatmap and streak
- Exposes `markTodayDone(surahNumber?, ayahNumber?)` — upserts today's row with `target_met = true`
- Computes `streak` from consecutive `target_met = true` days
- Saves `daily_target_type` via `savePrefs`

### 4. New Screen Layout — `QuranReader.tsx` Rewrite

The page becomes two distinct views:

**View A: Target Onboarding** (shown when `target_selected_at` is null)
- Full-screen clean card
- Quote at top: *"The deeds Allah loves most are those that are consistent, even if they are small."*
- Title: "Start your daily Quran journey"
- Subtitle: "Choose a target you can commit to — every single day"
- 8 selectable target cards (tap to highlight, show estimated completion date below each)
- "Begin My Journey" CTA button — saves target to DB, never shown again
- Option to change target from Settings dialog later

**View B: Main Tracker Dashboard** (shown after target is selected)
Sections from top to bottom:

1. **Hero Progress Ring** — SVG circular ring showing `completedDays / targetDays` %, large `X%` in center, "Juz X of 30" or "Day X of target" below

2. **Today's Target Card** — "Today's target: 1 page", big green "Mark Today as Done" button. If done: shows ✅ "Barakallah! See you tomorrow." with the streak count.

3. **Stats Row** — 3 cards: Days Remaining · Current Streak · Days Done

4. **Last Read** — "Last read: Surah Al-Baqarah, Ayat 26" pulled from `last_surah`/`last_ayah` in prefs. "Continue Reading" button → navigates to SurahReader.

5. **Monthly Calendar** — Simple 30-day grid. Green cell = `target_met`, grey = missed, white = future.

6. **Achievements** — 4 badge cards: First Day, 7-Day Streak, 30-Day Streak, Khatam Complete. Greyed out until earned.

7. **Settings button** — Opens existing settings dialog (translation, font size, target change option added).

8. **Surah/Juz/Bookmark tabs** — Kept as-is at the bottom for navigation to the actual reader.

### 5. Mark as Done Flow

Simple 2-step sheet:
1. Tap "Mark Today as Done"
2. Sheet slides up: "Where did you read up to? (optional)" → Surah picker + Ayah number input → "Done" button
3. Closing without selecting still marks as done
4. Streak animates +1, ring progress updates

### 6. Files Modified

| File | Change |
|---|---|
| `src/hooks/useQuranData.ts` | Add `useQuranDailyTarget` hook, remove complex session logic from QuranReader usage |
| `src/pages/deen/QuranReader.tsx` | Full rewrite to new two-view layout |
| `src/components/quran/ReadingHeatmap.tsx` | Replace with new `QuranCalendar.tsx` component (simple 30-day grid) |
| `src/pages/deen/SurahReader.tsx` | Remove `logSession` call on unmount (the auto-tracking), keep `savePrefs` for last position |
| `PROGRESS.md` | Update Quran tracker row status |
| `.lovable/plan.md` | Update with new plan |

### 7. Database Migration

```sql
-- Add new columns to quran_preferences
ALTER TABLE public.quran_preferences
  ADD COLUMN IF NOT EXISTS daily_target_type TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS target_selected_at TIMESTAMPTZ DEFAULT NULL;

-- Create simple daily log table
CREATE TABLE IF NOT EXISTS public.quran_daily_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_met BOOLEAN NOT NULL DEFAULT false,
  surah_number INTEGER,
  ayah_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- RLS
ALTER TABLE public.quran_daily_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily log"
  ON public.quran_daily_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily log"
  ON public.quran_daily_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily log"
  ON public.quran_daily_log FOR UPDATE
  USING (auth.uid() = user_id);
```

### 8. Streak Logic

```
streak = count of consecutive days ending today (or yesterday) where target_met = true
```

Computed from the 90-day log loaded in the hook. Midnight resets are handled by date comparison.

### 9. What is NOT Changed

- `SurahReader.tsx` audio, tafsir, bookmarks, pagination — all untouched
- `last_surah`/`last_ayah` still saved to `quran_preferences` when reading (this gives "Continue Reading" its data)
- Existing `quran_reading_sessions` table — left in DB, just not written to anymore from the tracker UI
- Bookmarks functionality — unchanged
- Translation/font size settings — unchanged

### 10. PROGRESS.md Updates

- "Quran Tracker (opt-in)" → updated to reflect new daily target system
- "Quran Session Recording" → updated to reflect simplified position-only saving
- "Quran Reading Heatmap" → updated to reflect new monthly calendar

### Summary of User Experience

Fresh user opens Quran → sees target picker → picks "1 Page/day" → sees dashboard with 0% ring → taps "Mark Today as Done" → optional surah/ayah entry → streak starts at 1 → next day ring grows → builds habit. Simple, meaningful, beautiful.
