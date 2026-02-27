
## Standardize IF Timer's "Log Past Fast" with Shared Backdate Components

Replace the custom inline date picker in the "Log Past Fast" dialog with the shared `BackdateDatePicker` component, and add `BackdatePrompt` to the page for consistency.

### Changes to `src/pages/health/HealthIFTimer.tsx`

**1. Add imports**
- Import `BackdateDatePicker` from `@/components/BackdateDatePicker`
- Import `BackdatePrompt` from `@/components/BackdatePrompt`

**2. Add BackdatePrompt to the inactive view**
- Add `highlightPicker` state (boolean, default false)
- Render `<BackdatePrompt moduleKey="if-timer" onLogPastData={...} />` at the top of the inactive view (before the header)
- The `onLogPastData` callback opens the Log Past Fast dialog (`setShowLogPast(true)`)

**3. Replace custom date picker in Log Past Fast dialog (lines 628-651)**
- Remove the custom `Popover` + `Calendar` block for date selection
- Remove `pastCalOpen` state variable (line 113) since it's no longer needed
- Replace with `<BackdateDatePicker selectedDate={pastDate} onDateChange={setPastDate} />` inside the dialog
- Keep the rest of the dialog (Protocol selector, Duration input, Save button) unchanged

**4. Cleanup unused imports**
- Remove `Calendar` import (if not used elsewhere in the file -- it IS used in the end-review section, so keep it only if needed there)
- Check if `Popover`/`PopoverContent`/`PopoverTrigger` are used elsewhere in the file; remove if not

### What stays the same
- The `logPastIF` storage function call and its parameters
- Protocol selector and duration input in the dialog
- End Fast Review section (has its own date editing, separate concern)
- All active fasting view logic

### Files modified
- `src/pages/health/HealthIFTimer.tsx` (single file)
