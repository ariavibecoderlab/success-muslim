# Income Sources Section — Plan

Add a dedicated **Income Sources** card to the Wealth hub (`/wealth`) that breaks down income by source category (Salary, Freelance, Business, Investment, Gift, Other) with **Today / This Week / This Month** totals and a quick-add CTA. Uses existing `transactions` table — no schema changes.

## What the user will see

On `/wealth`, between the existing 3-stat strip and the feature list, a new card titled **"Income Sources"** with:

- **Period toggle** at the top: `Today` · `Week` · `Month` (default: Month)
- **Total income** for the selected period (large, emerald)
- **Source breakdown rows** — one row per income category that has data:
  - Colored icon chip (matches Budget Tracker colors: Salary green, Freelance blue, Business orange, Investment purple, Gift pink, Other gray)
  - Source name + transaction count (e.g. "Salary · 2 entries")
  - Amount + % of period total
  - Thin progress bar showing relative share
- **Today / Week mini-stats** footer: two pills showing today's income and this week's income, regardless of selected toggle — so the user always sees both at a glance
- **"+ Log income"** button → opens Budget Tracker with income tab pre-selected
- **Empty state** (no income this period): subtle dashed card "No income recorded for {period} — Log your first income source"

```text
┌────────────────────────────────────────────┐
│ Income Sources              [Day Wk Month] │
│                                            │
│ RM 8,420  this month                       │
│                                            │
│ 💼 Salary · 1 entry        6,000  71% ▓▓▓  │
│ 💻 Freelance · 3 entries   1,800  21% ▓░   │
│ 🏪 Business · 2 entries      620   8% ▓    │
│                                            │
│  Today  RM 0   │   This Week  RM 1,200     │
│                                            │
│           [ + Log income ]                 │
└────────────────────────────────────────────┘
```

## Technical implementation

### 1. New hook: `src/hooks/useIncomeSources.ts`

React Query hook (key: `['income-sources', user.id]`, staleTime 60s) that:

- Fetches transactions for the **current month** via `api-wealth?resource=transactions&start={monthStart}&end={monthEnd}` (already supported by edge function — no backend changes)
- Filters to `type === 'income'`
- Computes three buckets in a single pass: `today`, `week` (Mon–Sun via `date-fns` with `weekStartsOn: 1`), `month`
- For each bucket returns:
  ```ts
  {
    total: number;
    sources: Array<{ category: string; amount: number; count: number; pct: number }>;
  }
  ```
- Sources sorted by amount desc

### 2. New component: `src/components/wealth/IncomeSourcesCard.tsx`

- Local state `period: 'today' | 'week' | 'month'` (default `'month'`)
- Reads bucket from hook based on `period`
- Reuses `INCOME_CATEGORIES` color/icon map — extracted to a shared constant file `src/lib/wealth-categories.ts` (move both `INCOME_CATEGORIES` and `EXPENSE_CATEGORIES` from `BudgetTracker.tsx` to this shared file; update Budget Tracker to import from there — no behavior change)
- Currency formatting matches existing pattern (`toLocaleString()`, no symbol prefix to stay locale-agnostic, consistent with rest of Wealth)
- "+ Log income" button navigates to `/wealth/budget` with `state: { openAdd: true, type: 'income' }`

### 3. Budget Tracker auto-open dialog

In `src/pages/wealth/BudgetTracker.tsx`, read `useLocation().state` on mount; if `openAdd` is set, call `setDialogOpen(true)` and `setTxType(state.type)`. Tiny addition, no refactor.

### 4. Mount on Wealth hub

In `src/pages/Wealth.tsx`, render `<IncomeSourcesCard />` between the 3-stat strip (line 66) and the feature list (line 69), wrapped in a `mb-4` container.

## Files

**New**
- `src/hooks/useIncomeSources.ts`
- `src/components/wealth/IncomeSourcesCard.tsx`
- `src/lib/wealth-categories.ts` (shared categories)

**Modified**
- `src/pages/Wealth.tsx` — mount the new card
- `src/pages/wealth/BudgetTracker.tsx` — import categories from shared file; honor `location.state.openAdd`

## Out of scope (can follow up)

- Editing/recurring source forecasts
- Source-level deep-link page
- Custom user-defined income sources beyond the 6 presets
