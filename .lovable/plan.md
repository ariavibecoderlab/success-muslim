

## Fix 3 Priority Issues in Family Module

### Issue 1: Per-Category Privacy Toggles Actually Filter Data

**Problem:** Users can toggle `show_prayer`, `show_quran`, `show_fasting`, `show_streaks` in privacy settings, but the `get_family_leaderboard` RPC ignores these and returns all data. The dashboard UI also displays everything regardless.

**Fix (2 parts):**

**A. Update the `get_family_leaderboard` RPC (database migration)**

Modify the RPC to respect privacy settings. When a member has `show_prayer = false`, their `prayers_this_week` returns as `0`. Same for quran, fasting, and streaks. The `iman_score` is recalculated based only on visible categories. This way the data is filtered at the source.

Key changes in the SQL function:
- `prayers_this_week`: wrap in `CASE WHEN COALESCE(fps.show_prayer, true) THEN ... ELSE 0 END`
- `quran_days_this_week`: wrap in `CASE WHEN COALESCE(fps.show_quran, true) THEN ... ELSE 0 END`
- `fasting_days_this_week`: wrap in `CASE WHEN COALESCE(fps.show_fasting, true) THEN ... ELSE 0 END`
- `quran_streak`: wrap in `CASE WHEN COALESCE(fps.show_streaks, true) THEN ... ELSE 0 END`
- `iman_score`: recalculate using only the visible categories

**B. Update `TodaySnapshot.tsx` and `LeaderboardCard.tsx`**

No UI changes needed since the RPC now returns zeroed-out values for hidden categories. The existing UI already handles zero values gracefully (shows empty circles, hides streak badges).

### Issue 2: Prevent Last Admin from Leaving

**Problem:** The last (or only) admin can leave a group, orphaning it with no admin to manage it.

**Fix (2 parts):**

**A. `src/hooks/useFamily.ts` -- Update `leaveFamily` function**

Before deleting the membership, check if:
1. The user is an admin
2. They are the only admin in the group
3. There are other members remaining

If all true, show a toast: "You're the only admin. Transfer admin role to another member before leaving." and return `false`.

If the user is the only admin AND the only member, allow leaving (the group becomes empty).

**B. `src/pages/family/FamilySettings.tsx` -- Update Leave button**

Add a check that disables or shows a warning on the Leave button when the current user is the sole admin with other members present. The `leaveFamily` function handles the validation, but the UI should also show context (e.g., "Transfer admin before leaving").

### Issue 3: Deduplicate Feed Events

**Problem:** The `postFamilyFeedEvent` function in `src/lib/family-feed.ts` can post duplicate events (e.g., "completed all 5 prayers today" posted multiple times on the same day).

**Fix: `src/lib/family-feed.ts` -- Add dedup check**

Before inserting a feed event, check if an event with the same `user_id`, `activity_type`, and same-day `created_at` already exists for that family. If it does, skip the insert.

For streak milestones, also match on the message (since a user could hit different streak milestones on different days, but shouldn't post the same milestone twice).

```text
Changes per file:
+------------------------------------------+----------------------------------------+
| File                                     | Change                                 |
+------------------------------------------+----------------------------------------+
| Database migration                       | Update get_family_leaderboard RPC      |
|                                          | to respect privacy toggles             |
+------------------------------------------+----------------------------------------+
| src/lib/family-feed.ts                   | Add dedup check before insert          |
+------------------------------------------+----------------------------------------+
| src/hooks/useFamily.ts                   | Add last-admin guard in leaveFamily    |
+------------------------------------------+----------------------------------------+
| src/pages/family/FamilySettings.tsx      | Show warning when sole admin tries     |
|                                          | to leave with other members present    |
+------------------------------------------+----------------------------------------+
```

### Technical Details

**RPC Migration SQL (simplified):**
```sql
-- Replace each metric with privacy-aware version:
CASE WHEN COALESCE(fps.show_prayer, true) THEN
  (SELECT COUNT(...) FROM salah_logs ...)
ELSE 0 END AS prayers_this_week,

-- iman_score recalculated with same conditionals
```

**Dedup query in family-feed.ts:**
```typescript
const today = new Date().toISOString().split('T')[0];
const { data: existing } = await supabase
  .from('family_activity_feed')
  .select('id')
  .eq('family_id', familyId)
  .eq('user_id', userId)
  .eq('activity_type', activityType)
  .gte('created_at', `${today}T00:00:00Z`)
  .lt('created_at', `${today}T23:59:59.999Z`)
  .limit(1);

if (existing && existing.length > 0) return; // skip duplicate
```

**Last-admin guard in leaveFamily:**
```typescript
// Check if user is sole admin with other members
const { data: admins } = await supabase
  .from('family_members')
  .select('user_id')
  .eq('family_id', familyId)
  .eq('role', 'admin');

const { count: totalMembers } = await supabase
  .from('family_members')
  .select('*', { count: 'exact', head: true })
  .eq('family_id', familyId);

if (admins?.length === 1 && admins[0].user_id === user.id && (totalMembers ?? 0) > 1) {
  toast({ title: 'Transfer admin first', description: '...', variant: 'destructive' });
  return false;
}
```

