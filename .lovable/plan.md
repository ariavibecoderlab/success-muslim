
# Mobile Layout Fixes — Quran Tracker

## Issues Found via Code Review (390px Mobile Viewport)

### 1. Calendar Grid — Most Critical
- **Current**: `grid-cols-10` with 30 cells, `text-[8px]` day numbers
- **Problem**: On 390px screen with padding, usable width ~278px → each cell ~25px wide. 8px font is **below minimum readable size** (11px minimum for accessibility)
- **Fix**: Switch to `grid-cols-7` showing last **28 days** (4 complete weeks). Each cell becomes ~37px wide with `text-[11px]` — readable and feels like a proper weekly calendar. Add day-of-week headers (S M T W T F S) above for context.

### 2. Achievements Grid — Labels Truncate
- **Current**: `grid-cols-4`, `text-[9px]`, label "30 Day Streak" in ~64px cell
- **Problem**: Multi-word labels wrap awkwardly at 9px — nearly unreadable
- **Fix**: Keep `grid-cols-4` but increase label to `text-[10px]`, add `leading-tight break-words text-center` properly, and allow labels to wrap to 2 lines cleanly

### 3. Target Card Estimated Date — Too Small
- **Current**: `text-[9px]` for the estimated completion date
- **Fix**: Bump to `text-[10px]` — slight improvement for readability

### 4. Onboarding — Target Card Layout at 390px
- **Current**: `grid-cols-2` with `p-3` cards, `text-[9px]` estimated date
- **Problem**: Cards are narrow at ~155px each. The estimated date "Est. complete: 20 Aug 2026" can overflow on smaller targets
- **Fix**: Make estimated date truncate with `truncate` or wrap with proper line height. Also bump to `text-[10px]`.

### 5. Stats Row Cards — Minor
- **Current**: `grid-cols-3` with `text-lg font-bold` number and `text-[10px]` label
- **Status**: Works fine at 390px — no fix needed

## Files to Change

### `src/pages/deen/QuranReader.tsx`

#### Change 1 — `QuranCalendar` component (lines 71–110)
- Switch from 30-day `grid-cols-10` to 28-day `grid-cols-7`
- Add 7 day-of-week header cells (Sun → Sat) above the grid
- Change cell font from `text-[8px]` to `text-[11px]`
- Adjust `rounded-sm` to `rounded` for a softer look at larger size
- Legend stays the same

```
Before: grid grid-cols-10 gap-1  →  After: grid grid-cols-7 gap-1.5
Before: text-[8px]               →  After: text-[11px]
Days shown: 30                   →  28 (4 complete weeks)
```

#### Change 2 — Achievements grid (lines 450–458)
- Add `min-h-[60px]` to achievement cells so labels have room
- Change `text-[9px]` to `text-[10px]` with `leading-tight`

#### Change 3 — Target onboarding cards (lines 271–276)
- Bump estimated date from `text-[9px]` to `text-[10px]`
- Add `line-clamp-1` so it truncates rather than wrapping oddly

### Visual Result on 390px

```text
BEFORE calendar (10 cols, 8px text):          AFTER calendar (7 cols, 11px text):
┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐                       S  M  T  W  T  F  S
│1│2│3│4│5│6│7│8│9│0│  ← barely readable     ┌──┬──┬──┬──┬──┬──┬──┐
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘                       │25│26│27│28│29│30│31│
                                              ├──┼──┼──┼──┼──┼──┼──┤
                                              │ 1│ 2│ 3│ 4│ 5│ 6│ 7│  ← clear, week view
                                              └──┴──┴──┴──┴──┴──┴──┘
```

## Summary of Changes

| Element | Before | After |
|---|---|---|
| Calendar grid | 10 cols, 30 days, 8px font | 7 cols, 28 days, 11px font + day headers |
| Achievement labels | 9px | 10px with leading-tight |
| Target onboarding date | 9px | 10px with truncate |
