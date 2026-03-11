

## Remove Everything Below "Untuk Kamu" on Dashboard

### What to remove
On `/dashboard`, everything after the `ForYouSection` component will be removed:
1. **WidgetGrid** — the widgets section
2. **DailyQuoteCard** — the daily quote at the bottom
3. **Spacer div** (`<div className="h-4" />`)
4. **WidgetCustomizer** — the sheet/dialog for customizing widgets
5. **FirstTimeDialog** — the first-time user dialog that triggers widget customization

### What stays
`AnnouncementsBanner → HeroPrayerCard → QuickLogGrid → DailyCheckinCard → LifeScore → ForYouSection`

### Files to modify

**`src/pages/Dashboard.tsx`**
- Remove lines 61-63 (`WidgetGrid`, `DailyQuoteCard`, spacer)
- Remove lines 66-81 (`WidgetCustomizer`, `FirstTimeDialog`)
- Remove related state (`customizerOpen`), destructured props (`preferences`, `loading`, `toggleWidget`, `resizeWidget`, `reorderWidgets`, `isFirstTime`, `setIsFirstTime`, `initializeDefaults`)
- Remove unused imports (`WidgetCustomizer`, `WidgetGrid`, `DailyQuoteCard`, `FirstTimeDialog`)

**`src/hooks/useDashboardData.ts`** — optionally clean up `widgetPrefs` from the return if no longer used anywhere else (verify first).

