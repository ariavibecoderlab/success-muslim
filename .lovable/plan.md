

## Fix: BackdateDatePicker Not Visible on Orange Hero Card

### Problem
The `BackdateDatePicker` in the Dhikr hero card uses default styling (`variant="outline"`, `variant="ghost"`) which renders with dark/muted colors — invisible against the orange gradient background. The screenshot confirms: the chevron arrows and "Today" button are barely visible.

### Solution
Pass white-themed class overrides to the `BackdateDatePicker` when used inside the orange card. Since the component accepts a `className` prop but that only wraps the container, the simplest fix is to add a `variant` or `dark` prop to `BackdateDatePicker` that switches all internal elements to white styling.

### Changes

**1. `src/components/BackdateDatePicker.tsx`**
- Add a `darkMode?: boolean` prop
- When `darkMode` is true:
  - Chevron buttons: `text-white/70 hover:text-white hover:bg-white/10` instead of default ghost
  - Date trigger button: `bg-white/15 border-0 text-white hover:bg-white/25` instead of outline
  - "Backdating" badge: `bg-white/20 text-white` instead of amber

**2. `src/pages/DhikrCounter.tsx`**
- Pass `darkMode` to the `BackdateDatePicker` on line 194:
  ```tsx
  <BackdateDatePicker selectedDate={selectedDate} onDateChange={handleDateChange} compact highlight={highlightPicker} darkMode />
  ```

### Files Modified
- `src/components/BackdateDatePicker.tsx` — Add `darkMode` prop with white styling variants
- `src/pages/DhikrCounter.tsx` — Pass `darkMode` to the picker

