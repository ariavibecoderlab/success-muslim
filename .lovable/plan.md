

## Make RamadanBanner More Compact

### Changes to `src/components/dashboard/RamadanBanner.tsx`:

1. **Reduce padding**: `p-5` → `p-4`
2. **Shrink decorative crescent**: `w-24 h-24` → `w-20 h-20`
3. **Tighten header margin**: `mb-3` → `mb-2`
4. **Shrink streak badge padding**: `px-3 py-1` → `px-2 py-0.5`
5. **Shrink special title**: `text-base` → `text-sm`, `mb-2` → `mb-1.5`
6. **Tighten subtitle margin**: `mb-4` → `mb-2.5`
7. **Shrink header text**: `text-sm` → `text-xs`
8. **Shrink icons**: Moon `h-4 w-4` → `h-3.5 w-3.5`, Star same

No structural or logic changes — purely spacing/sizing tweaks in one file. The iftar countdown and all conditional logic remain intact.

