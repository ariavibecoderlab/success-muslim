

## Polish Dashboard: Colorful, Simple, Elegant

### Vision
Add distinct, vibrant colors to each dashboard section while keeping the clean "Human & Compact" aesthetic. The goal is visual variety through soft color accents -- not loud gradients or heavy backgrounds.

### Changes

#### 1. QuickLogGrid -- Unique Colors Per Icon
Currently most icons share `bg-primary/10 text-primary` or `bg-secondary`. Give each a distinct pastel color:

| Item | Color |
|------|-------|
| Prayer | `bg-emerald-500/10 text-emerald-600` |
| Quran | `bg-sky-500/10 text-sky-600` |
| Dhikr | `bg-violet-500/10 text-violet-600` |
| Fast | `bg-amber-500/10 text-amber-600` |
| Water | `bg-blue-500/10 text-blue-600` (keep) |
| Sleep | `bg-indigo-500/10 text-indigo-600` |
| Tasks | `bg-rose-500/10 text-rose-600` |
| Habits | `bg-teal-500/10 text-teal-600` |

#### 2. LifeScoreCard -- Subtle Gradient Background
Replace the flat `bg-primary/5` with a soft gradient: `bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-100`. Score number gets a warm color based on value (already has `getScoreColor`). Add a thin left accent border for elegance.

#### 3. DailyQuoteCard -- Warm Accent
Change from `bg-primary/5` to a warm `bg-gradient-to-r from-amber-50 to-orange-50/50 border-amber-100`. Heart icon uses `text-rose-500` with `bg-rose-50`. This differentiates it from the Life Score card.

#### 4. AnnouncementsBanner -- Softer Styling
Keep `bg-accent/10` but add a left border accent: `border-l-4 border-l-amber-400` for visual emphasis without being loud.

#### 5. GreetingHeader -- Subtle Color Touch
Add a soft text gradient on the greeting name or a small colored dot/bar accent. Keep it minimal -- just make `Assalamualaikum` text slightly colored with `text-emerald-700` on the name portion.

### Files Modified (5)

| File | Change |
|------|--------|
| `src/components/dashboard/QuickLogGrid.tsx` | Update QUICK_LOGS color array |
| `src/components/dashboard/LifeScoreCard.tsx` | Gradient background + left accent border |
| `src/components/dashboard/DailyQuoteCard.tsx` | Warm gradient + rose heart icon |
| `src/components/dashboard/AnnouncementsBanner.tsx` | Left border accent |
| `src/components/dashboard/GreetingHeader.tsx` | Colored name text |

### Technical Notes
- All colors use Tailwind's built-in palette (no CSS variable changes needed)
- No new dependencies
- Purely visual -- no behavioral changes
- Maintains the "Refined Islamic Calm" aesthetic with just enough color variety to feel alive

