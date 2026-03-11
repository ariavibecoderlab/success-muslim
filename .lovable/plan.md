

## Polish "For You" Section — Visual Upgrade

### Changes to `src/components/dashboard/ForYouSection.tsx`

**1. Section header**: Change "Untuk Kamu" → "For You"

**2. Card visual redesign** — make each card feel premium and tappable:
- Increase icon container to `w-10 h-10` with `rounded-xl` and add a subtle inner shadow/ring
- Add a faint colored ring/border to the icon container (e.g. `ring-1 ring-emerald-200/50`) for depth
- Bump title to `text-[13px]` and subtitle to `text-xs` for slightly better readability
- Add `active:scale-[0.98]` and `transition-all duration-200` for a tactile press effect
- Use `shadow-sm hover:shadow-md` with `rounded-xl` on cards for softer corners
- Add a subtle right-side accent: style the ChevronRight with a small pill background (`w-6 h-6 rounded-full bg-black/5`) to make the action hint more visible
- Remove `truncate` on title — allow 2 lines with `line-clamp-2` so contextual messages aren't cut off
- Add `backdrop-blur-sm` for a frosted glass feel on the gradient cards

**3. Keep all existing logic untouched** — only the render/styling changes.

### Files modified
- `src/components/dashboard/ForYouSection.tsx` — header text + card styling only

