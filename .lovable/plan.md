

# Polish Marketing Navbar (`MarketingLayout.tsx`)

Align the navbar with the bento/glassmorphic design language used across Landing, Features, About, and Auth pages.

## Changes

### Header Bar
- Replace `bg-background/80` with glassmorphic styling: `bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm`
- Logo image: add `shadow-sm` and subtle hover group effect
- Brand text: emerald gradient text (`bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent`)

### Desktop Nav Links
- Add pill-shaped hover background: `px-3 py-1.5 rounded-lg hover:bg-emerald-50` transition
- Active state: `bg-emerald-50 text-emerald-700` pill instead of just color change

### Desktop CTA Buttons
- "Sign In": keep ghost but add `rounded-xl`
- "Get Started": emerald gradient button (`bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-sm hover:shadow-md`) with `active:scale-[0.98]` press effect
- Replace Lucide `ArrowRight` with HugeIcons `ArrowRight02Icon`

### Mobile Hamburger
- Replace Lucide `Menu`/`X` with HugeIcons equivalents
- Animated transition (framer-motion `AnimatePresence` for dropdown)

### Mobile Dropdown
- Glassmorphic panel: `bg-white/90 backdrop-blur-xl border-t border-white/20`
- Nav links as pill-shaped rows with active emerald highlight
- CTA buttons: match desktop gradient styling, `rounded-xl`

### Footer
- Match glassmorphic border style (`border-white/20`)
- Brand text: same emerald gradient as header

## File Modified
- `src/components/MarketingLayout.tsx`

