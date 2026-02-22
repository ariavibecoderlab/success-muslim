

## Phase 3 Backdate: Prayer Log, Qada Solat, Tarawih

### Summary
Add backdate support to the remaining tracking modules. Solat Sunat is already covered (it's part of the Sunnah Tracker which already has backdate). The work covers 3 modules.

### Module Analysis

**Solat Sunat** -- Already done. The SunnahTracker page (`/iman/sunnah`) already has `BackdateDatePicker` and `BackdatePrompt`. No changes needed.

---

### 1. Prayer Log (Salah Tracking)

Currently, salah status (on-time / late / missed) is logged only via the `NextPrayerWidget` on the Dashboard, always for today. The storage layer (`salah-storage.ts`) already supports date-keyed entries and `logSalah` accepts an optional `date` parameter.

**Changes:**
- Create a new dedicated **Salah Log page** (`src/pages/deen/SalahLog.tsx`) with:
  - `BackdateDatePicker` and `BackdatePrompt` at the top
  - A list of 5 prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) with on-time/late/missed/clear status buttons
  - Loads `getSalahLog(dateKey)` for the selected date
  - Passes `dateKey` to `logSalah(prayer, status, dateKey)`
- Add route for `/iman/salah-log` in `App.tsx`
- Link to it from the Prayer Times page or Iman hub

**Storage:** No changes needed -- `logSalah` and `getSalahLog` already support arbitrary dates.

---

### 2. Qada Solat Tracker

Currently, `QadaSolatTrack.tsx` hardcodes `getTodayKey()` for the date. The `logQadaPrayer` and `undoQadaPrayer` functions in `storage.ts` also hardcode `today`.

**Changes:**
- **`src/lib/storage.ts`**: Add optional `dateOverride` parameter to `logQadaPrayer(prayer, count, dateOverride?)` and `undoQadaPrayer(prayer, dateOverride?)`
- **`src/pages/QadaSolatTrack.tsx`**:
  - Add `BackdateDatePicker` and `BackdatePrompt`
  - Track `selectedDate` state, derive `dateKey`
  - Load `dailyLogs[dateKey]` for the selected date
  - Pass `dateKey` to `logQadaPrayer` and `undoQadaPrayer`
  - Update "Today's Qada" header to show the selected date when backdating

---

### 3. Tarawih (Ramadan Optimizer)

Tarawih logging lives inside `RamadanOptimizer.tsx` and is persisted via Supabase (`ramadan_daily_logs` table) with a `date` column. The page already shows "today" based on the Ramadan day.

**Changes:**
- **`src/pages/deen/RamadanOptimizer.tsx`**:
  - Add `BackdateDatePicker` (limited to Ramadan dates only) below the header
  - When a past date is selected, load that day's log from the existing `logs` array
  - Allow editing that day's Tarawih rakaat, fasting status, Quran pages, etc.
  - The `logToday` function already upserts by date, so it naturally supports any date -- just pass the selected date instead of today

---

### Files to modify (5 files)

| File | Change |
|------|--------|
| `src/pages/deen/SalahLog.tsx` | **New file** -- dedicated salah logging page with backdate |
| `src/App.tsx` | Add route for `/iman/salah-log` |
| `src/lib/storage.ts` | Add `dateOverride` param to `logQadaPrayer` and `undoQadaPrayer` |
| `src/pages/QadaSolatTrack.tsx` | Add date picker, wire selected date to logging |
| `src/pages/deen/RamadanOptimizer.tsx` | Add date picker for backdating Ramadan logs |

### Technical Notes

- The salah storage layer (`salah-storage.ts`) needs zero changes since `logSalah(prayer, status, date?)` already accepts an optional date
- Qada Solat storage needs the date param threaded through `logQadaPrayer` and `undoQadaPrayer`
- Ramadan Optimizer already upserts by date to Supabase, so the `logToday` function just needs to use the selected date instead of the current date
- All modules follow the same UI pattern: `BackdatePrompt` on first visit + `BackdateDatePicker` below the title

