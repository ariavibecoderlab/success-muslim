

## Fix BackdatePrompt Design + No-op Callbacks

Two changes: redesign the shared BackdatePrompt component from a blocking modal to a gentle top banner, and fix the 4 modules where "Log past data" does nothing.

---

### 1. Redesign BackdatePrompt (src/components/BackdatePrompt.tsx)

Replace the Dialog/modal with a non-blocking animated banner:

- **Layout**: A small card/banner rendered inline at the top of page content (not a modal overlay)
- **Style**: `bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-400` with rounded corners, soft shadow
- **Content**: Calendar icon + single line "Have past data to log? You can go back 90 days." + two small ghost/link buttons: "Log past data" | "Dismiss"
- **Animation**: Framer Motion `slide down` on enter (y: -20 to 0, opacity 0 to 1), `slide up` on dismiss (reverse)
- **Auto-dismiss**: `setTimeout` of 8 seconds that calls dismiss, cleared if user interacts
- **No longer blocks**: Remove Dialog import entirely; render as a simple `AnimatePresence` + `motion.div` inline element
- **Props unchanged**: Same `moduleKey` and `onLogPastData` interface so all consumers work without changes

### 2. Fix no-op callbacks in 4 modules

Each of these already has `selectedDate` state and a `BackdateDatePicker`. The fix: replace `() => {}` with a function that sets selectedDate to yesterday.

| File | Current | Fix |
|------|---------|-----|
| `src/pages/DhikrCounter.tsx` (line 129) | `onLogPastData={() => {}}` | `onLogPastData={() => { const y = new Date(); y.setDate(y.getDate() - 1); handleDateChange(y); }}` |
| `src/pages/health/HealthHydration.tsx` (line 37) | `onLogPastData={() => {}}` | `onLogPastData={() => { const y = new Date(); y.setDate(y.getDate() - 1); setSelectedDate(y); }}` |
| `src/pages/health/HealthSleep.tsx` (line 86) | `onLogPastData={() => {}}` | `onLogPastData={() => { const y = new Date(); y.setDate(y.getDate() - 1); setSelectedDate(y); }}` |
| `src/pages/SunnahTracker.tsx` (line 126) | `onLogPastData={() => {}}` | `onLogPastData={() => { const y = new Date(); y.setDate(y.getDate() - 1); handleDateChange(y); }}` |

### 3. Add pulse highlight to BackdateDatePicker

- Add an optional `highlight` prop to `BackdateDatePicker` (boolean, default false)
- When `highlight` is true, apply a 2-second `animate-pulse` ring effect around the date button, then auto-clear
- In each of the 4 fixed modules, set a `highlightPicker` state to `true` when "Log past data" is tapped, pass it to `BackdateDatePicker`, and auto-clear after 2s

### Files modified
- `src/components/BackdatePrompt.tsx` -- full redesign (banner, animations, auto-dismiss)
- `src/components/BackdateDatePicker.tsx` -- add optional `highlight` prop with pulse effect
- `src/pages/DhikrCounter.tsx` -- fix callback + add highlight state
- `src/pages/health/HealthHydration.tsx` -- fix callback + add highlight state
- `src/pages/health/HealthSleep.tsx` -- fix callback + add highlight state
- `src/pages/SunnahTracker.tsx` -- fix callback + add highlight state
- `PROGRESS.md` -- update changelog

