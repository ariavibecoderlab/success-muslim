

## Audit: `/iman` (Deen.tsx) Layout & PrayerTimes.tsx

### Deen.tsx — Layout Audit

The /iman page currently has **7 vertical sections** which creates excessive scroll depth. Here's the audit:

| Section | Verdict | Rationale |
|---------|---------|-----------|
| Prayer Hero Card | **Keep** — but duplicates PrayerTimes subpage hero. Simplify to a compact strip, not a full card |
| Date + Location | **Keep** — contextual, lightweight |
| Iman Quote Banner | **Remove** — low utility, takes prime real estate. Quotes belong in Dashboard's DailyQuoteCard |
| Stats Rings (4x) | **Keep** — core value, shows daily spiritual progress at a glance |
| Spiritual Tools Grid (11 cards) | **Keep but compact** — remove Card wrapper, make it a dense list/grid |
| Active Trackers (Qada/Ramadhan/Fidyah) | **Move to subpages** — these are niche long-term trackers, not daily glance items. They clutter the hub for most users. Keep only a single "Active Trackers" link row if any are active |
| Setup Actions (3-col grid) | **Merge** — fold into Spiritual Tools as regular items with setup badge |

### PrayerTimes.tsx — Audit

| Section | Verdict | Rationale |
|---------|---------|-----------|
| Notification banner | **Keep** — important one-time prompt |
| Location + Settings row | **Keep** — essential controls |
| Hero card (orange) | **Keep** — good, matches design system |
| Mosque toggle + inputs | **Keep** — but should be inside the Settings dialog, not on the main page. Clutters the prayer list view |
| Prayer list (5 cards) | **Keep** — core content |
| Source note | **Keep** — trust signal |

---

### Plan

#### `src/pages/Deen.tsx` — Declutter & Compact

1. **Remove Quote Banner** (lines 319-346) — not essential for spiritual command center hub

2. **Compact Spiritual Tools** — replace `<Card>` wrapper with a flat row layout:
   ```text
   [icon] Title          subtitle →
   ```
   No card border/shadow. Just a simple `flex items-center gap-3 py-2.5` row with a subtle `border-b border-border/30` separator. This halves the visual weight.

3. **Merge Setup Actions into Spiritual Tools** — add Qada Solat, Ramadhan Qada, Fidyah as regular tool rows (with a small badge like "3 remaining" or "Setup" if not configured). Remove the separate "Get Started" / "More Trackers" section entirely.

4. **Collapse Active Trackers** — remove the expanded tracker cards (lines 443-527). The progress info is now shown as subtitle text in the merged tool rows (e.g., "Qada Solat — 245 remaining · 12% done").

5. **Remove Iman Score card from grid** — move it into the Stats Rings row as a 5th element or a small bar below the rings. It's metadata about the rings, not a "tool."

6. **Prayer Hero Card** — keep but update gradient from emerald to orange (`from-orange-600 to-orange-700`) per approved plan. Also replace `text-primary` with `text-orange-600` for date section and quote dots (already planned).

7. **Color fixes** — apply the previously approved orange color updates (stats rings, labels, progress bars).

#### `src/pages/deen/PrayerTimes.tsx` — Move Mosque Settings

1. **Move Mosque Toggle + Time Inputs** (lines 410-445) into the existing Settings Dialog under a new "Mosque" tab (making it 4 tabs: Location, Method, Adhan, Mosque). This declutters the main prayer list view.

2. **Add Salah Log link** — add a subtle "Log Salah" button/link below the prayer list to connect to `/iman/salah-log`, since users viewing prayer times likely want to log.

### Files Modified
- `src/pages/Deen.tsx` — Remove quote banner, compact spiritual tools (no cards), merge trackers into tools list, move Iman Score to stats area, apply orange colors
- `src/pages/deen/PrayerTimes.tsx` — Move mosque toggle/inputs into Settings dialog as 4th tab, add Salah Log link

