## Goal
Make the **Iman** tab in the bottom navigation appear active when the user is on `/deen-journey` (and any future nested routes under it), since Deen Journey is the spiritual analytics hub reached from Iman widgets.

## Current Behavior
In `src/components/BottomNav.tsx`, active state is computed strictly from each tab's own path:

```tsx
const active =
  tab.path === '/'
    ? pathname === '/'
    : pathname === tab.path || pathname.startsWith(tab.path + '/');
```

`/deen-journey` does not match `/iman`, so **no tab highlights** while the user is on that page.

## Proposed Change
Add an optional `matchPaths` array to each tab definition listing extra route prefixes that should also activate it. Then update the active check to also consider those prefixes.

### File: `src/components/BottomNav.tsx`

1. Extend the Iman tab entry:
```ts
{ icon: Moon02Icon, label: 'Iman', path: '/iman', matchPaths: ['/deen-journey'] },
```

2. Update the active calculation:
```tsx
const active =
  tab.path === '/'
    ? pathname === '/'
    : pathname === tab.path
      || pathname.startsWith(tab.path + '/')
      || (tab.matchPaths?.some(
           p => pathname === p || pathname.startsWith(p + '/')
         ) ?? false);
```

This is additive and backward-compatible — every other tab's behavior stays identical.

## Verification
- `/` → Home active ✅
- `/iman` and `/iman/quran`, `/iman/dhikr`, etc. → Iman active ✅
- `/deen-journey` → **Iman now active** ✅ (was: none)
- `/health/*`, `/wealth/*`, `/productivity/*`, `/family/*`, `/settings` → unchanged ✅

## Out of Scope
- No route or navigation changes.
- No visual/styling changes — only the boolean used to apply existing active styles.
- No extra tab added; Deen Journey remains a sub-destination of Iman conceptually.
