# Changelog — 2026-02-22

## Logo Update (Global)

### Changes
- **App Header**: Replaced the default Lucide icon with the new Success Muslim logo (`smlogo.webp`) across all pages (Dashboard, Health, Family, Wealth, Productivity, Settings).
- **Favicon**: Updated browser tab icon from `favicon.png` to `smlogo.webp`.
- **PWA / Apple Touch Icon**: Added `apple-touch-icon` meta tag pointing to `smlogo.webp` for home screen installs.
- **Removed `icon` prop**: The `AppHeader` component no longer accepts a per-page `icon` override — all pages now use the unified logo.

### Files Changed
| File | Change |
|------|--------|
| `src/assets/smlogo.webp` | New logo asset (ES6 import source) |
| `public/smlogo.webp` | New logo asset (favicon / PWA) |
| `src/components/AppHeader.tsx` | Replaced `<Icon>` with `<img>` logo, removed `icon` prop |
| `index.html` | Updated favicon + added apple-touch-icon |
| `src/pages/Family.tsx` | Removed `icon={Users}` prop |
| `src/pages/Health.tsx` | Removed `icon={Heart}` prop |
| `src/pages/Wealth.tsx` | Removed `icon={Wallet}` prop |
| `src/pages/Productivity.tsx` | Removed `icon={ListChecks}` prop |
| `src/pages/Settings.tsx` | Removed `icon={UserCircle}` prop |
