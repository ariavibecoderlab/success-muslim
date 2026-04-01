

# Polish /features, /about, and /auth Pages

Apply the same modern bento grid design language (white, emerald green, orange palette, glassmorphism, HugeIcons) used on the redesigned Landing page to these three pages.

## 1. Features Page (`src/pages/Features.tsx`)

**Current**: Lucide icons, linear pillar-by-pillar layout, plain cards, flat `bg-primary` CTA section.

**Changes**:
- Replace all Lucide icons with HugeIcons equivalents (Mosque02Icon, HealthIcon, MoneyBag02Icon, Target02Icon, UserMultipleIcon, etc.)
- Hero: white background with emerald gradient text, subtitle, and a bento-style phone mockup layout (similar to landing)
- Pillar sections → **Bento grid per pillar**: instead of alternating text+phone layout, each pillar becomes a bento section with:
  - Large gradient header card (emerald for Iman, teal for Health, orange for Wealth, amber for Productivity, purple for Family)
  - Feature items as glassmorphic mini-cards (`backdrop-blur-sm bg-white/60 border-white/20`) in a responsive grid
  - Phone mockups floating over gradient backgrounds with subtle rotation and shadow
- PhoneMockup component: add glassmorphic frame styling with shadow-xl
- Bottom CTA: emerald-to-teal gradient (matching Landing) with white text, hadith quote

## 2. About Page (`src/pages/About.tsx`)

**Current**: Lucide icons, plain bordered cards, flat `bg-primary` quote section.

**Changes**:
- Replace Lucide icons with HugeIcons (TrendingUp → Analytics02Icon, Shield → ShieldCheckIcon, Eye → View01Icon, Users → UserMultipleIcon)
- Hero: add brand logo with breathing animation above headline, emerald gradient text
- Mission & Vision: glassmorphic cards with subtle emerald/teal left border accent instead of plain text blocks
- Core Values: glassmorphic cards with colored icon backgrounds (emerald, teal, orange, amber) matching the Landing bento color scheme, hover scale effect (`active:scale-[0.98]`)
- Hadith quote section: emerald-to-teal gradient background (same as Landing CTA) instead of flat `bg-primary`

## 3. Auth Page (`src/pages/Auth.tsx`)

**Current**: Plain white background, Lucide Moon icon, basic Card, simple nav bar with ArrowLeft.

**Changes**:
- Background: subtle gradient (`bg-gradient-to-b from-emerald-50/40 via-background to-background`) with decorative geometric pattern overlay (CSS, low opacity) — same treatment as Onboarding
- Replace Moon lucide icon with brand logo (`smlogo.webp`) with breathing animation
- Nav bar: glassmorphic header (`bg-white/80 backdrop-blur-lg`)
- Form card: glassmorphic styling (`backdrop-blur-sm bg-white/70 border-white/30 shadow-xl rounded-2xl`)
- Input fields: pill-shaped (`rounded-xl`) with subtle inner shadow, slightly taller
- Submit button: emerald gradient (`bg-gradient-to-r from-emerald-600 to-teal-600`) with white text, `active:scale-[0.98]` press effect
- Sign up mode: add animated transition between login/signup with framer-motion `AnimatePresence`
- Toggle link: styled as a pill button instead of plain text link
- Replace Lucide Eye/EyeOff with HugeIcons equivalents
- Replace ArrowLeft with HugeIcons equivalent

## Files Modified
- `src/pages/Features.tsx` — bento grid layout, HugeIcons, glassmorphism, color palette
- `src/pages/About.tsx` — HugeIcons, glassmorphic cards, gradient CTA, logo
- `src/pages/Auth.tsx` — gradient background, glassmorphic form, pill inputs, brand logo, animations

