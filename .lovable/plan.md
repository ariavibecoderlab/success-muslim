

## Polish Landing Page: Remove Header, Cleaner Design

### Changes

**File: `src/pages/Landing.tsx`**

1. **Remove the fixed nav/header entirely** -- delete the `<nav>` block (lines 88-103). The hero will start from the top of the viewport for a full-bleed, immersive feel.

2. **Integrate logo + CTA into the hero** -- add the `smlogo` as a centered element above the headline (small, elegant, ~40px). Move the "Sign In" and "Get Started" buttons inline below the hero subtitle, replacing the nav buttons.

3. **Increase whitespace and breathing room**:
   - Hero: `pt-24 pb-32` instead of `pt-36 pb-28` (no nav offset needed)
   - Reduce visual noise: softer glow (`bg-primary/5` instead of `/8`), smaller blur
   - Tighten section padding slightly for a more rhythmic flow

4. **Clean up section backgrounds** -- remove alternating `bg-secondary/40` and `bg-secondary/30` stripes. Use a single clean `bg-background` with subtle `border-b border-border/40` dividers between sections for a more minimal, Linear-style look.

5. **Refine the highlights strip** -- make it borderless, lighter, just a simple flex row with no background box.

6. **Simplify footer** -- single line: logo + brand left, copyright right. Remove the separate "Built for the Ummah" line (or keep it inline).

### Summary of Visual Effect
- No sticky header -- page feels open and immersive
- Logo centered in hero as a brand mark
- Cleaner section separation (borders not backgrounds)
- More whitespace, less visual clutter
- Sign In / Get Started moved into hero area

### Files Modified
- `src/pages/Landing.tsx`

