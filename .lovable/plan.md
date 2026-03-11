

## Swipeable Deen Journey Card + Deen Journey Page

### Overview
Transform the `DailyCheckinCard` into a vertically swipeable card that rotates between 3 slides (Check-in, Solat tracking CTA, Quran reading CTA). Tapping slides 2/3 navigates to a new **Deen Journey** page (`/deen-journey`) that shows today's ibadah progress and weekly trends, fully integrated with existing React Query hooks.

### 1. Transform `DailyCheckinCard.tsx` into a swipeable card

Use `embla-carousel-react` (already installed) with vertical axis:

- **Slide 1**: Current check-in card (unchanged logic)
- **Slide 2**: Solat CTA — show today's salah count (e.g. "3/5 solat logged"), amber gradient accent, tap → `/deen-journey`
- **Slide 3**: Quran CTA — show today's pages/ayahs read from `useQuranReadingLog`, tap → `/deen-journey`

Each slide stays compact (same height as current card). Dot indicators on the right edge for swipe direction. Auto-rotate every 5s.

### 2. Create new page: `src/pages/DeenJourney.tsx`

**Route**: `/deen-journey` (add to `App.tsx` inside AuthGuard)

**Layout** (SubPageLayout with back button):

**Section A — Today's Progress cards:**
- **Solat card**: 5 prayer slots (Fajr→Isha) as a horizontal row with status icons (on-time/late/missed/pending). Uses `useTodaySalahCount()` from `useSalahQuery`. Tap each → quick log via `useSalahMutation`.
- **Sunnah Solat card**: Shows sunnah checklist count from `useSunnahStats()`. Links to `/iman/sunnah`.
- **Quran card**: Today's pages + ayahs from `useQuranReadingLog()`. Shows daily target from `useQuranPrefs()`. Progress bar toward target. Links to `/iman/quran`.

**Section B — Trends (last 7 days):**
- **Prayer consistency**: 7-day bar chart (salah logged per day, max 5). Data from `useSalahLog` for each of last 7 days.
- **Quran reading**: 7-day bar chart (pages per day) from `useQuranReadingLog().last7DaysLogs`.
- **Dhikr count**: 7-day sparkline from existing dhikr hooks.
- Use `recharts` (already installed) `BarChart` for compact inline charts.

### 3. Files to create/modify

| File | Action |
|------|--------|
| `src/components/dashboard/DailyCheckinCard.tsx` | Rewrite with embla vertical carousel, 3 slides |
| `src/pages/DeenJourney.tsx` | New page with today's progress + trends |
| `src/App.tsx` | Add `/deen-journey` route |

### 4. Data integration

All data comes from existing hooks — no new DB tables or migrations needed:
- `useTodaySalahCount()` / `useSalahLog(date)` — prayer data
- `useQuranReadingLog()` — Quran pages, ayahs, streak, last7DaysLogs
- `useSunnahStats()` / `useSunnahLog()` — sunnah checklist
- `useDhikrDaily()` — dhikr count
- `useDailyCheckin()` — check-in streak (slide 1)

