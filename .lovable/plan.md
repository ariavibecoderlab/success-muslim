

## Revamp Landing Page + Create Features & About Pages

Inspired by the Muslim Pro reference, this plan creates a professional marketing site with a proper navigation header, dedicated feature pages, and an About page -- all aligned with Success Muslim's brand identity (green primary, smlogo, Islamic calm aesthetic).

### Overview of Changes

1. **Shared marketing layout component** with sticky top nav and footer
2. **Redesigned Landing page** (`/`) -- Muslim Pro-inspired with nav header, hero with phone mockup illustration, feature showcase sections
3. **New Features page** (`/features`) -- detailed breakdown of all core features across Iman, Health, Wealth, Productivity, and Family
4. **New About page** (`/about`) -- mission, vision, and story of Success Muslim
5. **Route registration** in `App.tsx`

---

### New Files

#### 1. `src/components/MarketingLayout.tsx`
Shared wrapper for all public marketing pages with:
- **Sticky top nav**: Logo (smlogo) + brand name on left, nav links (Features, About) in center, CTA buttons (Sign In, Get Started) on right
- **Mobile**: Hamburger menu for nav links
- **Footer**: Logo, nav links, copyright, "Built for the Ummah" tagline
- Uses the same green primary color scheme

#### 2. `src/pages/Features.tsx`
Dedicated features page showcasing all 5 pillars in detail:
- Hero banner: "Everything You Need to Grow"
- **Iman section**: Prayer tracking, Quran reader, Dhikr counter, Zakat calculator, Fasting log, Sadaqah tracker
- **Health section**: BMI tracker, Hydration, Sleep, Steps, IF Timer, Weight tracking
- **Wealth section**: Halal budgeting, Savings goals, Zakat calculator
- **Productivity section**: Daily MITs, Habit streaks, Life areas
- **Family section**: Family dashboard, Leaderboard, Activity feed
- Each section: icon, title, description, feature list with small icons
- Alternating layout (text-left/image-right, then flip) similar to Muslim Pro style
- Bottom CTA: "Start Your Journey"

#### 3. `src/pages/About.tsx`
About page with:
- Hero: "Your Islamic App Companion" headline with descriptive paragraphs about the mission
- **Our Mission**: Help Muslims optimize their life for both worlds through consistent daily tracking
- **Our Vision**: The most comprehensive Muslim lifestyle platform
- **Core Values**: Consistency, Privacy, Holistic Growth, Community
- Islamic quote section with hadith
- Bottom CTA to sign up

### Modified Files

#### 4. `src/pages/Landing.tsx` (redesigned)
- Add `MarketingLayout` wrapper (nav + footer)
- **Hero section**: Keep the current clean hero but add the nav header from MarketingLayout
- Keep existing sections (Life Score, Pillars, How It Works, Personas, CTA) but wrap in MarketingLayout
- Remove the inline footer (now in MarketingLayout)
- Add a new "Explore Our Features" link/button pointing to `/features`

#### 5. `src/App.tsx`
- Import and register new routes:
  - `/features` -> `Features`
  - `/about` -> `About`
- Both are public routes (no AuthGuard)

---

### Technical Details

**MarketingLayout component structure:**
```text
+--------------------------------------------------+
|  [logo] Success Muslim   Features  About  | Sign In  Get Started |
+--------------------------------------------------+
|                                                    |
|              {children} (page content)             |
|                                                    |
+--------------------------------------------------+
|  [logo] Success Muslim  |  Features  About  |  (c) 2026  |
+--------------------------------------------------+
```

**Nav behavior:**
- Desktop: horizontal links + CTA buttons
- Mobile: hamburger icon opens a slide-down menu
- Sticky with `bg-background/80 backdrop-blur-lg` glassmorphism
- Active link highlighted with primary color

**Design tokens used:**
- Primary green: `hsl(120, 61%, 24%)` -- already defined
- All sections use `bg-background` with `border-b border-border/40` dividers (consistent with current landing)
- Cards use `bg-card rounded-2xl border border-border`
- Motion animations reuse the existing `fade` variant pattern

**Features page layout pattern:**
Each feature section alternates between:
- Left: Icon grid / feature list
- Right: Section description
This mirrors the Muslim Pro reference screenshot's two-column layout

**About page structure:**
- Full-width hero with centered text
- Two-column "Our Values" grid
- Hadith quote banner (reuses the primary bg CTA pattern)

### Files Summary
| File | Action |
|------|--------|
| `src/components/MarketingLayout.tsx` | Create |
| `src/pages/Features.tsx` | Create |
| `src/pages/About.tsx` | Create |
| `src/pages/Landing.tsx` | Modify (wrap in MarketingLayout, remove inline footer) |
| `src/App.tsx` | Modify (add 2 routes) |

