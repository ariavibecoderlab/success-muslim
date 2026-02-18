

# Custom Fasting Timer Redesign

## What Changes

The custom fasting mode currently requires picking both a **start** and **end** time upfront. Instead, it should work like a stopwatch:

1. **Start only** -- User picks a start date/time (or starts now), and the timer begins counting **up** (elapsed time)
2. **End button** -- User taps "End Fast" whenever they're done. The total duration is calculated automatically
3. **Delete button** -- User can remove/cancel the active fast entirely (no record saved)

---

## How It Will Work

- When user taps "Custom", they see a date/time picker for the **start time only** (no end picker)
- A "Start Fast" button begins the custom fast
- While active, the circular timer shows **elapsed time** counting up (no predetermined end)
- Two buttons appear during an active custom fast:
  - **End Fast** (green) -- stops the timer, saves the session with the actual duration
  - **Delete** (red/outline) -- cancels and removes the fast completely, no record saved

---

## Technical Details

### File: `src/pages/health/HealthIFTimer.tsx`

- Remove the **end date/time picker** section from the custom fasting card
- Remove "Total Fasting Time" preview (since there's no predetermined end)
- Keep the start date/time picker (date, hour, minute, AM/PM)
- Change "Save & Start" to just "Start Fast"
- When custom fast is active:
  - Timer counts up (elapsed) with no "remaining" -- show elapsed as the main display
  - Show **"End Fast"** button that saves the session with `completed: true`
  - Show **"Delete"** button that removes the active fast without saving (`stopIF(false)` or just clear localStorage)
- For the circular progress ring during custom fast: show a pulsing/spinning animation since there's no fixed end, or simply show elapsed time without the ring progress

### File: `src/lib/health-storage.ts`

- Update `startIF` to allow `fastingHours = 0` or `Infinity` to indicate open-ended custom fasts
- `stopIF` already calculates end time, so it will naturally record the actual duration
- Add a `deleteIF()` function that clears the active fast without saving any session record

