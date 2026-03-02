

## Polish the "Log Past Data" Components

### Current State
Three components make up the backdate feature:
1. **BackdatePrompt** -- amber banner that appears on module pages (auto-dismisses in 8s)
2. **BackdateDatePicker** -- date picker with chevron arrows and calendar popover
3. **LogPastDataRow** (in Settings) -- expandable row showing module grid buttons

All three are functional but visually plain -- flat buttons, no icons on modules, no color coding, basic grid layout.

### Changes

#### 1. BackdatePrompt -- Gradient Icon + Better Buttons
- Replace plain `CalendarDays` icon with a gradient pill background (`bg-gradient-to-br from-amber-400/80 to-orange-500/80` with white icon), matching the Iman page style
- Convert text-only "Log past data" / "Dismiss" links into small pill buttons with proper hover states
- Add a subtle progress bar that shows the 8-second auto-dismiss countdown
- Slightly rounder card with `rounded-xl`

#### 2. BackdateDatePicker -- Refined Styling
- Add a subtle amber gradient background to the "Backdating" badge: `bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full`
- Style the date button with a light amber tint when not on today: `bg-amber-50 border-amber-200`
- Improve "Go to Today" button in popover with a small `Sunrise` icon

#### 3. LogPastDataRow (Settings) -- Colorful Module Grid
- Add unique icons and colors to each module button, matching the dashboard Quick Log style:
  - Solat: emerald, Quran: amber, Dhikr: violet, Sunnah: pink, Water: blue, Sleep: indigo, Steps: teal, Weight: orange, Fasting: orange, Habits: teal
- Each button gets a small colored dot or icon alongside the label
- Add stagger animation to grid items using `motion.div`
- Slightly larger buttons with `h-8` for better tap targets

---

### Files Modified (3)

| File | Change |
|------|--------|
| `src/components/BackdatePrompt.tsx` | Gradient icon pill, pill buttons, countdown bar, rounded-xl |
| `src/components/BackdateDatePicker.tsx` | Amber tint when backdating, styled badge, icon on "Go to Today" |
| `src/pages/Settings.tsx` | Colored icons per module, stagger animation, larger tap targets in LogPastDataRow |

### Technical Notes
- No behavioral changes -- same 8s auto-dismiss, same 90-day limit, same localStorage persistence
- All colors use Tailwind's built-in palette
- Dark mode variants included for all new colors
- Stagger animation reuses the same pattern from Iman/Dashboard pages

