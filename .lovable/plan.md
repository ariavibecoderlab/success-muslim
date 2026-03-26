

## Polish BackdateDatePicker — Smarter, Modern Web Pattern

### Current Issues
- Looks like a basic utility bar with raw buttons and a small badge
- "Backdating" badge feels like a debug label, not a polished UI element
- No relative date context (e.g., "Yesterday", "2 days ago")
- Chevron buttons are plain and disconnected from the trigger
- No smooth transitions

### Design Direction
A unified **segmented date strip** — chevrons + date trigger feel like one cohesive control (like iOS date navigation), with smart contextual labels and smooth micro-animations.

### Changes to `src/components/BackdateDatePicker.tsx`

**1. Smart date labels** — Replace raw date strings with contextual text:
- Today → "Today"
- Yesterday → "Yesterday"  
- 2-6 days ago → "3 days ago"
- Older → "Mon, 14 Jan"
- Shows relative + absolute on non-compact mode (e.g., "Yesterday · Tue, 25 Mar")

**2. Unified control shape** — Wrap chevrons + trigger in a single rounded-full container with shared background, so it reads as one control instead of 3 separate buttons. Subtle inner dividers.

**3. Smooth transitions** — Use framer-motion `AnimatePresence` + `layoutId` on the date text so it slides/fades when changing dates. Backdating badge slides in from right with spring animation.

**4. Better backdating indicator** — Replace plain "Backdating" text badge with a subtle amber dot + relative "2d ago" inline in the button text itself. In dark mode, use a soft glow effect.

**5. Keyboard shortcut hints** — Show tiny "←→" hint on hover (desktop only) for power users. Add actual keyboard listener for left/right arrow keys.

**6. Calendar popover polish** — Add a "Yesterday" quick-pick button alongside "Go to Today". Add subtle header showing the date range limit.

### File
- **Modify**: `src/components/BackdateDatePicker.tsx` (single file change)

