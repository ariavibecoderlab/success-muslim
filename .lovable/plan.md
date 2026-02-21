

## Polish the /health Page

### Current Issues
- No entrance animations (every other polished page uses framer-motion)
- Hero icon is static (IF Timer page has breathing animations)
- Stats cards are plain with no visual differentiation
- Feature cards grid lacks staggered entrance
- Typography uses `font-bold` instead of `font-black tracking-tight` (inconsistent with polished pages)
- IF active widget has no progress indicator
- Sunnah reminder card is basic
- No circular progress rings for stats (water, steps)

### Planned Changes (single file: `src/pages/Health.tsx`)

1. **Add framer-motion imports and animation variants**
   - `fadeUp` stagger variant matching Dashboard pattern (delay: 0.07s per item)
   - Container variant with `staggerChildren` for feature cards

2. **Hero section polish**
   - Upgrade title to `font-black tracking-tight`
   - Add subtle breathing/pulse animation to the Heart icon (matching IF Timer style)
   - Wrap hero in `motion.div` with fade-in

3. **Stats cards upgrade**
   - Wrap stats grid in staggered `motion.div`
   - Add mini circular progress rings for Water (cups/goal) and Steps (percentage) using inline SVG circles
   - Color-code BMI value based on category (green/yellow/red)
   - Add subtle `hover:shadow-sm` and `transition-shadow` to each stat card

4. **Active IF widget enhancement**
   - Add a slim `Progress` bar showing elapsed percentage
   - Wrap in `motion.div` with a slide-down entrance
   - Add a pulsing green dot indicator next to "IF Fasting Active"

5. **Feature cards grid animations**
   - Staggered fade-up entrance for each card (delay: index * 0.06s)
   - Add `hover:shadow-md` transition for premium hover feel
   - Slightly larger icon containers with gradient backgrounds matching each feature's theme

6. **Sunnah reminder card**
   - Add gentle fade-in animation
   - Upgrade border with `border-primary/20` accent

### Technical Details
- Only `src/pages/Health.tsx` will be modified
- Import `motion` from `framer-motion` and `Progress` from UI components
- All animations use `viewport={{ once: true }}` to fire once on scroll
- No new dependencies needed

