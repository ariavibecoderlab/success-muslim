# Dashboard Polish — Priority 1-3

Three high-leverage fixes to make the home dashboard feel premium and on-brand. No new features, only refinement.

---

## 1. Header — Fix cropping & greeting copy

**Problem:** "Success Muslim" logo crops to "Succ..." on 390px screens. The rotating greeting `salaam, Muslim` is lowercase and reads like an unfinished sentence.

**Changes in `src/components/AppHeader.tsx`:**
- Allow brand container to shrink properly: replace `flex-1 min-w-0` on the Link with `min-w-0` only, and let the right-side cluster keep `shrink-0`. This stops the logo+title from pushing past the avatar.
- Reduce header right-side icon spacing from `gap-2` to `gap-1.5` to recover ~6px.

**Changes in `src/components/dashboard/RotatingHeader.tsx`:**
- Capitalize and humanize the first slide:
  - Logged-in user with name → `Assalamualaikum, {FirstName}`
  - No name → `Assalamualaikum`
- Keep the 3-slide rotation (greeting → Hijri date → Gregorian date) but tighten timing to 4s (current 3s feels twitchy).
- Add a tiny secondary line below (text-[11px] text-muted-foreground) showing next prayer + countdown so the header earns its space — this is the only place in the app where countdown stays visible while scrolling.

**Acceptance:** Logo never crops on 360–430px widths. Greeting reads as a complete, properly-cased Islamic salutation.

---

## 2. Hero Prayer Card — Real empty state, no skeleton dead-zone

**Problem:** When prayer times haven't loaded (no location set, offline, or first launch) the hero shows ~150px of grey skeleton bars. Feels broken.

**Changes in `src/components/dashboard/HeroPrayerCard.tsx`:**
- Replace the skeleton-only loading branch with a tri-state:
  1. **Settings still loading** → keep skeleton (legitimate, brief).
  2. **Settings loaded but no location/method configured** → show a compact "Setup prayer times" CTA card (same emerald gradient, single line of copy + arrow → `/iman/prayer-times`). No skeleton.
  3. **Location set but fetch failed** → show "Couldn't load prayer times. Tap to retry." with retry handler that re-runs `fetchPrayerTimes`.
- Add a `hasLocation` check derived from `settings` (zone code or lat/lng present).
- Keep the existing "all done" celebration and the active "next prayer" view unchanged.

**Acceptance:** No user ever sees grey skeleton bars for more than ~500ms. Empty/error states are actionable, not decorative.

---

## 3. Quick Log Grid — Brand-aligned monochrome palette

**Problem:** 8 different rainbow gradients (emerald, amber, pink, orange, blue, indigo, rose, teal) compete with the emerald hero card and central Salah FAB. Violates "Refined Islamic Calm" memory.

**Changes in `src/components/dashboard/QuickLogGrid.tsx`:**
- Replace all 8 per-item gradients with a unified system:
  - **Default state:** `bg-muted` circle, `text-foreground/70` icon, subtle `ring-1 ring-border/50`.
  - **Logged today (where applicable — prayer, dhikr, water, fast):** swap to `bg-emerald-50 ring-emerald-200`, icon `text-emerald-700`. Connect to the relevant query hooks already imported elsewhere (useSalahQuery, useDhikrQuery, useHealthQuery for water, fastingStore for fast). For items without a "logged today" signal (quran, sleep, tasks, habits), keep default.
  - **Active/pressed:** `active:scale-95` (already there, keep).
- Remove `gradient` from the `QUICK_LOGS` config; replace with a single shared style. Icons stay the same.
- Keep the Edit sheet functional but mirror the same monochrome treatment in its preview swatches.

**Acceptance:** Quick Log row reads as one quiet utility strip; only items the user has *completed today* glow emerald. Visual weight clearly subordinate to the Hero card and the central FAB.

---

## Out of scope (parking lot)
- Wealth Summary Strip — separate batch.
- Admin UI leakage (Shield icon, CMS pencil) — separate batch, needs role-gating audit.
- Daily Check-in vs Life Score CTA competition — needs a copy + IA decision first.

## Technical notes
- No DB migrations, no new hooks, no new dependencies.
- Files touched: `AppHeader.tsx`, `RotatingHeader.tsx`, `HeroPrayerCard.tsx`, `QuickLogGrid.tsx` (4 files).
- All changes are visual / state-handling; existing data flow and routes untouched.
