
## Implement "Editable End Time" for IF Timer

### What needs to be built
The End Fast review screen currently has no way to edit the end date/time. The `stopIF()` function always uses system time. Past fasts in the history list are not editable. This plan adds all missing functionality.

### Changes

#### 1. Storage layer (`src/lib/health-storage.ts`)
- Update `IFSession` type to include optional `durationSeconds` field
- Modify `stopIF()` to accept an optional `endTimeOverride` parameter instead of always using `new Date()`
- Add `editIFSession(index, updates)` function to edit past sessions in localStorage and sync to DB
- Add validation: end time must be after start time, not in the future, at least 1 minute duration

#### 2. End Fast review screen (`src/pages/health/HealthIFTimer.tsx`)
- Add date picker and time picker to the End Fast review screen
- Default: today's date, current time
- Wire the selected date/time to calculate and display the real-time duration
- Add validation error messages:
  - "End time cannot be before start time"
  - "End time cannot be in the future"
  - "Fast must be at least 1 minute"
- Pass the user-selected end time to `stopIF(completed, endTimeOverride)`
- The review screen summary card updates duration in real-time as date/time changes

#### 3. Edit past fasts (`src/pages/health/HealthIFTimer.tsx`)
- Make each item in "Recent Fasts" tappable (clickable)
- Clicking opens a Dialog with:
  - Start date/time (editable)
  - End date/time (editable)
  - Duration display (auto-calculated, read-only)
  - Protocol display (read-only)
- Save button calls `editIFSession(index, updates)`
- Validation: same rules as End Fast (end > start, not future, min 1 minute)
- After save, refresh the sessions list

#### 4. History display improvement
- Show calculated duration (e.g., "16h 30m") in each Recent Fasts row
- Show both start and end times

#### 5. DB sync (`src/lib/db-sync.ts`)
- Ensure `syncIFStop` properly stores the user-selected end time (already accepts endTime param, so just needs correct value passed through)

### Files to modify

| File | Change |
|------|--------|
| `src/lib/health-storage.ts` | Add `endTimeOverride` to `stopIF`, add `editIFSession`, update `IFSession` type |
| `src/pages/health/HealthIFTimer.tsx` | Add date/time pickers to review screen, add edit dialog for past fasts, show duration in history |
| `src/lib/db-sync.ts` | Verify `syncIFStop` handles override correctly (may need minor update) |
| `PROGRESS.md` | Update with audit results and feature completion |

### Technical notes
- Date picker uses the existing `Calendar` component (already imported)
- Time picker uses native HTML `<input type="time">` (already used for custom end time)
- All validation happens client-side before calling storage functions
- The 90-day backdate rule applies to editing past fasts (cannot edit fasts older than 90 days)
- localStorage sessions array is indexed, so editing by index is straightforward
- Duration calculation: `(endTime - startTime) / 1000` for seconds, then format as `Xh Ym`
