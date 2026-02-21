
# Quran Reading Log System — Complete Rebuild

## Overview
Replace the current single-tap "Mark Today as Done" system with a flexible, range-based reading log that supports multiple entries per day, auto-continue from last position, page-based input, and live reading summaries.

## What Gets Removed
- "Mark Today as Done" button and sheet in QuranReader.tsx
- `markTodayDone()` function in useQuranData.ts
- `isDoneToday` single-boolean concept (replaced by "has any logs today")
- Old `quran_daily_log` usage for the done/not-done toggle (table kept for streak backward compat, but new logs go to a new table)

## What Gets Kept
- Target selection system (Khatam 30 Juz, 1 page/day, etc.)
- Calendar heatmap (rewired to new log data)
- Streak system (rewired: consecutive days with at least 1 reading log)
- Achievements/milestones
- Resume banner in SurahReader
- Auto position tracking via IntersectionObserver in SurahReader
- Pending session localStorage flush pattern in SurahReader
- Quran reader, bookmarks, memorization — untouched

---

## Database Changes

### 1. New table: `quran_reading_log`
Stores each reading range entry. Multiple rows per user per day.

```sql
CREATE TABLE public.quran_reading_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  log_type text NOT NULL DEFAULT 'continue',  -- 'continue' | 'manual' | 'page'
  start_surah integer NOT NULL,
  start_ayah integer NOT NULL,
  end_surah integer NOT NULL,
  end_ayah integer NOT NULL,
  ayah_count integer NOT NULL DEFAULT 0,
  page_count numeric NOT NULL DEFAULT 0,
  juz_segments jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quran_reading_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own reading log" ON public.quran_reading_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own reading log" ON public.quran_reading_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own reading log" ON public.quran_reading_log
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reading log" ON public.quran_reading_log
  FOR DELETE USING (auth.uid() = user_id);
```

No new static reference tables in the database. The ayah-to-page and ayah-to-juz mappings will be computed client-side using the existing `SURAH_NAMES` metadata plus a static lookup array embedded in a new utility file (`src/lib/quran-mapping.ts`). This avoids needing to populate and query 6236 rows for a static mapping that never changes.

---

## New Files

### `src/lib/quran-mapping.ts`
Static mapping utilities:
- `SURAH_START_AYAH[]` — cumulative global ayah index for each surah (1-indexed). Computed from `SURAH_NAMES`.
- `globalAyahIndex(surah, ayah)` — returns global ayah number (1-6236).
- `ayahCountInRange(startSurah, startAyah, endSurah, endAyah)` — counts ayahs across surahs.
- `PAGE_MAP[]` — 604-entry array mapping page number to `{ surah, ayah }` (first ayah on that page). Uses standard Madinah Mushaf mapping.
- `pageForAyah(surah, ayah)` — returns the Mushaf page (1-604) for a given ayah.
- `juzForAyah(surah, ayah)` — returns juz number (1-30).
- `pageCountInRange(startSurah, startAyah, endSurah, endAyah)` — pages spanned.
- `juzSegmentsInRange(...)` — returns array of juz numbers touched.
- `pageToSurahAyah(page)` — maps a page number to the first surah/ayah on that page.
- `lastAyahOnPage(page)` — maps a page number to the last surah/ayah on that page.

### `src/hooks/useQuranReadingLog.ts`
New hook replacing the daily-target logging logic:
- `logs` — last 90 days of `quran_reading_log` entries
- `todayLogs` — filtered to today
- `todayTotalAyahs` / `todayTotalPages` — sums
- `allTimeTotalAyahs` / `allTimeTotalPages`
- `streak` — consecutive days with >= 1 log entry
- `hasDoneToday` — boolean (replaces `isDoneToday`)
- `lastPosition` — `{ surah, ayah }` from the most recent log's end position
- `addLog(entry)` — insert + also updates `quran_preferences.last_surah/last_ayah` + also upserts `quran_daily_log` for backward compat with family leaderboard
- `updateLog(id, entry)` — edit existing
- `deleteLog(id)` — soft delete with undo
- `checkOverlap(startS, startA, endS, endA)` — returns overlapping log entries if any

---

## UI Changes

### QuranReader.tsx (Dashboard at `/iman/quran`)

**Replace "Today's Target" card** with:
- **"Log Reading" prominent button** — always visible, opens the Log Sheet
- **Today's reading summary card**: "Today: X ayah, Y pages" with list of individual logs
- **Stats row**: Total Ayahs (all time) | Total Pages (all time) | Streak
- **Khatam progress ring**: based on total ayahs read / 6236

**Log Reading Sheet** (bottom sheet):
- **Two tabs at top**: "By Ayah" | "By Page"
- **Two modes toggle**: "Continue" (default) | "Manual Range"

**Continue mode (By Ayah)**:
- "From" auto-filled and read-only: last position from `quran_preferences`
- "To": Surah dropdown + Ayah number input
- Quick buttons: `+5 ayah`, `+10 ayah`, `End of Surah`, `1 Page`, `1 Hizb`
- Live summary panel: "X ayah, Y pages, Juz Z"
- `[Save Reading]` button

**Manual Range mode (By Ayah)**:
- Both "From" and "To" are editable Surah + Ayah selectors
- Same live summary + save

**By Page tab**:
- "From Page" and "To Page" number inputs (1-604)
- System auto-maps to surah/ayah range using `PAGE_MAP`
- Same live summary + save

**After Save**:
- Toast with encouraging message: "MashaAllah! You read X ayah." + streak info
- Auto-dismiss after 2 seconds
- Sheet closes
- Dashboard refreshes showing new log

**Today's Logs section**:
- Shows each log entry for today with time, range, ayah/page count
- Each tappable to edit (opens sheet pre-filled)
- Swipe/button to delete with 5-second undo toast

**Last 7 days section** (collapsible):
- Grouped by date, each log tappable to edit

**Overlap detection**:
- On save, call `checkOverlap()`. If overlap found, show alert with `[Merge]` / `[Keep Both]` options
- If From > To (by global ayah index): auto-swap and show brief confirmation

**Edge cases handled**:
- Cross-surah ranges: ayah count calculated across surah boundaries
- Cross-juz ranges: juz_segments array lists all juz touched
- Validation: From/To must be valid surah/ayah combinations

### Calendar Heatmap
- Rewired to use `quran_reading_log` grouped by date
- Intensity based on total pages read that day (same level scale)

### `/iman` Homepage (Deen.tsx)
- Quran chip: shows today's total pages or "Pending" + streak count
- Quran card: shows today's pages + streak, real data

---

## Technical Details

### Data Flow
1. User taps "Log Reading" on `/iman/quran`
2. Sheet opens with Continue mode, "From" auto-filled from `quran_preferences.last_surah/last_ayah`
3. User selects "To" position (or uses quick button)
4. Live summary calculates using `quran-mapping.ts` utilities
5. On save:
   a. Insert into `quran_reading_log` with calculated `ayah_count`, `page_count`, `juz_segments`
   b. Update `quran_preferences.last_surah/last_ayah` to the "To" position
   c. Upsert `quran_daily_log` with `target_met: true` for today (backward compat with family leaderboard RPC)
   d. Fire family feed notification if first log of the day
6. Dashboard refreshes via hook state update

### Backward Compatibility
- `quran_daily_log` continues to be written to (upsert on each log save) so the family leaderboard RPC (`get_family_leaderboard`) keeps working without modification
- `quran_reading_sessions` from SurahReader continues to work independently (tracks in-reader scroll sessions)
- Streak in `useQuranDailyTarget` is still available but the new `useQuranReadingLog` hook computes its own streak from the new table

### Files Modified
1. `src/lib/quran-mapping.ts` — NEW: static mapping utilities
2. `src/hooks/useQuranReadingLog.ts` — NEW: reading log hook
3. `src/pages/deen/QuranReader.tsx` — MAJOR: rebuild dashboard UI with log sheet, today's logs, edit/delete
4. `src/hooks/useQuranData.ts` — MINOR: keep existing hooks, remove `markTodayDone` from `useQuranDailyTarget`
5. `src/pages/Deen.tsx` — MINOR: update Quran chip/card to use new hook data
6. `src/components/quran/ReadingHeatmap.tsx` — MINOR: accept new log data format
7. `PROGRESS.md` — update
8. `.lovable/plan.md` — update

### Migration: 1 new table (`quran_reading_log`)
No data migration needed — existing `quran_daily_log` data stays intact for streak history. New system starts fresh with range-based logs.
