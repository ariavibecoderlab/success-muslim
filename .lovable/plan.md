

## Dashboard Polish — Header Integration, LifeScore Compact, Remove Greeting

### Changes

**1. Remove `GreetingHeader` from Dashboard**
- Remove the `GreetingHeader` component from `Dashboard.tsx` entirely (the "Assalamualaikum" greeting and "Your spiritual dashboard" subtitle)
- The customize button (Settings2) moves to AppHeader's `rightContent` — but user wants notification icon there instead

**2. `AppHeader.tsx` — Seamless header + notification bell**
- Remove `border-b` and `shadow-sm` so the header blends into the page (no visible separator)
- Replace the right-side area: add a `Bell` icon button (from lucide-react) instead of the settings gear
- Keep admin shield for admin users
- Make background more transparent: `bg-background/80` or fully transparent on dashboard

**3. `LifeScoreCard.tsx` — Compact with green background**
- Use a stronger green gradient: `from-emerald-500 to-teal-600` with white text
- Remove the large TrendingUp icon box (save space)
- Make padding smaller: `p-3` instead of `p-5`
- Reduce score font size: `text-2xl` instead of `text-3xl`
- Remove the 7-day trend chart to save vertical space (keep pillars only)
- Progress bars use white/white-alpha colors to match green card
- Compact pillar rows with tighter spacing

**4. `Dashboard.tsx` — Wire up changes**
- Remove `GreetingHeader` import and usage
- Pass notification bell via `rightContent` to `AppHeader`
- Remove `onCustomize` prop dependency from greeting (move customize trigger elsewhere or keep in widget section)

### Files to modify
1. **`src/components/AppHeader.tsx`** — remove border/shadow, add Bell icon on right
2. **`src/components/dashboard/LifeScoreCard.tsx`** — compact green card, smaller padding, remove trend chart
3. **`src/pages/Dashboard.tsx`** — remove GreetingHeader, pass rightContent to AppHeader

