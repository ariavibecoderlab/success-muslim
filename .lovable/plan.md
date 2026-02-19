

# Landing Page Premium Revamp

## Vision
Strip the page down to its essence. No fake stats, no testimonials, no feature overload. Instead: a cinematic hero, a singular product showcase (Life Score), a tight value proposition section, and a closing CTA. Think Linear's clarity meets Headspace's warmth.

## What Gets Removed
- Testimonials section (fake social proof)
- Stats section (fake counters from `app_stats`)
- Feature Highlights section (6-card grid -- redundant with pillars)
- `app_stats` DB query and `stats` state
- Geometric cross pattern overlay (dated)
- Excessive icon imports no longer needed

## What Stays (Refined)
- Nav (simplified, more breathing room)
- Hero (tighter copy, bigger presence, subtle gradient glow)
- Life Score preview (the hero product shot -- elevated visually)
- Pillars (reduced from 5 cards to a clean bento-style grid)
- How It Works (kept but elevated with a horizontal timeline feel)
- Bottom CTA (hadith quote -- refined typography)
- Footer (minimal, clean)

## New Design Language

### Hero Section
- Remove the badge pill ("The All-in-One Life System...") -- too generic
- Headline: larger, tighter leading, with a subtle animated gradient on the accent line
- Subheadline: one crisp sentence, not a tagline dump
- Single CTA button with soft glow shadow
- Below CTA: "Free forever. No credit card." trust line
- Subtle radial gradient glow behind the hero area (CSS only, no SVG pattern)

### Life Score Section
- Rename to "One score. Whole life."
- Card gets a subtle floating shadow + slight scale on hover
- Add a soft animated ring stroke on scroll (the circle progressively fills)
- Clean white card on a soft warm background

### Pillars Section (Bento Grid)
- Reduce from 5 separate cards to a 2x2 + 1 bento layout
- Each cell: icon + title + one-line description (no paragraph)
- Trim descriptions to max 8 words each
- Subtle border, no heavy gradients

### How It Works
- Keep the 3 steps but render as a horizontal connected timeline on desktop
- Each step: number in a circle + title + one-line desc
- Connected by a thin line between circles
- On mobile: vertical with connecting line

### Bottom CTA
- Keep the hadith quote -- it's authentic and powerful
- Larger typography, more vertical padding
- Simplify: remove the Shield icon, let the words speak

### Footer
- Minimal: brand + copyright on one line
- Remove Privacy/Terms/Contact links (they go nowhere)

## Technical Details

### Files Modified
- `src/pages/Landing.tsx` -- full rewrite of the component
- `PROGRESS.md` -- update with landing page revamp status

### Implementation Notes
- Remove `useState` for stats and the `useEffect` that fetches `app_stats`
- Remove unused imports: `Star`, `Calculator`, `Sparkles`, `Target`, `TrendingUp`, `ChevronRight`, `Zap`, `Shield`, `Download`, `Card`, `CardContent`
- Keep: `motion` from framer-motion for scroll animations
- Keep: `EditableText` for CMS editability
- Keep: `useAuth` + redirect logic for authenticated users
- Add a CSS radial gradient glow behind the hero (pure Tailwind, no external assets)
- Life Score ring animation: use framer-motion `useInView` + animated `strokeDasharray`
- Bento grid: CSS grid with `grid-template-areas` for the asymmetric layout
- Timeline connector: simple `div` with `h-px bg-border` between steps on desktop
- Total page length target: ~200 lines (down from 348)

### Section Order (Final)
1. Nav (fixed, glassmorphism)
2. Hero (headline + subheadline + CTA + trust line)
3. Life Score showcase ("One score. Whole life.")
4. Pillars bento grid (4 pillars -- merge Family into Productivity since Family module is not built yet)
5. How It Works (3-step horizontal timeline)
6. Bottom CTA (hadith quote + button)
7. Footer (one-line minimal)

