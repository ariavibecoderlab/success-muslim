# 09 · UI Design

## 9.1 Design language

Refined Islamic Calm. Light mode only for MVP. Primary palette: white,
emerald green, orange accent. Premium gradients and glassmorphism are
used sparingly on hero surfaces (`mem://style/visual-identity`).

## 9.2 Tokens

All color, spacing, radius, shadow, and gradient tokens live in:

- `src/index.css` — `:root { --background, --foreground, --primary,
  --primary-foreground, --secondary, --muted, --accent, --gradient-*,
  --shadow-* }` (HSL values only).
- `tailwind.config.ts` — exposes the same tokens as utility classes
  (`bg-primary`, `text-foreground`, `bg-gradient-hero`, etc.).

Rule (enforced by review): **no raw colors in component class strings.**
`text-white`, `bg-black`, `#000`, `rgb(...)` are forbidden in components.

## 9.3 Typography

Display + body font pairing per `mem://style/visual-identity`. Headings
use the display face; body uses the workhorse face. Arabic uses the
Uthmani Mushaf font for Qur'an surfaces.

## 9.4 Iconography

Hugeicons only. No mixing with Lucide/Material in components.
`aria-label` required on icon-only controls.

## 9.5 Layout shells

```text
 AppLayout (authenticated)        SubPageLayout (sub-route)
┌──────────────────────────┐     ┌──────────────────────────┐
│  max-w-md mx-auto        │     │  back-aware header       │
│  ┌────────────────────┐  │     │  ┌────────────────────┐  │
│  │ OfflineBanner      │  │     │  │ slot              │  │
│  │ <Outlet/> (scroll) │  │     │  │                    │  │
│  │ BottomNav (fixed)  │  │     │  └────────────────────┘  │
│  └────────────────────┘  │     └──────────────────────────┘
│  desktop: shadow-xl       │
│  + border-x  (phone frame)│
└──────────────────────────┘

 MarketingLayout (public)
┌──────────────────────────────────────────────────────────┐
│  Header (logo + nav)                                     │
│  full-width responsive sections (bento grid)             │
│  Footer                                                  │
└──────────────────────────────────────────────────────────┘
```

## 9.6 Navigation

- **Bottom nav (7 tabs):** Dashboard, Today, Iman, Health, Wealth,
  Productivity, Family. Active state with primary fill.
- **Segmented controls:** intra-section navigation (e.g., Quran Reader
  modes, Health metric tabs). History-aware: changing segment does not
  push a new history entry; back behaves intuitively
  (`mem://ui/navigation-logic`).
- **Sub-routes:** use `SubPageLayout` with a true back button.
- **Marketing:** standard top nav with hamburger on small viewports.

## 9.7 Accessibility

- WCAG 2.1 AA contrast (verified for both surfaces and accents).
- Minimum tap target 44×44 pt (Apple HIG).
- Form fields use shadcn `Form` + `react-hook-form` + `zod` for
  accessible error association.
- Focus rings visible (`ring-2 ring-ring`).
- Adhan/notification copy is descriptive (screen reader friendly).

## 9.8 Motion

- `framer-motion` for entry/exit and hero animations.
- One well-timed hero animation per surface — never scattered
  micro-interactions.
- Reduced-motion respected via `useReducedMotion`.

## 9.9 Edit-mode CMS overlay

`EditModeContext` toggles an admin-only overlay on marketing surfaces.
`EditableText/Image/Icon/Box` components write to `page_overrides`
through `api-admin`. The overlay shows hoverable boundaries and an inline
toolbar (`EditModeToggle`).

## 9.10 Empty / loading / error states

| State | Pattern |
|-------|---------|
| Loading | Skeleton blocks with token `bg-muted`; never spinners on hero. |
| Empty | Friendly headline + primary CTA (e.g., "Log your first salah"). |
| Error | Inline alert with retry; severe errors escalate to `ErrorBoundary`. |
| Offline | Sticky `OfflineBanner`; mutations show "Saved · syncing". |

## 9.11 Responsive policy

Authenticated app stays `max-w-md` on every viewport (mobile-feel
parity). Marketing pages are fully responsive. Admin console is
desktop-only (`MobileAdminBlock` shows on small viewports).