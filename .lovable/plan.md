

## Refactor Dashboard.tsx into Best-Practice Components

### Problem
`Dashboard.tsx` is a 387-line monolith mixing data fetching, score calculation, UI rendering, and modal state. This makes it hard to maintain, test, and extend.

### Approach
Extract into focused, single-responsibility components and a custom hook. The page file becomes a thin orchestrator (~60 lines).

### New Files

**1. `src/hooks/useDashboardData.ts`** -- Custom hook consolidating ALL data fetching and Life Score computation.
- Moves the 12+ React Query hooks, `useEffect` for profile/announcements, `lifeScoreInput` memo, `lifeScore` calculation, and `weeklyScores` into one place.
- Converts the raw `useEffect` profile/announcements fetch into proper `useQuery` calls (best practice -- no manual `useState` + `useEffect` for data fetching).
- Returns: `{ displayName, announcements, lifeScore, weeklyScores, widgetPrefs, customizerActions }`.

**2. `src/components/dashboard/AnnouncementsBanner.tsx`** -- Renders announcement cards.
- Props: `announcements: { id, title, content }[]`
- Wrapped in `motion.div` with fadeUp animation.

**3. `src/components/dashboard/GreetingHeader.tsx`** -- Greeting text + customize button.
- Props: `displayName: string`, `onCustomize: () => void`

**4. `src/components/dashboard/LifeScoreCard.tsx`** -- The Life Score card with pillar progress bars and 7-day trend chart.
- Props: `lifeScore: LifeScore`, `weeklyScores: DailyScoreEntry[]`
- Contains the Recharts `BarChart` and `Progress` bars.

**5. `src/components/dashboard/QuickLogGrid.tsx`** -- The 4x2 grid of quick-log shortcut buttons.
- Self-contained with the `QUICK_LOGS` constant and Link rendering.

**6. `src/components/dashboard/DailyQuoteCard.tsx`** -- Inspirational quote card.
- Self-contained with the `QUOTES` constant and date-based selection.

**7. `src/components/dashboard/WidgetGrid.tsx`** -- Dynamic widget rendering logic.
- Props: `preferences`, `isRamadan`, `activeIF`
- Contains the smart visibility filter and maps over `WIDGET_REGISTRY`.

**8. `src/components/dashboard/FirstTimeDialog.tsx`** -- First-time customization dialog.
- Props: `open`, `onClose`, `onCustomize`, `onInitialize`

### Modified Files

**`src/pages/Dashboard.tsx`** -- Becomes a slim ~50-line orchestrator:
```
const Dashboard = () => {
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const { displayName, announcements, lifeScore, weeklyScores, widgetPrefs } = useDashboardData();

  return (
    <div>
      <AppHeader />
      <main>
        <AnnouncementsBanner announcements={announcements} />
        <GreetingHeader displayName={displayName} onCustomize={() => setCustomizerOpen(true)} />
        <LifeScoreCard lifeScore={lifeScore} weeklyScores={weeklyScores} />
        <QuickLogGrid />
        <WidgetGrid ... />
        <DailyQuoteCard />
      </main>
      <WidgetCustomizer ... />
      <FirstTimeDialog ... />
    </div>
  );
};
```

### Key Best-Practice Improvements

| Before | After |
|--------|-------|
| Raw `useEffect` + `useState` for profile/announcements | Proper `useQuery` with caching and refetch |
| 12 hooks + 3 memos inline in page | Single `useDashboardData()` hook |
| `QUOTES` and `QUICK_LOGS` constants in page file | Co-located with their rendering components |
| `fadeUp` animation variant duplicated | Shared constant in a `dashboard/constants.ts` or co-located |
| 387 lines in one file | ~50-line page + 7 focused components (~40-80 lines each) |

### Technical Details

- **No behavioral changes** -- purely structural refactor, identical UI output.
- Animation indices (`custom` prop on `motion.div`) preserved exactly.
- All existing imports (EditableText, OnboardingTooltips, etc.) move to their respective sub-components.
- The `constants.ts` file exports the shared `fadeUp` variant used by multiple dashboard components.

### File Summary

| Action | File |
|--------|------|
| Create | `src/hooks/useDashboardData.ts` |
| Create | `src/components/dashboard/constants.ts` |
| Create | `src/components/dashboard/AnnouncementsBanner.tsx` |
| Create | `src/components/dashboard/GreetingHeader.tsx` |
| Create | `src/components/dashboard/LifeScoreCard.tsx` |
| Create | `src/components/dashboard/QuickLogGrid.tsx` |
| Create | `src/components/dashboard/DailyQuoteCard.tsx` |
| Create | `src/components/dashboard/WidgetGrid.tsx` |
| Create | `src/components/dashboard/FirstTimeDialog.tsx` |
| Modify | `src/pages/Dashboard.tsx` (reduce to ~50 lines) |

