

## Polish Remaining Dashboard Components

The new design pattern established so far: seamless header (no border), compact green LifeScore card, horizontal scrollable Quick Log with bare gradient circles, small pencil edit button. Now we align the remaining components.

### 1. `AnnouncementsBanner.tsx` — Lighter, borderless

- Remove left border accent (`border-l-4 border-l-amber-400`) — use a subtle rounded card with `bg-amber-50 dark:bg-amber-950/20` instead
- Reduce padding to `p-2.5`, smaller icon (`h-3.5 w-3.5`)
- Remove `Card`/`CardContent` wrapper — use a plain `div` with rounded corners and background

### 2. `DailyQuoteCard.tsx` — Simpler, no card wrapper

- Remove `Card`/`CardContent` — use a plain `div` with `rounded-xl bg-muted/50` for a flatter look
- Reduce padding from `p-5` to `p-3`
- Remove the Heart icon box — use just an inline quote mark or smaller decorative element
- Shrink dot indicators slightly
- Keep tap-to-rotate and animation

### 3. `WidgetGrid.tsx` — Add section header

- Add a "Widgets" section header matching the Quick Log style (`text-xs font-semibold uppercase tracking-wider text-muted-foreground`)
- Keep grid layout as-is (already clean)

### 4. Widget cards (all widgets) — Tighter padding, remove emoji prefixes

- Across all widget components: remove emoji prefixes from titles (e.g. "💧 Hydration" → "Hydration", "✅ Tasks Today" → "Tasks Today", "😴 Sleep" → "Sleep", "📢 Da'wah Today" → "Da'wah Today", "💰 Sadaqah" → "Sadaqah", "🌙 Tarawih" → "Tarawih")
- Reduce `CardContent` padding from `p-4` to `p-3` for consistency
- Add `border-0 shadow-sm` to widget cards for a flatter, cleaner look

### 5. `Dashboard.tsx` — Tighten spacing

- Reduce `space-y-5` to `space-y-4` for tighter vertical rhythm
- Reduce top padding from `py-6` to `py-4`

### Files to modify
1. `src/components/dashboard/AnnouncementsBanner.tsx`
2. `src/components/dashboard/DailyQuoteCard.tsx`
3. `src/components/dashboard/WidgetGrid.tsx`
4. `src/pages/Dashboard.tsx`
5. `src/components/widgets/HydrationWidget.tsx` — remove emoji
6. `src/components/widgets/TasksTodayWidget.tsx` — remove emoji
7. `src/components/widgets/SleepWidget.tsx` — remove emoji
8. `src/components/widgets/DakwahWidget.tsx` — remove emoji
9. `src/components/widgets/SadaqahWidget.tsx` — remove emoji
10. `src/components/widgets/TarawihWidget.tsx` — remove emoji
11. `src/components/widgets/DhikrSelawatWidget.tsx` — tighten padding
12. `src/components/widgets/NextPrayerWidget.tsx` — tighten padding
13. `src/components/widgets/QuranTodayWidget.tsx` — tighten padding
14. `src/components/widgets/SolatSunatWidget.tsx` — tighten padding
15. `src/components/widgets/StepsWidget.tsx` — tighten padding

