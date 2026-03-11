

## Redesign /iman/dhikr — Cleaner, More Informative, Native Counter Feel

### Current Problems
- Page is cluttered: date picker, streak badge, preset pills, arabic text, giant circle, progress bar, summary card, history chart — all stacked vertically with no clear visual hierarchy
- Counter circle uses green `hsl(var(--primary))` conic gradient — doesn't match orange design system
- No orange hero card like other Iman subpages
- Progress bar below the circle is redundant (circle already shows progress)
- "Today's Summary" and "7-Day History" are buried at the bottom

### New Design

**Layout: 3 clear zones**

```text
┌─────────────────────────┐
│  Orange Hero Card       │  ← Streak + total today + completed count
│  🔥 3-day streak        │
│  Total: 245  ·  3/7 ✓   │
└─────────────────────────┘
┌─────────────────────────┐
│  Preset Pills (scroll)  │  ← Horizontal scroll, + Custom button
├─────────────────────────┤
│                         │
│   Arabic text (large)   │
│   Transliteration       │
│                         │
│      ╭─────────╮        │
│      │   245   │        │  ← Big tap circle with orange conic gradient
│      │  / 300  │        │
│      ╰─────────╯        │
│   [Reset]    [Haptic ✓] │
│                         │
└─────────────────────────┘
┌─────────────────────────┐
│  Session Progress Cards │  ← Each preset as a mini card with progress
│  SubhanAllah  67/100 ██ │
│  Alhamdulillah 45/100 █ │
└─────────────────────────┘
┌─────────────────────────┐
│  7-Day Mini Chart       │  ← Orange-tinted bars
└─────────────────────────┘
```

### Changes to `src/pages/DhikrCounter.tsx`

1. **Add orange hero card** at top with streak flame icon, total daily count, and "X of Y complete" — replaces the scattered streak badge and date picker row

2. **Move date picker** into the hero card as a subtle inline element

3. **Restyle counter circle**: Replace green `hsl(var(--primary))` conic gradient with orange: `conic-gradient(rgb(234,88,12) ${deg}deg, rgba(234,88,12,0.15) ${deg}deg)`. Inner bg on completion: `bg-orange-50 dark:bg-orange-950/20`

4. **Remove redundant progress bar** below the circle (the conic gradient already shows progress)

5. **Add haptic toggle** — a small switch next to reset button so users can enable/disable vibration feedback (stored in localStorage). This is the "native feature" for counting.

6. **Add volume/silent mode toggle** — optional subtle tick sound on each tap (using Web Audio API, a simple click tone). Toggle stored in localStorage.

7. **Keep screen awake** during counting using the Wake Lock API (`navigator.wakeLock.request('screen')`) — critical native feature for long dhikr sessions. Auto-release when navigating away.

8. **Restyle session summary cards** — each preset gets its own mini row with an orange-tinted progress bar instead of green

9. **7-day history bars** — change from `bg-primary` (green) to `bg-orange-500` / `bg-orange-200`

10. **Completion celebration** — when count hits target, show a brief confetti-like pulse animation on the circle + checkmark, with optional haptic burst

### Native Features Summary
- **Haptic feedback** on each tap (already exists, add toggle)
- **Screen wake lock** to prevent screen sleep during counting
- **Audio tick** option (Web Audio API beep)
- **Keyboard shortcut** — Space bar to increment (for accessibility)

### Files Modified
- `src/pages/DhikrCounter.tsx` — Full redesign (single file, all changes are UI)

No database changes. No new files needed. Storage layer unchanged.

