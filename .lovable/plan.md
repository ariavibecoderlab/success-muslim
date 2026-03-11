

## Dashboard Redesign — Personal Islamic Companion

This is a major redesign touching 6 areas. I'll break it into manageable pieces.

### Database Change

**New table: `daily_checkins`**
```sql
CREATE TABLE public.daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  streak_day integer NOT NULL DEFAULT 1,
  points_earned integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
-- RLS: users can CRUD own rows
```

### New Files to Create

1. **`src/components/dashboard/RotatingHeader.tsx`** — Replaces static AppHeader title area
   - Cycles every 3s with fade animation between: "Salaam, [FirstName]" → Hijri date → Gregorian day name
   - Subtitle shows next prayer info ("Subuh · 04:32") or Ramadan context ("Ramadan Day 21 · Iftar in Xh Xm")
   - Uses `useAuth` for name, `useHijriDate` for dates, `fetchPrayerTimes` for prayer info

2. **`src/components/dashboard/HeroPrayerCard.tsx`** — Next prayer hero card (top of page)
   - Green gradient card with prayer name, time, countdown, progress bar (X/5 done)
   - One-tap log button for next prayer via `useSalahMutation`
   - Completion state: "MasyaAllah! Semua solat hari ini selesai" when 5/5
   - Reuses logic from `NextPrayerWidget` but elevated design

3. **`src/components/dashboard/RamadanBanner.tsx`** — Conditional Ramadan banner
   - Amber/gold gradient, shows day X of 30, streak, iftar countdown, progress bar
   - Special messages for day 21+, day 27
   - Only renders when `isRamadan` is true
   - Links to `/health/fasting`

4. **`src/components/dashboard/DailyCheckinCard.tsx`** — Daily check-in with streak
   - Shows streak day circles (7-day), points for today, claim button
   - Escalating points: 10, 10, 15, 20, 25, 30, 150
   - After claim: "Sudah check-in hari ini ✓ (+X pts)"
   - New hook `useDailyCheckin` handles DB read/write

5. **`src/components/dashboard/ForYouSection.tsx`** — Contextual "For You" cards
   - Priority-based card selection from user data (Ramadan context, active fast, prayer streak, sleep, Quran)
   - Max 3 cards, white cards with left color border
   - Each card has icon, title, subtitle, CTA linking to relevant page

6. **`src/hooks/useContextualGreeting.ts`** — Time-based greeting logic
   - Returns greeting string based on hour + optional streak/Ramadan context
   - Used by RotatingHeader subtitle

7. **`src/hooks/useDailyCheckin.ts`** — Check-in data hook
   - Queries `daily_checkins` for today + recent streak
   - Mutation to claim today's check-in with calculated points

### Files to Modify

1. **`src/components/AppHeader.tsx`** — Accept `rotatingContent` prop to replace static title; when provided, render the rotating header component instead of brand name

2. **`src/pages/Dashboard.tsx`** — New layout order:
   ```
   AppHeader (with RotatingHeader)
   HeroPrayerCard
   RamadanBanner (conditional)
   DailyCheckinCard
   LifeScoreCard
   QuickLogGrid
   ForYouSection
   WidgetGrid
   DailyQuoteCard
   ```

3. **`src/hooks/useDashboardData.ts`** — Expose `ramadanDay`, `displayName` (first name only), and pass through Hijri/prayer data needed by new components

### Design Patterns

- All new cards follow established pattern: `border-0 shadow-sm`, `p-3` padding, no emoji in code (use Lucide icons)
- HeroPrayerCard: `bg-gradient-to-br from-emerald-500 to-teal-600 text-white` (matches LifeScore)
- RamadanBanner: `bg-gradient-to-br from-amber-500 to-orange-600 text-white`
- DailyCheckinCard: white card with emerald accent
- ForYou cards: white card with colored left border (`border-l-4`)
- All animations use existing `fadeUp` / `framer-motion` patterns

### Implementation Order

1. DB migration (daily_checkins table)
2. Hooks (useContextualGreeting, useDailyCheckin)
3. Components (RotatingHeader, HeroPrayerCard, RamadanBanner, DailyCheckinCard, ForYouSection)
4. Wire up in AppHeader + Dashboard.tsx

