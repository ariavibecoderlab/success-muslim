

# Polish Landing Page — Bento Grid + Mobile App Version

## Overview
Redesign the web landing page (`/`) with a modern bento grid layout using white, emerald green, and orange as the color palette. Create a separate condensed mobile-app landing page that shows bento highlights + CTA without heavy marketing sections.

## 1. Web Landing Page Redesign (`src/pages/Landing.tsx`)

### Hero Section
- Clean white background with a subtle emerald gradient glow
- Bento-style hero: large left card (gradient emerald-to-teal with headline + CTA) + right side stacked cards (phone mockup + stats)
- Typography: bold heading with gradient text (emerald → orange accent)

### Bento Feature Grid
Replace the linear "Four Pillars" + "How It Works" + "Who It's For" sections with a **single bento grid**:

```text
┌──────────────┬───────────┐
│  Life Score   │   Iman    │
│  (large, 2x1) │  (1x1)   │
├───────┬──────┼───────────┤
│Wellness│Wealth│Productivity│
│ (1x1)  │(1x1) │  (1x1)    │
└───────┴──────┴───────────┘
```

- Each bento card: `rounded-2xl` with subtle border, hover scale effect
- Color coding: Iman = emerald, Wellness = teal, Wealth = orange, Productivity = amber
- Cards contain: icon/emoji, title, short description, and a screenshot or illustration
- Glassmorphic overlay on image cards (`backdrop-blur bg-white/70`)

### Interactive Life Score
- Keep the interactive slider demo but style it inside a bento card with white bg + emerald ring
- Cleaner, more compact layout

### Bottom CTA
- Emerald-to-teal gradient background (matching brand)
- Hadith quote + "Begin Your Journey" button in white

### Color Palette
- Background: `white` / `bg-gray-50`
- Primary cards: `from-emerald-600 to-teal-700` (green)
- Accent cards: `from-orange-500 to-orange-600` (orange)
- Text: `text-gray-900`, `text-gray-500`
- Card borders: `border-gray-100`

## 2. Mobile App Landing Page (`src/pages/MobileLanding.tsx`)

A condensed version for Capacitor/native app users:
- **Hero**: Brand logo + "Success Muslim" + tagline (2 lines max)
- **Mini bento grid**: 4 cards (Iman, Wellness, Wealth, Productivity) in a 2x2 grid with colored icons and one-line descriptions
- **Life Score preview**: Small ring + "Track your holistic Life Score"
- **CTA**: "Get Started" button (full-width, emerald gradient) + "Sign In" link
- No navbar, no footer, no heavy marketing copy
- Total height fits within ~2 screen scrolls max

## 3. Routing Logic (`src/App.tsx`)

- Detect `Capacitor.isNativePlatform()` in the `/` route
- If native → render `MobileLanding`
- If web → render `Landing`

## Files Modified
- `src/pages/Landing.tsx` — full bento grid redesign
- `src/pages/MobileLanding.tsx` — new condensed mobile landing
- `src/App.tsx` — conditional routing for native vs web

