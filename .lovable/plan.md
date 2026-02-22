

## Fix: Edit Fast Dialog — Save Button Not Disabled on Validation Error

### The Bug
When editing a past fast, the user can set an end date in the future (e.g., 25/02/2026 when today is 22/02/2026). The error message "End time cannot be in the future" appears correctly, but:
- The **Save button remains enabled** and clickable
- The **duration still displays** (75h 4m) even though the input is invalid

### The Fix

**File: `src/pages/health/HealthIFTimer.tsx`**

1. Add a `useMemo` or inline computation that performs real-time validation on the edit fields:
   - End time > now? Error
   - End time <= start time? Error
   - Duration < 60 seconds? Error

2. Use this computed error to:
   - Show the error message below the duration (already works)
   - **Disable the Save button** when any validation error exists
   - **Hide or grey out the duration display** when the end time is invalid

3. The validation runs on every change to start/end date/time fields, not just on Save click.

### Changes

| What | Detail |
|------|--------|
| Real-time validation variable | Compute `editValidationError` from the 4 input fields on every render |
| Save button | Add `disabled={!!editValidationError}` prop |
| Duration display | Only show when there is no validation error |
| Error display | Show `editValidationError` instead of only `editError` (which is set on click) |

### Technical Detail

Replace the current pattern where `editError` is only set on Save click. Instead, derive a validation error from the current field values on each render, and use it to control both the error message and the Save button's disabled state. The `editIFSession` still validates server-side as a safety net.
