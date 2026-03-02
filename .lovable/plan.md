

## Mobile Audit & Capacitor Readiness Report

### PART 1 -- MOBILE UI/UX

**Touch Targets**
- BottomNav tabs: `px-3 py-2` with `h-5 w-5` icons = roughly 40x40px. Below 44px minimum. **FIX NEEDED**
- Settings page camera button: `h-6 w-6` (24px). **FIX NEEDED**
- QuickLogGrid cards: `p-3` with small icons are fine (whole card is tappable)
- SubPageLayout prev/next buttons have enough area
- Most buttons use shadcn Button which meets 44px with default sizing

**Hover-only Interactions**
- 892 uses of `hover:` across 83 files, but all are enhancement-only (color changes, shadows). No functionality gated behind hover. **OK -- no fix needed** (hover gracefully degrades on mobile)

**Typography -- Tiny Text**
- 1,606 instances of `text-[5-11px]` across 74 files. Many are `text-[9px]`, `text-[10px]`, `text-[8px]` -- these are below the 14px mobile minimum
- Settings page uses `text-[10px]` and `text-[11px]` extensively for labels and section headers
- BottomNav labels: `text-[9px]` -- very small
- Leaderboard, family dashboard, widget labels all use tiny text
- **FIX**: Bump the most critical small text: BottomNav labels from 9px to 11px, section headers from 10px to 11px. Leave decorative/secondary labels at 10px (these are intentional design choices for compact UI and are common in mobile apps like the reference Mushaf app)

**Safe Area Insets**
- BottomNav already handles `pb-[env(safe-area-inset-bottom)]` **OK**
- Sticky headers and SubPageLayout bottom bar do NOT account for safe areas. **FIX NEEDED** on SubPageLayout and SurahReader bottom bars
- `index.html` missing `viewport-fit=cover` meta tag. **FIX NEEDED** -- required for safe area insets to work on iOS

---

### PART 2 -- NAVIGATION

**Back Buttons**
- SubPageLayout uses `navigate(-1)` with `backTo` fallback via `window.history.length > 1`. **OK**
- SurahReader uses `replace: true`. **OK**
- ErrorBoundary uses `window.location.href = '/dashboard'` -- browser-only API. **FIX NEEDED**: replace with React Router or simple `window.location.replace()`

**Stuck Pages**
- SurahReader was fixed in previous iteration with sticky bottom nav. **OK**
- All sub-pages use SubPageLayout with Back button. **OK**
- Deep links (/family/join/:code) work through SPA redirects (`public/_redirects`). **OK for web, needs Capacitor config for mobile**

---

### PART 3 -- PERFORMANCE

**Intervals/Timers**
- All `setInterval` calls found (AdminDashboard, RamadanOptimizer, PrayerTimes, AdminLayout) properly clean up with `clearInterval` in return functions. **OK**
- `setTimeout` calls in BackdatePrompt, BackdateDatePicker, etc. properly clean up. **OK**
- Fasting timer uses Zustand store `tick()` -- needs to verify interval cleanup in the consuming component

**Large Lists**
- No virtualization found. Family feed, leaderboard, Quran surah list could benefit from virtualization for very large datasets, but current data sizes are small (max 114 surahs, ~10 family members). **LOW RISK**

**Images**
- Uses `.webp` format for assets. **OK**
- Avatar uploads capped at 2MB. **OK**

---

### PART 4 -- MOBILE-SPECIFIC

**Keyboard Input Types**
- Number inputs use `type="number"` in most places. **OK**
- Email input on Auth page uses `type="email"`. **OK**
- Some number inputs missing `inputMode="numeric"` for better mobile keyboards (e.g., QadaSolatSetup, HealthWeight). **MINOR FIX**

**Modals & Sheets**
- Uses Vaul drawer (swipe-dismissable). **OK**
- Radix dialogs/sheets used. **OK**

---

### PART 5 -- CAPACITOR COMPATIBILITY

**Browser-Only APIs**
- `window.location.href` in ErrorBoundary line 36. **FIX NEEDED**
- `document.getElementById` in SurahReader for scroll-to-ayah. **OK** -- this is standard DOM API that works in WebView
- `window.location.origin` used in Auth for OAuth redirect. **NEEDS REVIEW** for Capacitor (may need app scheme)
- `window.history.length` in SubPageLayout. **OK** -- works in WebView

**Google Sign-In**
- Currently uses `lovable.auth.signInWithOAuth('google')` with web redirect flow. **BLOCKER for Capacitor** -- web OAuth redirects don't work reliably in WebView. Will need Capacitor Google Auth plugin when converting. **NOT fixing now** -- this is a Capacitor conversion task, not a pre-fix.

**PWA/Manifest**
- No `manifest.json` found in search results. The app has PWA support via vite-plugin-pwa (mentioned in memories), but manifest may be generated. **VERIFY**

**HTTPS**
- All Supabase calls use HTTPS via environment variables. **OK**
- JAKIM proxy edge function uses HTTPS. **OK**

---

### PART 6 -- OFFLINE BEHAVIOR

- App uses offline-first React Query pattern with localStorage. **OK**
- IF Timer uses local time calculation (`Date.now()` - `startTime`). **OK** -- works offline
- Prayer times cached in localStorage after first load. **OK**
- No explicit offline UI indicator. **RECOMMENDED** but not a blocker

---

### PART 7 -- CAPACITOR-SPECIFIC PREP

**Build Check**
- Standard Vite build setup. `npm run build` should work. **OK**
- No web-only packages that would break in WebView identified
- All imports use `@/` alias which resolves correctly. **OK**

---

## Summary & Fixes to Implement

### FIX 1: `index.html` -- Add viewport-fit=cover
Add `viewport-fit=cover` to the viewport meta tag for iOS safe area support.

### FIX 2: `ErrorBoundary.tsx` -- Remove window.location.href
Replace `window.location.href = '/dashboard'` with `window.location.replace('/dashboard')` or keep as-is since ErrorBoundary is a class component without React Router access. The safest Capacitor-compatible fix is `window.location.replace('/')` which works in WebView.

### FIX 3: `BottomNav.tsx` -- Increase touch targets
- Increase tap area: add `min-h-[44px] min-w-[44px]` to each tab link
- Bump label from `text-[9px]` to `text-[11px]`

### FIX 4: `SubPageLayout.tsx` -- Add safe area padding
Add `pb-[env(safe-area-inset-bottom)]` to the sticky bottom bar.

### FIX 5: `Settings.tsx` -- Fix tiny camera button
Increase camera overlay button from `h-6 w-6` to `h-8 w-8` for 44px touch target.

### FIX 6: `SurahReader.tsx` -- Add safe area padding to bottom bar
Add `pb-[env(safe-area-inset-bottom)]` to the sticky bottom nav.

### FIX 7: `QuickLogGrid.tsx` -- Bump label text
Change `text-[10px]` to `text-[11px]` for better readability.

### FIX 8: Update `PROGRESS.md` with audit results

---

## Audit Score

| Category | Score | Notes |
|----------|-------|-------|
| Touch Targets | 7/10 | Most OK, BottomNav and camera button too small |
| Typography | 6/10 | Many tiny labels, but intentional compact design |
| Safe Areas | 6/10 | Only BottomNav handles it, missing viewport-fit |
| Navigation | 9/10 | Well structured, one window.location.href |
| Performance | 9/10 | Clean interval management, small data sets |
| Keyboard/Forms | 8/10 | Good input types, minor inputMode gaps |
| Capacitor Compat | 7/10 | Google Auth needs plugin, ErrorBoundary fix |
| Offline | 8/10 | Solid offline-first pattern |
| **Overall** | **8/10** | **Ready for Capacitor conversion after fixes** |

### Verdict
- 5 items to **FIX** (safe areas, touch targets, ErrorBoundary, viewport-fit)
- 1 **BLOCKER** deferred to conversion phase (Google Auth plugin)
- 2 items **RECOMMENDED** (offline indicator, inputMode attributes)

**Ready to proceed with Capacitor conversion after these fixes.**

---

### Files to Modify

| File | Change |
|------|--------|
| `index.html` | Add `viewport-fit=cover` to viewport meta |
| `src/components/ErrorBoundary.tsx` | Replace `window.location.href` |
| `src/components/BottomNav.tsx` | Increase touch targets, bump label size |
| `src/components/SubPageLayout.tsx` | Add safe area padding to bottom bar |
| `src/pages/Settings.tsx` | Increase camera button size |
| `src/pages/deen/SurahReader.tsx` | Add safe area padding to bottom bar |
| `src/components/dashboard/QuickLogGrid.tsx` | Bump label text size |
| `PROGRESS.md` | Full audit results |

