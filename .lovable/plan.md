
# Improve IF Timer Fasting Stages Timeline

## What Changes

### 1. Auto-scrolling Timeline (`src/components/health/FastingStageCard.tsx`)
- Add a `useRef` for each stage button and the scroll container
- Use `useEffect` to auto-scroll the timeline to the current active level whenever the stage changes
- Use `scrollIntoView({ behavior: 'smooth', inline: 'center' })` for smooth sliding animation
- Make current level icon larger (w-10 h-10 vs w-8 h-8 for others) with a green ring/glow
- Completed levels: filled green, smaller (w-7 h-7)
- Future levels: greyed out, smallest (w-7 h-7)

### 2. Level-Up Toast Notification (`src/pages/health/HealthIFTimer.tsx`)
- Track the previous stage level in a `useRef`
- When `currentStage.level` changes (increases), fire a sonner toast: "Level Up! You've reached Lv.X -- Stage Name"
- Also fire a browser push notification if permission is granted (reusing the `showNotification` pattern from `usePrayerNotifications.ts`)

### 3. Update PROGRESS.md and plan.md
- Add entry for timeline auto-scroll and level-up notifications

## Technical Details

### FastingStageCard.tsx (StagesTimeline component)
- Add `useRef<HTMLDivElement>(null)` for the scroll container
- Add `useRef<Record<number, HTMLButtonElement>>({})` to store refs for each stage button
- `useEffect` watching `currentStage.level`: when it changes, call `stageRefs.current[currentStage.level]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })`
- Adjust icon sizes: current = `w-10 h-10`, completed = `w-7 h-7 bg-primary`, future = `w-7 h-7 bg-muted`
- Current level gets a ring: `ring-2 ring-primary ring-offset-2`

### HealthIFTimer.tsx (Level-up detection)
- Add `prevLevelRef = useRef(currentStage?.level)` 
- In the timer `useEffect`, compare current level to prev level; if increased, show toast via `sonner` and fire browser `Notification` if permitted
- Update `prevLevelRef.current` after notification

### Files Changed

| File | Action |
|------|--------|
| `src/components/health/FastingStageCard.tsx` | Modify -- auto-scroll, size differentiation |
| `src/pages/health/HealthIFTimer.tsx` | Modify -- level-up toast + push notification |
| `PROGRESS.md` | Modify -- add entry |
| `.lovable/plan.md` | Modify -- update |

All 11 levels are already correctly defined in `src/lib/fasting-stages.ts` with proper hour ranges, icons, descriptions, and Islamic framing. No changes needed there.
