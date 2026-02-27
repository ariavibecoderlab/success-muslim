

## Add App Screenshots to Features Page

Copy the 6 uploaded screenshots into `src/assets/features/` and embed them as phone mockup images in the `/features` page, each mapped to its corresponding section.

### Image Mapping

| File | Section |
|------|---------|
| `lifescore.webp` | Hero section (showcase the Life Score dashboard) |
| `iman.webp` | Iman pillar |
| `health.webp` | Health pillar |
| `start-fasting.webp` | Health pillar (secondary -- IF Timer idle state) |
| `if-timer-running.webp` | Health pillar (secondary -- IF Timer active state) |
| `ifasting.webp` | Health pillar (secondary -- IF summary state) |

### Changes

**File: `src/pages/Features.tsx`**

1. **Add an `image` field to `PillarSection` interface** -- optional string for the primary screenshot, plus an optional `extraImages` array for pillars with multiple screenshots (Health has 4).

2. **Update pillar data** -- assign imported image paths to each pillar:
   - Iman: `iman.webp`
   - Health: `health.webp` as primary, with `ifasting.webp`, `if-timer-running.webp`, `start-fasting.webp` as extra images
   - Wealth, Productivity, Family: no image (keep current layout)

3. **Modify the pillar section layout** -- when a pillar has an `image`, replace the feature grid with a phone mockup display:
   - Show the primary screenshot in a styled phone frame (rounded-3xl, shadow, border)
   - For Health section specifically, show a mini gallery of 2-3 additional screenshots below/beside the primary one
   - Pillars without images keep the existing feature card grid

4. **Add Life Score screenshot to the Hero** -- place the `lifescore.webp` image as a centered phone mockup below the hero text to immediately showcase the app.

5. **Phone frame styling** -- each screenshot gets a consistent treatment:
   - `rounded-[2rem]` border-radius to simulate a phone screen
   - Subtle shadow (`shadow-2xl`)
   - `border border-border/60` frame
   - Max width ~280px on desktop, responsive on mobile
   - Slight rotation/tilt on alternating sections for visual interest

### Files

| File | Action |
|------|--------|
| 6 images | Copy from `user-uploads://` to `src/assets/features/` |
| `src/pages/Features.tsx` | Add imports, update data, modify layout |

