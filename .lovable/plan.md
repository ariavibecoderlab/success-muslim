

# Feedback Implementation Plan

This covers all 7 feedback items, organized by priority and complexity.

---

## 1. Hijri Calendar Fix (Critical)

**Problem:** The Hijri date shown in the header and Iman page uses a local algorithmic calculation (`gregorianToHijri`) which can be off by 1-2 days compared to the official JAKIM calendar. The JAKIM API call (`fetchJakimHijriDate`) exists but is only available as an async function and not used in the header/dashboard.

**Fix:**
- Update `AppHeader.tsx` and `Deen.tsx` to call `fetchJakimHijriDate()` first, then fall back to the local algorithm
- Add a React hook `useHijriDate()` that caches the JAKIM result in state and refreshes daily
- Ensure all places displaying Hijri dates use this single hook for consistency

---

## 2. Daily Iman Habits - Restructured Checklist

**Problem:** The current Sunnah Tracker has a generic checklist. The user wants a structured daily ibadah routine with specific categories and targets.

**What gets built:**
- Restructure the Sunnah/Dhikr system into a new "Daily Ibadah" checklist with 6 categories:
  1. **Daily Intentions** (5 items, simple checkboxes)
  2. **Early Morning Routine** (4 items: wake at 4/5am, Tahajjud, 2 rakaat before Fajr, Subuh at masjid)
  3. **Morning Dhikr** (5 items with 100x targets each: SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illallah, Istighfar)
  4. **Morning Selawat** (min 100, target 1000)
  5. **Quran & Recitations** (Yasin, flexible Quran target, Al-Ikhlas 3x, Al-Mulk before sleep)
  6. **Afternoon Dhikr** (same as morning, 100x each)

- Update dhikr preset defaults to use 100x targets instead of 33x
- Add these as default enabled Sunnah items in `sunnah-storage.ts`
- The existing Sunnah Tracker page will be enhanced to show these categories as collapsible sections

---

## 3. Qiyam Logging Improvement

**Problem:** Qiyam Planner only allows toggling "performed" for today. No actual time logging or history view.

**Fix:**
- Add time fields when logging: actual sleep time, actual wake time, and actual qiyam start time
- Store these in the existing `qiyam_log` table (which already has `sleep_time`, `wake_time`, `tahajjud_start` columns)
- Show logged times in the "Recent Nights" history section
- Add a monthly consistency percentage card

---

## 4. Iman Score Fix

**Problem:** Iman score on the Deen page calculates independently from the Life Score engine, and may not reflect all tracked activities.

**Fix:**
- The Life Score engine (`life-score.ts`) already calculates Iman score correctly using salah, quran, sunnah, dhikr, and fasting data
- The Deen page uses its own simpler formula. Unify both to use the `calcIman()` function from `life-score.ts`
- Export the `calcIman` function and reuse it in `Deen.tsx`
- Ensure the score updates reactively when any tracked activity changes

---

## 5. Qada Solat - Multiple Entries Per Prayer

**Problem:** Currently each prayer (Fajr, Dhuhr, etc.) can only be toggled once per day (0 or 1).

**Fix:**
- Change the toggle to a counter: tap to increment, long-press to decrement
- Update `logQadaPrayer` in `storage.ts` to increment by 1 instead of toggling
- Show the count per prayer in the UI (e.g., "Fajr: 3 done today")
- Update the daily target logic to count total prayers across all types

---

## 6. Quran Reading - Bookmark & Resume

**Problem:** Users can't bookmark their position or resume reading from where they left off.

**What gets built:**
- The `quran_bookmarks` table already exists in the database
- The `quran_preferences` table already has `last_surah` and `last_ayah` columns
- Add a "Continue Reading" button on the Quran page that opens the last-read surah/ayah
- Auto-save reading position when the user navigates away from a surah
- Show a bookmark icon on the Surah Reader page to save the current position
- Add a "Bookmarks" section on the Quran page showing saved positions

---

## 7. Ramadhan Calendar Compliance

**Problem:** Ramadhan dates may not align with JAKIM official calendar.

**Fix:** This is addressed by Fix #1 (using JAKIM API for all Hijri dates). Additionally:
- Ensure the Ramadan Optimizer checks the official JAKIM Hijri date to determine if today is in Ramadhan
- Use the corrected Hijri date (from JAKIM) to calculate which day of Ramadhan it is
- Remove any hardcoded Ramadhan date logic

---

## Technical Details

### New file: `src/hooks/useHijriDate.ts`
- Custom hook that fetches JAKIM Hijri date on mount
- Falls back to algorithmic conversion if API fails
- Caches result in state with daily refresh
- Returns `{ hijriDate: string, loading: boolean }`

### Modified files:
- `src/components/AppHeader.tsx` - Use `useHijriDate` hook instead of sync `formatHijriDate`
- `src/pages/Deen.tsx` - Use `useHijriDate` hook; use shared `calcIman` for score
- `src/lib/life-score.ts` - Export `calcIman` function
- `src/lib/dhikr-storage.ts` - Update default targets to 100x
- `src/lib/sunnah-storage.ts` - Add structured daily ibadah categories as defaults
- `src/pages/SunnahTracker.tsx` - Group items by category with collapsible sections
- `src/pages/deen/QiyamPlanner.tsx` - Add time input fields when logging, show times in history
- `src/pages/QadaSolatTrack.tsx` - Change toggle to counter, show count per prayer
- `src/lib/storage.ts` - Update `logQadaPrayer` to increment instead of toggle
- `src/pages/deen/QuranReader.tsx` - Add bookmark button and auto-save position
- `src/pages/deen/SurahReader.tsx` - Save reading position, show bookmark action
- `src/pages/deen/RamadanOptimizer.tsx` - Use JAKIM Hijri date for Ramadhan detection

### Execution order:
1. Hijri date hook (fixes #1 and #7)
2. Iman score unification (#4)
3. Qada Solat counter (#5)
4. Qiyam time logging (#3)
5. Daily Ibadah restructure (#2)
6. Quran bookmarks (#6)

