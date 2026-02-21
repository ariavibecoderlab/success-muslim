

# Premium IF Timer Upgrade — Full Implementation Plan

## Overview

A major upgrade of the IF Timer feature with 5 parts: Health Onboarding, Active Fasting Screen Redesign, Streak Celebration, Dashboard Widget Update, and backend data persistence.

---

## PART 1 — Health Onboarding (11 Screens)

### Database

Create a `user_health_profiles` table:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid UNIQUE | references auth.users |
| goal | text | lose_weight, healthy_habits, mental_clarity, sunnah_fasting, boost_energy |
| gender | text | male / female |
| age | integer | |
| height_cm | numeric | stored in cm |
| weight_kg | numeric | stored in kg |
| goal_weight_kg | numeric | |
| bmi | numeric | calculated |
| tdee | numeric | calculated |
| eating_habits | text | whatever, healthy, calories, islamic |
| sleep_hours | text | <5, 5-6, 6-7, 7-8, >8 |
| activity_level | text | sedentary, light, moderate, active |
| fasting_experience | text | first_time, few_times, regular, sunnah |
| recommended_protocol | text | e.g. 16:8, 18:6 |
| completed_at | timestamptz | marks onboarding done |
| created_at | timestamptz | default now() |

RLS: Users can only read/write their own row.

### New Files

| File | Purpose |
|------|---------|
| `src/pages/health/IFOnboarding.tsx` | Main onboarding flow (11 steps) |
| `src/hooks/useHealthProfile.ts` | Hook to fetch/check profile completion |
| `src/lib/if-onboarding-data.ts` | Static data: options, labels, recommendation logic |

### Flow

- When user navigates to `/health/if-timer`, check if `user_health_profiles` has a row with `completed_at` set
- If not, redirect to `/health/if-onboarding`
- Add route in `App.tsx`
- Each screen: full-height, progress bar at top, Skip button, Back/Next navigation
- Framer Motion slide transitions (reuse existing `slideVariants` pattern from Onboarding.tsx)
- Screens 1,2,7,8,9,10: Tap-to-select option cards with Lucide icons (no emojis)
- Screen 3 (Age): Custom scroll wheel using CSS scroll-snap
- Screen 4 (Height): Slider component with cm/ft toggle
- Screen 5 (Weight): Slider with kg/lb toggle + live BMI calculation below
- Screen 6 (Goal Weight): Slider + "X kg to lose" + estimated timeframe
- Screen 11 (Report): Summary card with BMI color spectrum bar, body stats grid, recommended protocol

### Recommendation Logic

Based on experience + goal:
- First timers / sedentary -> 14:10
- Regular / active -> 16:8
- Sunnah fasters -> 18:6 or alternate-day

---

## PART 2 — Active Fasting Screen Redesign

### Modified Files

| File | Changes |
|------|---------|
| `src/pages/health/HealthIFTimer.tsx` | Major redesign of the active fasting view |
| `src/lib/if-educational-content.ts` | New: static arrays for tips, FAQs, educational cards |
| `src/components/health/FastingTimerRing.tsx` | New: extracted circular timer component with color shifts per level |
| `src/components/health/FastingEducationCards.tsx` | New: horizontal scrolling educational cards |
| `src/components/health/FastingTipsCard.tsx` | New: during-fasting tips with Islamic framing |
| `src/components/health/FastingFAQCard.tsx` | New: rotating FAQ card |
| `src/components/health/FastingChallenges.tsx` | New: challenge section (local tracking for now) |

### Active Screen Layout (top to bottom)

1. **Header**: "You're fasting!" title with share icon (left) + water glass quick-log (right)
2. **Educational Cards**: Horizontal scroll of 4-5 cards related to current stage (tappable to expand)
3. **Main Timer Ring**: Large circular SVG with:
   - Level badge inside
   - "Elapsed time" label
   - HH:MM:SS (large, bold)
   - Toggle button to swap elapsed/remaining
   - Ring color shifts: green (Lv.1-3) -> teal (Lv.4-6) -> blue (Lv.7-11)
   - Progress fills clockwise
4. **Start/End Timeline**: Green dot for start time (editable) + circle for expected end
5. **Fasting Stages Slider**: Existing auto-scrolling timeline (already built)
6. **During Fasting Tips Card**: Green-tinted card with bullet points + Islamic tip
7. **FAQ Card**: Single rotating FAQ question with tap-to-expand
8. **Challenge Section**: 3 preset challenges, join button, auto-tracked from logs
9. **End Fasting Button**: Large green button with confirmation dialog

### Challenge Tracking

Store challenge participation in localStorage initially (can migrate to DB later):
- Track: challenge ID, joined date, progress hours
- Progress auto-calculated from `IFSession[]`

---

## PART 3 — Streak Celebration

### New File

| File | Purpose |
|------|---------|
| `src/components/health/FastingStreakCelebration.tsx` | Full-screen celebration popup |

### Behavior

- Triggered after ending a fast when streak is at milestone: 1, 3, 7, 14, 21, 30
- Full-screen overlay with framer-motion animations
- Animated flame SVG (simple, created with Lucide Flame icon + motion.div scale/rotate)
- Large streak number + "Day Streak!" text
- Weekly calendar row: Sun-Sat with completed circles
- "Cheers!" dismiss button
- "You can turn off streak popups in settings" note
- Setting for disabling stored in localStorage

---

## PART 4 — Dashboard Widget Update

### Modified File

| File | Changes |
|------|---------|
| `src/components/widgets/IFFastingWidget.tsx` | Enhanced active + inactive states |

### Active State

- "You're fasting!" header with level badge
- Elapsed time HH:MM:SS
- Expected end time
- Progress bar with percentage
- Next level countdown
- End Fast button

### Inactive State

- Last fast info (when + duration)
- Best streak count
- Start Fast button (links to IF Timer page)

---

## PART 5 — Technical Details

### Files Summary

| File | Action |
|------|--------|
| `src/pages/health/IFOnboarding.tsx` | Create |
| `src/hooks/useHealthProfile.ts` | Create |
| `src/lib/if-onboarding-data.ts` | Create |
| `src/lib/if-educational-content.ts` | Create |
| `src/components/health/FastingTimerRing.tsx` | Create |
| `src/components/health/FastingEducationCards.tsx` | Create |
| `src/components/health/FastingTipsCard.tsx` | Create |
| `src/components/health/FastingFAQCard.tsx` | Create |
| `src/components/health/FastingChallenges.tsx` | Create |
| `src/components/health/FastingStreakCelebration.tsx` | Create |
| `src/pages/health/HealthIFTimer.tsx` | Major modify |
| `src/components/widgets/IFFastingWidget.tsx` | Modify |
| `src/App.tsx` | Add route for `/health/if-onboarding` |
| `PROGRESS.md` | Update |
| `.lovable/plan.md` | Update |

### Database Migration

- Create `user_health_profiles` table with RLS policies
- Policies: authenticated users can SELECT/INSERT/UPDATE their own row only

### Design Principles

- All icons: Lucide React (no hardcoded emojis in UI components)
- Animations: framer-motion throughout
- Dark mode: all components use CSS variables / Tailwind tokens
- Mobile-first: designed for phone screens
- Timer accuracy: calculated from `startTime` (persisted), not a live counter

### Implementation Order

Due to scope, this will be implemented in sequence:
1. Database migration (user_health_profiles table)
2. Health Onboarding flow (11 screens + hook + route)
3. Educational content data + new components
4. Active fasting screen redesign
5. Streak celebration popup
6. Dashboard widget update
7. Update PROGRESS.md and plan.md

