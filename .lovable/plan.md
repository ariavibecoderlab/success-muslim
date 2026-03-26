

## Polish Landing Page — Image-Heavy, Interactive, No Icons

Rewrite `src/pages/Landing.tsx` to remove all Lucide icons and replace them with existing app screenshot images, animated interactions, and richer visual storytelling.

### Changes to `src/pages/Landing.tsx`

**1. Hero — Keep text-focused but add floating phone mockup**
- Remove ArrowRight icon from CTA buttons (text-only buttons)
- Add a subtle CSS phone frame with `imgLifescore` screenshot floating/parallax on scroll using framer-motion `useScroll` + `useTransform`
- Keep the gradient glow background but make it emerald-toned

**2. Stats Bar — Replace icon boxes with pure text**
- Remove the `highlights` icon array entirely
- Show "5 Pillars · 90+ Features · Free Forever" as a single animated text line, no icon containers

**3. Life Score Section — Make interactive**
- Keep the AnimatedRing but add **interactive sliders** — user can drag Iman/Wellness/Productivity sub-scores and watch the ring animate in real-time
- Use `useState` for the 3 sub-scores, compute overall as weighted average, animate the ring accordingly
- This is the key "interactive" element — visitors can play with it before signing up

**4. Pillars Section — Replace icons with app screenshots**
- Remove all Lucide icon imports (`BookOpen`, `Heart`, `Wallet`, `ListChecks`, etc.)
- Use existing images: `imgIman` for Iman, `imgHealth` for Wellness, `imgIfasting` for Wealth (closest available), `imgLifescore` for Productivity
- Show each pillar as a card with the screenshot as background/hero image, title + description overlaid at bottom with a dark gradient overlay
- Cards have hover scale + parallax tilt effect via framer-motion

**5. How It Works — Animated counter steps**
- Remove the numbered circle icons
- Replace with 3 large animated counters that count up when in view (e.g., "5→" prayers, "72→" life score, "30→" day streak)
- Each step card has a mini screenshot thumbnail from the app

**6. Who It's For (Personas) — Horizontal scroll carousel with images**
- Remove icon boxes
- Each persona card gets a full-bleed screenshot image at top (reuse `imgIman`, `imgHealth`, `imgLifescore`)
- Horizontal snap-scroll on mobile for swipeable interaction

**7. Bottom CTA — Clean up**
- Remove ArrowRight icon from button
- Add a subtle emerald gradient glow animation behind the quote

### Imports to Remove
- All Lucide icons: `ArrowRight`, `Heart`, `Wallet`, `ListChecks`, `BookOpen`, `Star`, `Zap`, `Users`

### Imports to Add
- App screenshots: `imgLifescore`, `imgIman`, `imgHealth`, `imgIfasting`, `imgIfTimerRunning` from `@/assets/features/`
- `useState` for interactive Life Score
- `useScroll`, `useTransform` from framer-motion for parallax

### File
- **Modify**: `src/pages/Landing.tsx`

