

## IF Timer Plan Selection Redesign

Replace the horizontal pill selector with an in-ring plan label and a beautiful bottom sheet plan picker, matching the reference screenshots.

---

### Changes Overview

#### 1. New Component: `PlanSelectorSheet.tsx`

Create `src/components/health/PlanSelectorSheet.tsx` -- a bottom drawer (using the existing `vaul` Drawer component) titled "Change your plan".

Contains 7 scrollable plan cards (14:10, 16:8, 18:6, 20:4, 24h, 36h, Custom) each with:
- Large bold plan name (e.g. "16:8")
- Colored lightning bolts for difficulty (using Zap icon with varying opacity/color)
- Bullet points: "X hours fasting" / "X hours eating period"
- Watermark "1 DAY" text on the right (or "1.5 DAYS" for 36h)
- Unique background color per card:
  - 14:10: warm peach `bg-orange-50`
  - 16:8: soft blue `bg-blue-50`
  - 18:6: warm cream `bg-amber-50`
  - 20:4: light grey-green `bg-stone-100`
  - 24h: darker `bg-slate-100`
  - 36h: darkest `bg-slate-200`
  - Custom: neutral `bg-secondary`
- Custom card shows a number input for hours

Tapping a card calls `onSelect(mode)` and closes the sheet.

#### 2. Update `FastingTimerRing.tsx`

Add an `onPlanTap` callback prop and `planLabel` prop. Inside the ring center, show the plan label with a pencil icon that triggers `onPlanTap`. This replaces the current `mode` text shown below the ring.

For active fasts: show plan label inside ring (read-only, no pencil -- plan can't change mid-fast).
For inactive state: show plan label + pencil icon, tappable.

#### 3. Redesign Inactive View in `HealthIFTimer.tsx`

Remove the horizontal pill selector (`MODES.map` pills + Custom button, lines 378-392).

Replace with:
- Header: "Get ready to fast!" (bold)
- Warm card: "Log your meal!" with + icon (links to hydration or is decorative)
- Inactive timer ring with yellow/warm stroke color showing:
  - "[Plan name] pencil-icon" (tappable to open sheet)
  - "Time since last fast"
  - Counting-up timer from last fast end
- Two buttons below ring:
  - "Start [Plan] Fasting" -- filled primary/green button
  - "Remind me later" -- outline button (placeholder, just shows toast)

#### 4. Save Selected Plan to Health Profile

Use `useHealthProfile.saveProfile({ recommended_protocol: mode.label })` to persist the selected plan. On load, initialize `selectedMode` from `profile?.recommended_protocol`.

#### 5. Remove Custom View

Remove the `showCustom` state and the entire custom view section (lines 498-551). The Custom option is now a card inside the PlanSelectorSheet that includes an inline hour input. Selecting it sets the mode to "Custom Xh".

#### 6. Update PROGRESS.md

Add entry for IF Timer plan selection redesign.

---

### Technical Details

**Plan data structure:**
```typescript
const PLANS = [
  { label: '14:10', hours: 14, eating: 10, bolts: 4, boltColors: ['orange','orange/50','orange/30','orange/20'], bg: 'bg-orange-50', watermark: '1 DAY' },
  { label: '16:8',  hours: 16, eating: 8,  bolts: 4, boltColors: ['blue','blue/50','blue/30','blue/20'], bg: 'bg-blue-50', watermark: '1 DAY' },
  { label: '18:6',  hours: 18, eating: 6,  bolts: 3, boltColors: ['amber','amber/60','amber/30'], bg: 'bg-amber-50', watermark: '1 DAY' },
  { label: '20:4',  hours: 20, eating: 4,  bolts: 3, boltColors: ['green','green/60','green/30'], bg: 'bg-stone-100', watermark: '1 DAY' },
  { label: '24h',   hours: 24, eating: 0,  bolts: 2, boltColors: ['slate','slate/40'], bg: 'bg-slate-100', watermark: '1 DAY' },
  { label: '36h',   hours: 36, eating: 0,  bolts: 2, boltColors: ['slate','slate/40'], bg: 'bg-slate-200', watermark: '1.5 DAYS' },
];
```

**Files changed:**
```text
src/components/health/PlanSelectorSheet.tsx  -- NEW
src/components/health/FastingTimerRing.tsx    -- Add planLabel + onPlanTap
src/pages/health/HealthIFTimer.tsx            -- Remove pills, add sheet, redesign inactive view
PROGRESS.md                                  -- Update
```

**Inactive ring:** Uses a warm yellow stroke (`hsl(45, 90%, 65%)`) with dashed pattern to match the reference's eating-window aesthetic. The ring shows elapsed time since last completed fast.

**"Time since last fast" counter:** Calculated from the most recent completed session's `endTime`. If no sessions exist, shows "00:00:00".
