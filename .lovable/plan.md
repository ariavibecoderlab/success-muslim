

## Add Backdate Support to 5 Missing Modules

The no-op callbacks in Hydration, Sleep, Sunnah, and Dhikr are already fixed. This plan adds `BackdateDatePicker` and `BackdatePrompt` to the 5 modules that currently lack them.

### Modules to Update

| Module | File | Notes |
|--------|------|-------|
| Sunnah Fasting (Health) | `src/pages/health/HealthFasting.tsx` | Calendar-based; add date picker + prompt above calendar |
| Sunnah Fasting (Deen) | `src/pages/deen/DeenFasting.tsx` | Calendar-based; same treatment |
| Sadaqah Tracker | `src/pages/deen/SadaqahTracker.tsx` | Already has a date input in the "Add Donation" dialog -- no BackdateDatePicker needed on the main page, but add BackdatePrompt that opens the Add dialog |
| Qiyam Planner | `src/pages/deen/QiyamPlanner.tsx` | Currently logs only "today"; add date picker + prompt so user can log past nights |
| Daily Tasks | `src/pages/productivity/DailyTasks.tsx` | localStorage-based; add date picker + prompt, pass dateKey to storage functions |

---

### 1. HealthFasting.tsx

- Import `BackdateDatePicker` and `BackdatePrompt`
- Add `selectedDate` and `highlightPicker` state
- Add `BackdatePrompt` above content with callback to set yesterday + highlight
- Add `BackdateDatePicker` centered below month nav
- The existing month calendar still works for toggling days; the date picker gives quick access to backdate context
- No storage changes needed -- `handleToggle` already accepts any date key

### 2. DeenFasting.tsx

- Same approach as HealthFasting
- Import both components, add state, render prompt + picker
- Existing calendar toggle already supports any date key

### 3. SadaqahTracker.tsx

- Add `BackdatePrompt` only (not a date picker on the main page)
- The "Log past data" callback opens the Add Donation dialog (`setAddOpen(true)`) and sets the date form field to yesterday
- This is the most natural flow since donations already have a date field in the dialog

### 4. QiyamPlanner.tsx

- Import both components, add `selectedDate` and `highlightPicker` state
- Add `BackdatePrompt` + `BackdateDatePicker` at the top
- Change `today` constant to use `selectedDate` so the "Log Tonight's Qiyam" button and `todayLog` reference the selected date instead of always today
- The `confirmLogQiyam` function will use the selected date key instead of hardcoded `today`

### 5. DailyTasks.tsx

- Import both components, add `selectedDate` and `highlightPicker` state
- Add `BackdatePrompt` + `BackdateDatePicker` at the top
- Change `getDailyTasks()` to accept a dateKey parameter so it loads the correct day's tasks
- The `addTask`, `toggleTask`, `deleteTask` calls will pass the selected dateKey
- Note: The productivity-storage functions currently use `todayKey()` internally -- these need to accept an optional date parameter

### Technical Details

**Pattern for each module (except Sadaqah):**
```
const [selectedDate, setSelectedDate] = useState(new Date());
const [highlightPicker, setHighlightPicker] = useState(false);
const dateKey = format(selectedDate, 'yyyy-MM-dd');

// In JSX:
<BackdatePrompt moduleKey="<module>" onLogPastData={() => {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  setSelectedDate(y);
  setHighlightPicker(true);
}} />
<BackdateDatePicker
  selectedDate={selectedDate}
  onDateChange={setSelectedDate}
  compact
  highlight={highlightPicker}
/>
```

**Productivity storage changes (`src/lib/productivity-storage.ts`):**
- `getDailyTasks(dateKey?)` -- accept optional date parameter, default to today
- `addTask(text, isMIT, dateKey?)` -- same
- `toggleTask(id, dateKey?)` -- same
- `deleteTask(id, dateKey?)` -- same

### Files Modified
- `src/pages/health/HealthFasting.tsx`
- `src/pages/deen/DeenFasting.tsx`
- `src/pages/deen/SadaqahTracker.tsx`
- `src/pages/deen/QiyamPlanner.tsx`
- `src/pages/productivity/DailyTasks.tsx`
- `src/lib/productivity-storage.ts` (add optional dateKey param)
- `PROGRESS.md`

