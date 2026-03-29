

## Switch Bottom Nav Icons to Hugeicons

### Overview
Replace the custom SVG icons in `NavIcons.tsx` with Hugeicons, using the free `@hugeicons/core-free-icons` package. Since the free pack only includes **Stroke Rounded** style (no solid/filled variants), the active state will use bolder stroke weight + primary color rather than filled icons.

### Icon Mapping (aligned with "Success Muslim" identity)

| Tab | Current | Hugeicon (free) | Rationale |
|---|---|---|---|
| Home | Mosque SVG | `Mosque02Icon` | Islamic identity |
| Iman | Crescent+Star SVG | `Moon02Icon` | Crescent moon — Islamic symbol |
| Health | Heart+Pulse SVG | `HeartCheckIcon` | Health tracking |
| Wealth | Stacked Coins SVG | `Coins01Icon` | Financial tracking |
| Tasks | Clipboard SVG | `TaskDaily01Icon` | Productivity |
| Family | Two People SVG | `UserGroupIcon` | Family/community |
| Profile | Settings Gear SVG | `Settings02Icon` | Settings/profile |

### Changes

**1. Install packages**
- `@hugeicons/react` — the renderer component
- `@hugeicons/core-free-icons` — 4,500+ free stroke rounded icons

**2. Rewrite `src/components/BottomNav.tsx`**
- Import `HugeiconsIcon` from `@hugeicons/react`
- Import each icon from `@hugeicons/core-free-icons`
- Use `HugeiconsIcon` component with `size={20}`, `color="currentColor"`
- Active state: increase `strokeWidth` to `2` (vs default `1.5`) for visual weight difference
- Remove the `active` prop pattern since Hugeicons handles styling via props

**3. Delete `src/components/icons/NavIcons.tsx`**
- No longer needed — all icons come from the Hugeicons package

### Technical Detail
```tsx
import { HugeiconsIcon } from '@hugeicons/react';
import { Mosque02Icon, Moon02Icon, HeartCheckIcon, Coins01Icon, TaskDaily01Icon, UserGroupIcon, Settings02Icon } from '@hugeicons/core-free-icons';

const tabs = [
  { icon: Mosque02Icon, label: 'Home', path: '/dashboard' },
  { icon: Moon02Icon, label: 'Iman', path: '/iman' },
  // ...
];

// In render:
<HugeiconsIcon 
  icon={tab.icon} 
  size={20} 
  color="currentColor" 
  strokeWidth={active ? 2 : 1.5} 
/>
```

### Files
- `package.json` — add 2 dependencies
- `src/components/BottomNav.tsx` — rewrite icon imports and rendering
- `src/components/icons/NavIcons.tsx` — delete

