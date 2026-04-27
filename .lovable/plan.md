# Income Sources — Advanced Enhancement

Make the Income Sources card feel like a real financial tool: insights, trends, forecasting, and inline quick-add — without making the UI heavier. Everything stays in one tap or one swipe.

## What the user will get

### 1. Header upgrades — sparkline + month-over-month delta

- 7-day **sparkline** above the total (tiny SVG, emerald). Shows daily income momentum at a glance.
- **MoM delta pill** next to the total: "+18% vs last month" (green if up, gray if flat, red if down). Auto-hides if no prior-month data.
- The total animates with a count-up when period switches (subtle, 400ms).

### 2. Smart highlights row — replaces the static "Today / This Week" pills

A 3-stat strip that surfaces **insights**, not just numbers:

| Stat | Shows |
|---|---|
| **Top source** | Icon + name of biggest source this period (e.g. "💼 Salary 71%") |
| **Daily avg** | Average per active day in the selected period |
| **Forecast** | Projected month-end income based on current pace (only on Month period; otherwise shows "Best day" — the highest single-day income) |

All three are tappable filter chips — tapping "Top source" filters the breakdown to just that source; tap again to clear.

### 3. Sources breakdown — richer, still simple

Each source row gains:
- **Trend arrow**: ▲ / ▼ / – vs same-length prior period (last month for Month, last 7d for Week, yesterday for Today). Color-coded, tiny.
- **Last entry**: "Last: 3d ago" in muted text under the source name (replaces the static count, which moves to a tooltip on the count pill).
- **Tap any row → opens a Source Detail Sheet** (bottom sheet) with:
  - Last 6 months mini bar chart for that source
  - Recent 5 entries with date + amount + description
  - Quick "Add to {source}" CTA
  - Long-press / swipe pattern not needed — single tap is enough.

### 4. Inline Quick-Add — one tap to log

Replace the bottom "Log income" button with a **two-mode footer**:

- **Default state**: a horizontal scroll of source chips (`+ Salary`, `+ Freelance`, `+ Business`, …). Tap a chip to inline-expand a compact form **inside the card** with just three fields:
  1. Amount (auto-focused, numeric keypad)
  2. Date (defaults to today, tap to pick)
  3. Note (optional)
  - Save button on the right; X to cancel.
- **Power user**: small "Advanced" link → opens full Budget Tracker dialog (current behavior preserved).

This eliminates the navigate-to-tracker round-trip for 90% of logging actions.

### 5. Privacy / Hide amounts toggle

A tiny eye icon in the header toggles **amount masking** (`••••`) — useful when showing the phone to someone. Persisted to `localStorage`.

### 6. Empty state upgrade

When `hasAnyIncome === false`, show 3 illustrated suggestion cards:
- "Salary — most common"
- "Freelance — gig work"
- "Other — gifts, refunds"

One tap on any opens the inline quick-add prefilled with that source.

## Interaction model

```text
┌─────────────────────────────────────────────────┐
│ ✦ Income Sources    👁  [Day Wk Month]          │
│                                                 │
│   ▁▃▂▅▇▆█  ← 7d sparkline                       │
│   8,420  this month   ▲ +18% vs last month     │
│                                                 │
│ ┌──────────┬──────────┬──────────┐             │
│ │ Top      │ Daily    │ Forecast │             │
│ │ Salary   │ avg 421  │ ~12,300  │             │
│ │ 71%      │          │ end of Apr│            │
│ └──────────┴──────────┴──────────┘             │
│                                                 │
│ 💼 Salary       6,000  71% ▲          ▓▓▓▓▓▓▓ │
│    Last 14d ago · 1 entry                       │
│                                                 │
│ 💻 Freelance    1,800  21% ▲          ▓▓░░░░░ │
│    Last 2d ago · 3 entries                      │
│                                                 │
│ 🏪 Business       620   8% ▼          ▓░░░░░░ │
│    Last 6d ago · 2 entries                      │
│                                                 │
│ Quick add:  [+ Salary] [+ Freelance] [+ ...]   │
│                                  Advanced →     │
└─────────────────────────────────────────────────┘
```

Tap a source row → bottom sheet opens with chart + recent entries.
Tap "+ Freelance" chip → inline form expands in-place; type amount → Save → toast → form collapses, card refreshes.

## Technical implementation

### Hook upgrade — `useIncomeSources.ts`

Expand the query to fetch **a 90-day window** (current month + last 2 months + 30 prior days, single round-trip):

```ts
const start = format(subDays(today, 90), 'yyyy-MM-dd');
const end   = format(endOfMonth(today),  'yyyy-MM-dd');
```

Compute additionally:
- `sparkline7d: number[]` — array of 7 daily totals (Mon..today)
- `prevMonth: { total, sources: Map<cat, amount> }` — for MoM delta and per-source trend arrows
- `prevWeek` / `yesterday` — for Week / Today trends respectively
- `last6MonthsBySource: Record<cat, { month: string; total: number }[]>` — fuels the source detail sheet
- `lastEntryByCategory: Record<cat, string>` — ISO date of most recent entry per source
- `forecast: number` — `monthTotal × (daysInMonth / dayOfMonth)` (linear pace)
- `dailyAvg: number` — `total / activeDays` for the selected period

All derivation stays in the hook (memoized via React Query), so the component stays presentation-only.

### Source Detail Sheet — `src/components/wealth/IncomeSourceDetailSheet.tsx`

- Uses shadcn `Sheet` (side="bottom") so it feels native on mobile.
- Fetches recent 5 entries by reusing the already-loaded transactions (passed in via prop) — no extra round-trip.
- 6-month bar chart via `recharts` `BarChart` (already used in the project).

### Inline Quick-Add — `src/components/wealth/InlineIncomeQuickAdd.tsx`

- Tiny controlled form: amount (number, autofocus), date (defaults today), optional note.
- On submit, calls `api('api-wealth', { method: 'POST', params: { resource: 'transactions' }, body: { type: 'income', category, amount, date, description } })`.
- Invalidates `['income-sources']` and `['wealth-summary']` so the dashboard strip and the card both refresh instantly.
- Keyboard handling: Enter saves, Esc cancels.

### Sparkline — `src/components/wealth/Sparkline.tsx`

Inline lightweight SVG (no recharts) — ~30 lines, renders a smoothed polyline from a `number[]`. Reused later for other modules.

### Amount masking

```ts
const [hideAmounts, setHideAmounts] = useLocalStorage('wealth_hide_amounts', false);
const fmt = (n: number) => hideAmounts ? '••••' : n.toLocaleString();
```

Tiny `useLocalStorage` hook (or extend existing one if present).

### Files

**New**
- `src/components/wealth/IncomeSourceDetailSheet.tsx`
- `src/components/wealth/InlineIncomeQuickAdd.tsx`
- `src/components/wealth/Sparkline.tsx`

**Modified**
- `src/hooks/useIncomeSources.ts` — wider window + new derived fields
- `src/components/wealth/IncomeSourcesCard.tsx` — full redesign per mockup; orchestrates the new pieces

No backend changes — `api-wealth` already supports the wider date range and POST.

## Out of scope (future)

- Recurring income reminders / "expected on the 25th" alerts
- Custom user-defined income sources
- CSV / PDF export of income history
