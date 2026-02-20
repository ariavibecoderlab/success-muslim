
# Three Issues Found — Fix Plan

## Issue 1 (Critical): Leaderboard RPC returns error — `user_id is ambiguous`

The `get_family_leaderboard` SQL function has a bug inside the `quran_streak` CTE. The subquery `WHERE user_id = fm.user_id` refers to `user_id` inside a CTE called `ranked` — but `user_id` is ambiguous because PostgreSQL doesn't know if it refers to the CTE variable or the outer `fm.user_id`. It needs to be fully qualified as `quran_daily_log.user_id`.

Additionally, the LEFT JOIN on `family_privacy_settings` joins only on `fps.user_id = fm.user_id` — if a user is in two families, this could return duplicate rows. It should also join on `fps.family_id = p_family_id`.

**Fix**: A new database migration that replaces the function with fully table-qualified column references:

```sql
-- Inside the quran_streak CTE, change:
WHERE user_id = fm.user_id  -- ambiguous!
-- To:
WHERE quran_daily_log.user_id = fm.user_id  -- fully qualified

-- Also fix the LEFT JOIN:
LEFT JOIN family_privacy_settings fps 
  ON fps.user_id = fm.user_id 
  AND fps.family_id = p_family_id  -- add family scope
```

---

## Issue 2 (UX): Bottom navigation missing on FamilyDashboard

`/family/:id/dashboard` is registered outside `AppLayout` in `App.tsx`, so `BottomNav` never renders. The fix is to add `BottomNav` directly to `FamilyDashboard.tsx` itself, consistent with how other sub-pages that need it handle the nav.

This avoids restructuring App.tsx routing and keeps FamilyDashboard self-contained with its own header + bottom nav.

**Fix**: Import and render `<BottomNav />` at the bottom of `FamilyDashboard.tsx`, and adjust `pb-24` on `<main>` to `pb-28` to account for the nav bar height.

---

## Issue 3 (Bug): Back button bounces user back to dashboard

`navigate('/family')` sends the user to the `/family` pillar page, which immediately redirects back to `/family/:id/dashboard` (because the user is in exactly 1 family). This creates an infinite bounce.

The correct fix is to use `navigate(-1)` (browser history back). If the user navigated to the dashboard from the bottom nav or directly, this will correctly go back to the previous page. As a safety fallback, if there is no browser history entry, it can fall back to `/dashboard`.

**Fix**: In `FamilyDashboard.tsx`, change the back button handler from `navigate('/family')` to `navigate(-1)`.

---

## Files Changed

### File 1: New DB migration
Re-create `get_family_leaderboard` with:
- Fully qualified `quran_daily_log.user_id` inside the streak CTE
- `fps` LEFT JOIN scoped to `fps.family_id = p_family_id`

### File 2: `src/pages/family/FamilyDashboard.tsx`
- Import `BottomNav` from `@/components/BottomNav`
- Add `<BottomNav />` at the bottom of the returned JSX
- Change back button `onClick` from `navigate('/family')` to `navigate(-1)`
- Change `pb-24` on `<main>` to `pb-28`

---

## Build Sequence

1. DB migration — fix RPC function (fixes leaderboard and Today's Snapshot in one go)
2. `FamilyDashboard.tsx` — add BottomNav + fix back button

No other files need changes.

## Expected Result After Fix
- Leaderboard shows VibeCoder (and all members) correctly
- Today's Snapshot populates from the same leaderboard data
- Bottom navigation bar visible on the family dashboard
- Back button navigates correctly to previous page
