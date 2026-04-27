## 🎯 Goal

Eliminate 7-tab cognitive overload. Adopt the proven lifestyle-app pattern: **4 equally-weighted pillar tabs flanking a prominent center primary action**, matching the "4 Pillars" brand DNA (Iman / Health / Wealth / Productivity) and surfacing the highest-frequency action — **Salah check-in (5x/day)** — as a one-tap FAB.

---

## 🧭 New Bottom Nav Layout

```
┌───────────────────────────────────────────┐
│  Iman    Health    [✓]    Wealth   Tasks │
│   🕌      ❤️    Salah ✓    💰      ✅    │
└───────────────────────────────────────────┘
              ↑ elevated FAB
```

- **5 slots total**, but middle slot is the FAB (not a tab) → mentally only 4 destinations to scan
- FAB sits **8–12px above** the nav baseline, emerald gradient, white check icon, subtle shadow
- Tap FAB → opens **Salah Quick-Log Sheet** (bottom sheet) with today's 5 prayers as toggleable rows, defaulting to the next unlogged prayer

---

## 🗺 IA Relocations


| Removed from BottomNav | New Home                                                                                                                                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home (`/`)**         | Tap app logo in `AppHeader` → `/` (already wired). Also remains the **default route after login**.                                                                                                                                             |
| **Family**             | New "Family" icon in `AppHeader` right-side cluster (between Bell and Admin shield). Badge dot when there's new family activity.                                                                                                               |
| **Profile / Settings** | Replace the placeholder Bell button in `AppHeader` with an **avatar/initials button** → opens a small dropdown: Profile, Settings, Notifications, Sign out. (Keeps Bell as a separate icon if notifications are wired; otherwise consolidate.) |


> Rationale: Home is an aggregator (reachable via logo, the universal "home" affordance). Family & Settings are utility/secondary destinations that don't deserve 14% of the most expensive screen real estate.

---

## 🛠 Implementation Plan

### 1. New file: `src/components/SalahQuickLogSheet.tsx`

- Controlled `<Sheet side="bottom">` from shadcn
- Lists today's 5 prayers (Subuh, Zohor, Asar, Maghrib, Isyak) as rows with status pills: `On time / Late / Missed / —`
- Uses existing `useTodaySalahCount` + `useSalahMutation` from `src/hooks/useSalahQuery.ts`
- Auto-scrolls/highlights the **next unlogged prayer** based on current time vs prayer schedule (read from `usePrayerSettings`)
- Haptic feedback on log via existing `src/utils/native/haptics.ts`
- Toast confirmation via existing sonner setup

### 2. Rewrite `src/components/BottomNav.tsx`

- Reduce tabs array from 7 → 4: `Iman`, `Health`, `Wealth`, `Tasks`
- Render 5 slots in a grid: `[tab][tab][FAB][tab][tab]` using `grid-cols-5`
- Center slot renders `<SalahFabButton />` instead of a Link
- FAB styling: 56px circle, `bg-gradient-to-br from-primary to-emerald-600`, `-mt-6` to elevate, `shadow-lg shadow-primary/30`, white check icon
- FAB tap state: brief scale + haptic; opens `SalahQuickLogSheet`
- Keep `matchPaths` mechanism for `/deen-journey` → Iman highlighting
- Tab labels shrink? No — with 4 tabs at 390px we get ~78px each → comfortable for a 44px target + readable 12px label

### 3. Update `src/components/AppHeader.tsx`

- Add `<Link to="/family">` icon button (UserGroup icon from Hugeicons) in the right cluster, before the Bell
- Replace Bell button with **AvatarButton**: shows user's initials in a primary-tinted circle (use `useAuth` for `user.user_metadata.full_name` per existing identity-resolution rule)
- Avatar tap → `<DropdownMenu>` with: **Profile**, **Settings**, **Notifications**, **Sign out** (sign out via existing `supabase.auth.signOut()` flow already in `Settings.tsx`)
- Keep the Admin shield button untouched

### 4. Routing tweaks (`src/App.tsx`)

- No route changes needed — `/`, `/family`, `/settings` all stay reachable via header/redirects
- Optional: add `/profile` as alias → `/settings` (or split later — out of scope for this round)

### 5. Wire the FAB primary action data flow

- Sheet pulls from existing hooks; **no new tables, no migrations, no Supabase changes**
- After logging, invalidate `['salah', userId, today]` (already handled by `useSalahMutation.onSuccess`)
- Sheet shows today's count: "3 / 5 prayers logged" header
- "View full log" link at sheet bottom → navigates to `/iman/salah-log`

### 6. Quietly fix the runtime error

- `goalList.reduce is not a function` — investigate during implementation (likely in `LifeAreas.tsx` or a wealth/savings query returning non-array). Will patch root cause without ceremony.

---

## ✅ Acceptance Criteria

1. Bottom nav shows exactly **4 tab labels + 1 center FAB**, no other items
2. FAB has visible elevation (above nav line) and emerald gradient consistent with brand
3. Tapping FAB opens a bottom sheet with all 5 daily prayers, **next unlogged prayer is visually emphasized**
4. Logging a prayer in the sheet updates the dashboard's prayer card in real time (React Query cache invalidation)
5. AppHeader shows: logo (left) → Family icon → Avatar dropdown → Admin shield (if admin)
6. Avatar dropdown contains working Profile, Settings, and Sign out items
7. Bottom-nav active highlighting still works for `/iman`, `/iman/*`, `/deen-journey`, `/health/*`, `/wealth/*`, `/productivity/*`
8. Touch targets ≥ 44×44px (verified at 390px viewport)
9. No regression on `AuthGuard`, `AppLayout`, or any existing route
10. Runtime error `goalList.reduce is not a function` is gone

---

## 🚫 Out of Scope (Explicitly Deferred)

- Notification system rewiring (Bell remains unimplemented or merged into avatar dropdown — TBD during impl)
- Splitting Profile from Settings into separate pages
- Adding new "More" drawer (header dropdown is enough)
- Animating FAB on prayer time arrival (good v2 idea, not now)
- A/B test instrumentation (would need analytics setup)

---

## 📁 Files to Modify

- `src/components/BottomNav.tsx` (rewrite)
- `src/components/AppHeader.tsx` (add Family + Avatar dropdown, remove plain Bell)
- `src/components/SalahQuickLogSheet.tsx` (new)
- Possibly 1 file for the `goalList.reduce` runtime fix (root cause TBD)

No changes to: routing, database, edge functions, auth flow, AppLayout shell, or any pillar pages.