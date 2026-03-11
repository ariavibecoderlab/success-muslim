

## Fix Bottom Navigation — Fixed to Viewport

**Problem**: BottomNav uses `position: absolute` inside a `relative` parent, so it scrolls away with page content instead of staying fixed at the bottom.

### Changes

**1. `src/components/BottomNav.tsx`**
- Change `absolute` → `fixed` so it sticks to the viewport bottom
- Add `max-w-md mx-auto` to the outer `nav` element itself (so it stays centered and constrained to the app width on desktop)
- Remove `left-0 right-0` and use `left-1/2 -translate-x-1/2 w-full` for proper centering within the max-width constraint

**2. `src/components/AppLayout.tsx`**
- Remove `relative` from the container (no longer needed for absolute positioning)
- Keep `pb-20` on the content wrapper (already correct for spacing behind the nav)

This is a two-line change that fixes the nav across all pages since every app route renders through `AppLayout`.

