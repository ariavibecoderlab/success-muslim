

# 5-Pillar Implementation Plan

## Current State

- **Deen**: Partially built (Qada Solat, Ramadhan Qada, Fidyah working with localStorage). Prayer Times, Quran, Dhikr, Zakat are placeholders.
- **Health, Wealth, Productivity, Family**: All placeholder pages with "Coming Soon" feature lists. Zero functionality.
- **Dashboard**: Rich widget hub with dummy data (prayers, habits, quotes, weekly chart). Not interactive.

---

## Implementation Strategy

Build each pillar as a self-contained module with its own storage keys, types, and sub-pages. Follow the existing pattern: setup page -> tracking page -> localStorage persistence. Each sprint delivers one fully usable pillar.

---

## Sprint 1: Complete Deen Pillar (Priority)

### 1A. Prayer Times Widget
- Integrate the free **Aladhan API** (`api.aladhan.com/v1/timingsByCity`) for real prayer times
- Create `src/lib/prayer-times.ts` for API fetching + caching in localStorage (refresh daily)
- Replace Dashboard dummy prayers with real data
- Add a visual indicator for the current/next prayer
- Allow user to set city (stored in localStorage) via a simple settings modal

### 1B. Dhikr Counter
- New page: `/deen/dhikr`
- Tap-to-count interface with haptic-style animation
- Preset dhikr options: SubhanAllah, Alhamdulillah, Allahu Akbar, custom
- Target counts: 33, 99, or custom
- Daily totals saved to localStorage
- Route added inside AppLayout

### 1C. Zakat Calculator
- New page: `/deen/zakat`
- Input fields: cash savings, gold (grams), silver (grams), investments, debts
- Nisab threshold calculation (gold-based and silver-based)
- Output: total zakatable wealth, 2.5% zakat amount
- Save calculation history to localStorage
- Currency selector (MYR, USD, SAR, etc.)

### 1D. Sunnah Daily Checklist
- New page: `/deen/sunnah`
- Configurable checklist: Rawatib prayers, morning/evening adhkar, Quran tilawah, Dhuha prayer, etc.
- Daily check-off with streak tracking
- Data stored per day in localStorage

### 1E. Hijri Date
- Use a lightweight Hijri conversion library or manual calculation
- Display in Dashboard header and Deen page (replacing hardcoded date)

### Files to create/edit:
- `src/lib/prayer-times.ts` (API + cache logic)
- `src/lib/dhikr-storage.ts` (dhikr persistence)
- `src/lib/zakat.ts` (calculation logic)
- `src/lib/sunnah-storage.ts` (checklist persistence)
- `src/lib/hijri.ts` (date conversion)
- `src/pages/DhikrCounter.tsx`
- `src/pages/ZakatCalculator.tsx`
- `src/pages/SunnahTracker.tsx`
- Update `src/pages/Deen.tsx` (link to new sub-pages, remove "Coming Soon")
- Update `src/pages/Dashboard.tsx` (real prayer data, real Hijri date)
- Update `src/App.tsx` (new routes)

---

## Sprint 2: Health Pillar

### 2A. BMI Calculator
- New page: `/health/bmi`
- Input: weight (kg), height (cm)
- Output: BMI value, category (underweight/normal/overweight/obese), visual gauge
- Save history to localStorage with date stamps

### 2B. Hydration Tracker
- New page: `/health/hydration`
- Tap-to-add glasses (250ml each)
- Daily target: 8 glasses (configurable)
- Visual progress ring
- Daily reset, history saved per date

### 2C. Sunnah Fasting Tracker
- New page: `/health/fasting`
- Calendar view highlighting recommended days (Monday, Thursday, Ayyamul Bidh 13-14-15)
- Tap to mark fasted days
- Monthly/yearly stats and streak counter
- Uses existing `isRecommendedFastingDay()` from calculations.ts

### 2D. Weight Tracker
- New page: `/health/weight`
- Log weight entries with date
- Simple line chart showing trend (using recharts, already installed)
- BMI auto-calculated if height is stored

### 2E. Sleep Tracker
- New page: `/health/sleep`
- Input: bedtime and wake time
- Calculate duration, show quality assessment
- Weekly bar chart of sleep hours

### Files to create/edit:
- `src/lib/health-storage.ts` (all health data persistence)
- `src/pages/health/BmiCalculator.tsx`
- `src/pages/health/HydrationTracker.tsx`
- `src/pages/health/SunnahFasting.tsx`
- `src/pages/health/WeightTracker.tsx`
- `src/pages/health/SleepTracker.tsx`
- Update `src/pages/Health.tsx` (interactive hub)
- Update `src/App.tsx` (new routes)

---

## Sprint 3: Wealth Pillar

### 3A. Budget Tracker
- New page: `/wealth/budget`
- Add income and expense entries with categories
- Categories: Halal income, food, transport, charity, bills, etc.
- Monthly summary with pie chart (recharts)
- Balance calculation

### 3B. Sadaqah Goal Tracker
- New page: `/wealth/sadaqah`
- Set monthly/yearly donation target
- Log donations with date, amount, recipient
- Progress bar toward goal

### 3C. Debt Tracker
- New page: `/wealth/debt`
- Add debts (name, amount, monthly payment)
- Payoff projection with estimated completion date
- Visual progress for each debt

### 3D. Savings Funds
- New page: `/wealth/savings`
- Create named funds (Hajj, Umrah, Emergency, Waqaf)
- Add contributions with date
- Progress toward target amount

### Files to create/edit:
- `src/lib/wealth-storage.ts`
- `src/lib/wealth-types.ts`
- `src/pages/wealth/BudgetTracker.tsx`
- `src/pages/wealth/SadaqahGoals.tsx`
- `src/pages/wealth/DebtTracker.tsx`
- `src/pages/wealth/SavingsFunds.tsx`
- Update `src/pages/Wealth.tsx`
- Update `src/App.tsx`

---

## Sprint 4: Productivity Pillar

### 4A. Daily Task Manager
- New page: `/productivity/tasks`
- Add, complete, delete tasks
- Categorize by life area (Deen, Health, Wealth, Family, Knowledge)
- Daily view with carry-over of incomplete tasks

### 4B. Habit Streak Tracker
- New page: `/productivity/habits`
- Define habits (e.g., "Read 1 page Quran", "Exercise 30 min")
- Daily check-off with streak counting and gamification
- Heat map calendar view (like GitHub contributions)

### 4C. Life Areas Dashboard
- New page: `/productivity/life-areas`
- Self-assessment for 6 areas: Iman, Health, Wealth, Family, Knowledge, Career
- Radar chart visualization (recharts)
- Monthly check-in to update scores

### 4D. Weekly Review
- Summary widget on Productivity hub
- Aggregate stats: tasks completed, habits maintained, streaks

### Files to create/edit:
- `src/lib/productivity-storage.ts`
- `src/lib/productivity-types.ts`
- `src/pages/productivity/TaskManager.tsx`
- `src/pages/productivity/HabitTracker.tsx`
- `src/pages/productivity/LifeAreas.tsx`
- Update `src/pages/Productivity.tsx`
- Update `src/App.tsx`

---

## Sprint 5: Family Pillar

### 5A. Shared Calendar
- New page: `/family/calendar`
- Add family events (appointments, school, religious events)
- Monthly calendar view
- Color-coded by family member

### 5B. Family Goals
- New page: `/family/goals`
- Create shared goals with target dates
- Track progress together
- Categories: Education, Savings, Travel, Spiritual

### 5C. Kids Education Tracker
- New page: `/family/education`
- Track children's Quran memorization (surah progress)
- Islamic studies milestones
- Simple progress visualization per child

### 5D. Household Tasks
- New page: `/family/chores`
- Create and assign chores to family members
- Weekly rotation option
- Completion tracking

### 5E. Savings Funds (Family)
- Shared view of Hajj, Umrah, Holiday, Waqaf funds
- Links to Wealth pillar savings with family context

### Files to create/edit:
- `src/lib/family-storage.ts`
- `src/lib/family-types.ts`
- `src/pages/family/SharedCalendar.tsx`
- `src/pages/family/FamilyGoals.tsx`
- `src/pages/family/KidsEducation.tsx`
- `src/pages/family/HouseholdTasks.tsx`
- Update `src/pages/Family.tsx`
- Update `src/App.tsx`

---

## Cross-Cutting: Dashboard Integration

After each sprint, update Dashboard.tsx to replace dummy data with real aggregated data:

- Sprint 1: Real prayer times, real Hijri date, real habit data from Sunnah tracker
- Sprint 2: Real hydration count, real fasting streak
- Sprint 3: Monthly budget summary widget
- Sprint 4: Tasks completed today, habit streaks
- Sprint 5: Upcoming family events

---

## Technical Approach

| Concern | Approach |
|---------|----------|
| State | localStorage per module (existing pattern) |
| Types | Dedicated types file per pillar |
| Storage | Dedicated storage file per pillar |
| Routing | Sub-pages under each pillar (e.g., `/health/bmi`) |
| Charts | recharts (already installed) |
| Animations | framer-motion (already installed) |
| Icons | lucide-react only (no emoji/hardcoded) |
| Layout | Sub-pages inside AppLayout (bottom nav visible) where appropriate |

---

## Recommended Execution Order

1. **Sprint 1 (Deen)** -- highest user value, builds on existing foundation
2. **Sprint 4 (Productivity)** -- task manager and habits are universally useful and feed Dashboard
3. **Sprint 2 (Health)** -- standalone trackers, no dependencies
4. **Sprint 3 (Wealth)** -- more complex data relationships
5. **Sprint 5 (Family)** -- ideally needs multi-user support (future cloud), but single-user version first

Each sprint can be implemented in 1-2 sessions. Want me to start with Sprint 1 (Complete Deen)?

