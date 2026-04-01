

# Align About Page with Features Page Design

## Problem
The About page uses a simpler, narrower layout (`max-w-lg`) with basic glassmorphic cards, while Features uses a wider (`max-w-5xl`), richer bento layout with gradient header cards, icon backgrounds, phone mockups, and more visual depth.

## Changes (`src/pages/About.tsx`)

### 1. Hero Section
- Match Features hero style: wider layout, same gradient text pattern, add a subtitle badge/pill (e.g., "Our Story")

### 2. Mission & Vision → Bento Gradient Header Cards
- Replace the plain `border-l-4` cards with full gradient header cards matching the Features pillar style:
  - Mission: `from-emerald-600 to-teal-700` gradient card with white icon, title, description
  - Vision: `from-orange-500 to-amber-600` gradient card with white icon, title, description
- Add decorative circle overlay (`bg-white/5 rounded-full`) like Features pillar headers
- Use `max-w-5xl` container width to match Features

### 3. Core Values → Feature Mini-Cards Grid
- Use the same mini-card pattern from Features: `rounded-xl border border-gray-100 bg-white/70 backdrop-blur-sm` with `hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`
- Expand to `max-w-5xl` with `grid-cols-2 md:grid-cols-4` layout (one row on desktop)
- Match icon badge size (`w-9 h-9 rounded-lg`) and text sizing (`text-sm` title, `text-xs` desc) from Features

### 4. Bottom CTA
- Already matches Features — no changes needed

### 5. Width & Spacing
- Replace all `max-w-lg` with `max-w-5xl` to match Features page proportions

## Files Modified
- `src/pages/About.tsx`

