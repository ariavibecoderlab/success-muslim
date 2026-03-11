

## Make HeroPrayerCard More Compact

The card currently has large `text-3xl` typography, generous padding (`p-5`), and spacious margins between elements. Here's the plan to tighten it:

### Changes to `src/components/dashboard/HeroPrayerCard.tsx`:

1. **Reduce padding**: `p-5` → `p-4`
2. **Shrink prayer name/time**: `text-3xl` → `text-2xl`, reduce bottom margin `mb-3` → `mb-2`
3. **Shrink label**: `mb-3` → `mb-1.5`
4. **Tighten countdown**: `mb-4` → `mb-2.5`
5. **Shrink buttons margin**: `mt-4` → `mt-3`, button height `h-9` → `h-8`
6. **Shrink decorative moon**: `w-24 h-24` → `w-20 h-20`
7. **Completion state**: Reduce star icon `h-10 w-10` → `h-8 w-8`, `mb-3` → `mb-2`, prayer circles `w-9 h-9` → `w-7 h-7`

All changes in one file — purely spacing/sizing tweaks, no structural changes.

