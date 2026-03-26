

## Polish SubPageLayout Bottom Bar

### Current Issues
- Plain buttons with no visual cohesion — prev/next feel disconnected from the Back button
- Hidden prev/next use `text-transparent` hack (still takes space, feels janky)
- No press feedback or animations
- Back button is a generic pill — doesn't feel premium
- No visual hierarchy between navigation actions

### Design

**Unified segmented bar** — a single rounded container holding all three actions with subtle dividers, similar to the polished BackdateDatePicker pattern.

**Changes to `src/components/SubPageLayout.tsx`**:

1. **Segmented control** — Wrap prev + back + next in a single `rounded-full bg-secondary/50` container with inner dividers, centered in the bar. When no siblings exist, just show the Back button alone.

2. **Active press effects** — Add `active:scale-[0.97]` on buttons for tactile feedback per the app's design system.

3. **Framer-motion transitions** — Import `motion` for subtle hover/tap animations on the navigation buttons. Add `whileTap={{ scale: 0.95 }}` for springy feel.

4. **Smart labels on prev/next** — Show sibling count context (e.g., "2 of 7") as a tiny centered indicator between back and the label.

5. **Better disabled state** — Instead of `text-transparent`, use `opacity-0 pointer-events-none` so the layout doesn't shift but the hack is cleaner.

6. **Back button refinement** — Use the app's primary subtle style: slightly bolder with a soft shadow, matching the premium card aesthetic.

### Single file change
- `src/components/SubPageLayout.tsx`

