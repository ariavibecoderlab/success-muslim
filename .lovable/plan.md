

## Phase 2 Backdate: Weight, Steps, IF Timer, Quran Tracker

### Overview
Add the `BackdateDatePicker` component to the remaining 4 trackers so users can log data for past dates (up to 90 days back). Each module uses LocalStorage with date-keyed entries, so the storage layer already supports arbitrary dates -- we just need to wire up the date picker in the UI and pass the selected date to the storage functions.

### Changes by Module

#### 1. Weight Tracker (`src/pages/health/HealthWeight.tsx`)
- Add `BackdateDatePicker` and `BackdatePrompt` at the top of the page
- Track `selectedDate` state; derive `dateKey` from it
- In `handleAdd`, use `dateKey` instead of `todayKey()` when calling `addWeightEntry`
- Update the "Update Today" / "Log Weight" button label to reflect the selected date
- The `addWeightEntry` function in `health-storage.ts` already accepts a `{ date, weight }` object, so no storage changes needed

#### 2. Steps Tracker (`src/pages/health/HealthSteps.tsx`)
- Add `BackdateDatePicker` and `BackdatePrompt` at the top
- Track `selectedDate` state
- Modify `addStepLog` in `src/lib/steps-storage.ts` to accept an optional `date` parameter (currently hardcodes `todayKey()`)
- Pass `selectedDate` formatted as `yyyy-MM-dd` when logging steps
- Show logs for the selected date instead of always today
- Modify `getStepsToday` to accept an optional date parameter (or add a `getStepsForDate` variant)

#### 3. IF Timer (`src/pages/health/HealthIFTimer.tsx`)
- Add a "Log Past Fast" button in the inactive view (below the Start Fast button)
- This opens a dialog with: date picker, protocol selector, duration input, and Save button
- Manually creates an IF session entry with the selected past date as `startTime`
- No changes to the active timer flow -- backdate only applies to manual logging of completed past fasts
- Modify `src/lib/health-storage.ts` to add a `logPastIF(date, mode, hours)` function that inserts a completed session

#### 4. Quran Tracker (`src/pages/QuranTracker.tsx`)
- Add `BackdateDatePicker` and `BackdatePrompt` at the top
- Track `selectedDate` state
- Modify `logQuranPages` and `addQuranPages` in `src/lib/quran-storage.ts` to accept an optional `date` parameter (currently hardcodes `todayKey()`)
- Load `getQuranDay(dateKey)` for the selected date so the counter shows that day's data
- Pass `dateKey` to all page-add and log operations

### Technical Details

**Storage changes:**
- `src/lib/steps-storage.ts`: Add optional `date` param to `addStepLog` (line 106: `date: todayKey()` becomes `date: dateOverride || todayKey()`)
- `src/lib/steps-storage.ts`: Add `getStepsForDate(date)` function
- `src/lib/quran-storage.ts`: Add optional `date` param to `logQuranPages` (line 44) and `addQuranPages` (line 60)
- `src/lib/health-storage.ts`: Add `logPastIF(date, mode, hours)` function that pushes a completed session

**UI pattern (consistent across all 4):**
- `BackdatePrompt` shown on first visit (one-time, uses localStorage flag per module)
- `BackdateDatePicker` placed below the page title, above the main content
- When a past date is selected, an amber "Backdating" label appears
- All data reads and writes use the selected date

**Files to modify (8 files):**
1. `src/pages/health/HealthWeight.tsx` -- add date picker + wire date to logging
2. `src/pages/health/HealthSteps.tsx` -- add date picker + wire date to logging
3. `src/pages/health/HealthIFTimer.tsx` -- add "Log Past Fast" manual entry dialog
4. `src/pages/QuranTracker.tsx` -- add date picker + wire date to logging
5. `src/lib/steps-storage.ts` -- add date param to `addStepLog`, add `getStepsForDate`
6. `src/lib/quran-storage.ts` -- add date param to `logQuranPages` and `addQuranPages`
7. `src/lib/health-storage.ts` -- add `logPastIF` function
8. `PROGRESS.md` -- mark Phase 2 as complete

