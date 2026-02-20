
# Fix: Remove `fps.family_id` from `get_family_leaderboard` RPC

## Root Cause

A previous migration attempted to scope the `family_privacy_settings` join by adding `AND fps.family_id = p_family_id`. However, the `family_privacy_settings` table has no `family_id` column — it only has `user_id`. This causes the runtime error:

```
column fps.family_id does not exist
```

## Fix

A single new database migration that replaces `get_family_leaderboard` and changes:

```sql
-- BROKEN (current)
LEFT JOIN family_privacy_settings fps
  ON fps.user_id = fm.user_id
  AND fps.family_id = p_family_id   -- ← column does not exist

-- FIXED
LEFT JOIN family_privacy_settings fps
  ON fps.user_id = fm.user_id       -- ← join on user_id only
```

Since `family_privacy_settings` is a single-row-per-user table (not per-family), joining only on `user_id` is correct. A user's privacy preferences apply globally across all families they belong to.

## File Changed

### New DB migration
Recreate `get_family_leaderboard` with the corrected LEFT JOIN — identical to the working version except `AND fps.family_id = p_family_id` is removed.

## No Frontend Changes Required

This is a pure database fix. The existing frontend code in `useFamilyDashboard.ts` calls `supabase.rpc('get_family_leaderboard', ...)` exactly as before — no changes needed there.

## Expected Result After Fix
- Leaderboard RPC executes without error
- Leaderboard and Today's Snapshot populate correctly on the Family Dashboard
- Privacy settings (`show_on_leaderboard`, `ghost_mode`) are respected per user
