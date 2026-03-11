

## Polish Dashboard Cards — Aligned Design & Best Practices

Three files to update, all sizing/spacing tweaks plus minor code quality improvements.

### 1. `src/components/dashboard/HeroPrayerCard.tsx` — Add bottom margin

The HeroPrayerCard currently has no outer margin, relying on the parent `space-y-5` gap. To ensure consistent spacing even outside the dashboard context, wrap in a container or simply ensure the card fits. Actually, since the parent `Dashboard.tsx` already uses `space-y-5`, no explicit margin is needed on the card itself — the spacing is handled. However, looking at the other cards (RamadanBanner, DailyCheckin), they all follow the same pattern with no outer margin. The request likely means internal spacing consistency.

**No changes needed for margin** — `space-y-5` in Dashboard.tsx handles inter-card gaps uniformly.

### 2. `src/components/dashboard/DailyCheckinCard.tsx` — Polish

- **Match card style**: Currently uses `shadow-sm`, while HeroPrayerCard and LifeScore use `shadow-lg`. Keep `shadow-sm` since this is a neutral-background card (not gradient) — consistent with widget style.
- **Tighten header**: `mb-3` → `mb-2` to match other cards' compact feel.
- **Shrink title**: `text-base` → `text-sm` to align with other card headers.
- **Shrink icon**: `h-4 w-4` → `h-3.5 w-3.5` to match other cards' icon sizes.
- **Shrink dots**: `w-8 h-8` → `w-7 h-7` and gap `gap-2` → `gap-1.5` so 7 dots fit comfortably on 390px width.
- **Button height**: Already `h-8` — good, matches HeroPrayerCard buttons.
- **Add `disabled` state feedback**: Button already has `disabled={claiming}` — add loading text.

### 3. `src/components/dashboard/LifeScoreCard.tsx` — Polish & align

- **Match gradient**: Currently `from-emerald-500 to-teal-600` — update to `from-emerald-700 to-teal-800` to match HeroPrayerCard's darker green.
- **Reduce padding**: `p-5` → `p-4` to match other cards.
- **Shrink score**: `text-3xl` → `text-2xl` to match HeroPrayerCard typography.
- **Tighten header margin**: `mb-3` → `mb-2`.
- **Pillar spacing**: `space-y-2` → `space-y-1.5` for tighter layout.
- **Remove unused `weeklyScores` prop** — it's passed but never used in the component (dead code).

### Summary of changes

| File | What |
|------|------|
| `HeroPrayerCard.tsx` | No changes needed — already compact and well-spaced |
| `DailyCheckinCard.tsx` | Tighter spacing, smaller dots/icons/title, loading state on button |
| `LifeScoreCard.tsx` | Darker gradient, reduced padding/typography, remove unused prop |

All logic remains untouched — only visual alignment and dead code removal.

