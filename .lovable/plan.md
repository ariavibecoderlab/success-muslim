## Goal

The current `/iman/quran` page crams 7 sections into one scroll: backdate prompt, date picker, khatam ring, today's reading counter, current position inputs, 3 stat tiles, khatam progress bar, and a weekly chart. It feels dense and the primary action (logging pages) competes with stats. We'll restructure for a clearer hierarchy and move secondary content to a dedicated stats screen.

## Approach

Split the page into two routes:

1. **`/iman/quran`** — focused on the *primary action*: log today's reading.
2. **`/iman/quran/stats`** — full analytics view (khatam ring, streaks, weekly chart, history heatmap).

This matches the pattern already used elsewhere in the app (e.g. setup/track splits) and keeps the sibling-route arrows in `SubPageLayout` clean.

## New `/iman/quran` layout (top → bottom)

```text
[ Backdate prompt + date picker (only if backdated) ]

┌────────────── Hero log card ──────────────┐
│  Today / 21 Feb                           │
│            ┌─────┐                        │
│   −        │  3  │       +                │
│            └─────┘                        │
│        pages read today                   │
│  [ +1 ]  [ +5 ]  [ +10 ]  [ +1 Juz ]      │
└───────────────────────────────────────────┘

┌────────── Reading position ──────────────┐
│  Surah  [Al-Baqarah        ]              │
│  Juz    [ 2 ]    Page  [ 23 ]             │
└───────────────────────────────────────────┘

┌── Compact summary strip (tappable → stats)┐
│  🔥 12d   📖 247 pages   🏆 0 khatam   ›  │
└───────────────────────────────────────────┘

[ Continue Reading → /iman/quran/reader ]   (existing CTA, kept)
```

Changes from current:
- Hero counter becomes the visual anchor (larger number, clearer label).
- Quick-add buttons relabeled `+1 / +5 / +10 / +1 Juz` (drop `+2`, add `+1` for finer control).
- "Current Position" merged into one card; add optional Page input alongside Surah/Juz.
- Khatam ring, khatam progress bar, 3 stat tiles, and weekly chart **removed from this page**.
- Replaced by a single tappable summary strip (streak · total pages · khatam count) that links to the new stats page.
- Date picker only renders when the user has tapped backdate (reduces visual noise on default view).

## New `/iman/quran/stats` page

A dedicated `SubPageLayout` titled "Quran Stats" with back to `/iman/quran`:

```text
[ Khatam progress ring (large, centered) ]
[ Khatam progress bar + % + ETA ]

[ Stat tiles: streak · total pages · est. days · khatam count ]

[ Last 7 days bar chart ]
[ Reading heatmap (reuse src/components/quran/ReadingHeatmap.tsx) ]
```

The existing `ReadingHeatmap` component is already in the codebase but not used on the tracker — we surface it here.

## Files to change

- `src/pages/QuranTracker.tsx` — slim down to log-focused layout.
- `src/pages/QuranStats.tsx` — **new**, holds the analytics moved out of the tracker.
- `src/App.tsx` — register the `/iman/quran/stats` route.
- `SubPageLayout` `headerRight` on `/iman/quran` — add a small chart icon button → `/iman/quran/stats` (alternative entry point alongside the summary strip).

No backend, no hook, no storage changes — this is purely a presentation refactor over the existing `useQuranStorageQuery` data.

## Out of scope

- No changes to logging logic, khatam math, or data sync.
- No redesign of the Quran reader (`/iman/quran/reader`).
- Heatmap component itself is reused as-is.
