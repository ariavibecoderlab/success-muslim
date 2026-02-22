## Family Module Fixes -- Implementation Plan

This plan addresses all 8 items from the request in priority order. Changes span 1 database migration and 7 file edits.  
  
Skip the implemented

---

### CRITICAL FIXES

#### 1. Per-Category Privacy Toggles (RPC + UI)

**Database migration:** Replace the `get_family_leaderboard` RPC to wrap each metric in `CASE WHEN COALESCE(fps.show_X, true) THEN ... ELSE 0 END`. The `iman_score` will also only count visible categories. This means if a member sets `show_prayer = false`, their `prayers_this_week` returns `0` to all viewers.

**LeaderboardCard.tsx:** Show "--" instead of "0" when a metric is hidden. Add a new `show_prayer`/`show_quran`/`show_fasting`/`show_streaks` fields to the RPC return type and `LeaderboardEntry` interface so the UI can distinguish "0 prayers" from "hidden."

**TodaySnapshot.tsx:** Same logic -- show a dash/lock icon for hidden categories instead of empty circle.

**MemberProfile.tsx:** Currently shows all stats for other members. Will check the returned privacy flags and show "--" or "Private" for hidden categories on other members' profiles.

**useFamilyDashboard.ts:** Update `LeaderboardEntry` interface to include the 4 new boolean fields from the RPC.

#### 2. Prevent Admin-Less Group

**useFamily.ts (`leaveFamily`):** Before deleting membership, query admins and total members. If sole admin with other members, show toast and return false.

**FamilySettings.tsx (`handleLeave`):** The `leaveFamily` hook handles validation. Additionally, show inline warning text near the Leave button when the user is the sole admin with other members, suggesting they transfer admin first.

#### 3. Deduplicate Feed Events

**Database migration (same migration):** Add a unique index on `(family_id, user_id, activity_type, created_at::date)` to prevent duplicates at DB level. Use `CREATE UNIQUE INDEX ... ON family_activity_feed (family_id, user_id, activity_type, (created_at::date))`.

**family-feed.ts:** Before inserting, check for existing same-day entry with same user + activity_type + family. Skip if found. For streak milestones, also match on message to allow different milestone values.

---

### IMPORTANT FIXES

#### 4. Fix "Today's Snapshot" -- Show Real Today Data

**Database migration (same migration):** Add a new RPC `get_family_today_snapshot` that returns per-member today-specific data:

- `prayers_today` (count of prayers logged today, max 5)
- `quran_today` (boolean -- has quran_daily_log for today with target_met)
- `fasting_today` (boolean -- has fasting_log entry for today)
- `dhikr_today` (sum of dhikr_sessions count for today)

Also respects privacy toggles. Returns only non-ghost members.

**useFamilyDashboard.ts:** Add `TodaySnapshotEntry` interface and `todaySnapshot` state. Load via new RPC.

**TodaySnapshot.tsx:** Update to use new `TodaySnapshotEntry` type with today-specific data. Show "3/5" for prayers, checkmark for quran, moon for fasting, dhikr count.

**FamilyDashboard.tsx:** Pass `todaySnapshot` data instead of leaderboard data to the Today's Snapshot section.

#### 5. Add Dhikr to Leaderboard

**Database migration (same migration):** Add `dhikr_this_week` to the `get_family_leaderboard` RPC return. Sum `dhikr_sessions.count` for the current week. Add dhikr weight to iman_score (up to 10 points: count/100 * 2, capped at 10). Respect `show_health` or add a new `show_dhikr` toggle (reuse `show_health` since dhikr is spiritual, not health -- actually better to always show dhikr on leaderboard or tie to a general toggle). Will tie to `show_prayer` since dhikr is ibadah.

Actually, dhikr is its own category. Since there's no `show_dhikr` column, we'll add it to the RPC unconditionally (dhikr is always visible unless ghost_mode). This is the simplest approach.

**LeaderboardCard.tsx:** Add dhikr count display.

**useFamilyDashboard.ts:** Add `dhikr_this_week` to `LeaderboardEntry`.

#### 6. Add Feed Comments

**Database migration (same migration):** Create `family_comments` table:

- `id` uuid PK
- `feed_id` uuid NOT NULL (references family_activity_feed)
- `user_id` uuid NOT NULL
- `message` text NOT NULL
- `created_at` timestamptz DEFAULT now()

RLS: Members can insert (own user_id + must be member of the feed's family). Members can view (same family check). Users can delete own comments.

**ActivityFeedItem.tsx:** Add "Comment" button. Show inline text input on tap. Display existing comments below reactions.

**useFamilyDashboard.ts:** Load comments alongside feed items. Add `postComment` function.

#### 7. Leaderboard Reset Countdown

**FamilyDashboard.tsx:** Calculate time until next Sunday midnight. Show "Resets in X days Y hours" below the leaderboard header. Pure frontend calculation, no DB changes.

#### 8. Delete Family Group (Admin)

**FamilySettings.tsx:** Add "Delete Group" section (admin only). Show confirmation dialog requiring the user to type the group name. On confirm, delete all family_members, then delete the family row. Navigate to /family.

---

### Files Changed Summary

```text
+-----------------------------------------------+--------------------------------------------+
| File                                          | Changes                                    |
+-----------------------------------------------+--------------------------------------------+
| Database migration                            | Update get_family_leaderboard RPC          |
|                                               | (privacy + dhikr), add                     |
|                                               | get_family_today_snapshot RPC,             |
|                                               | add unique index on feed,                  |
|                                               | create family_comments table               |
+-----------------------------------------------+--------------------------------------------+
| src/hooks/useFamilyDashboard.ts               | Update LeaderboardEntry (privacy flags,    |
|                                               | dhikr), add TodaySnapshotEntry,            |
|                                               | load today snapshot, load comments,        |
|                                               | postComment function                       |
+-----------------------------------------------+--------------------------------------------+
| src/hooks/useFamily.ts                        | Add last-admin guard in leaveFamily        |
+-----------------------------------------------+--------------------------------------------+
| src/lib/family-feed.ts                        | Add dedup check before insert              |
+-----------------------------------------------+--------------------------------------------+
| src/components/family/LeaderboardCard.tsx      | Show "--" for hidden categories,           |
|                                               | add dhikr display                          |
+-----------------------------------------------+--------------------------------------------+
| src/components/family/TodaySnapshot.tsx        | Use TodaySnapshotEntry with today data     |
+-----------------------------------------------+--------------------------------------------+
| src/components/family/ActivityFeedItem.tsx     | Add comment button + comment display       |
+-----------------------------------------------+--------------------------------------------+
| src/pages/family/FamilyDashboard.tsx           | Pass today snapshot, reset countdown       |
+-----------------------------------------------+--------------------------------------------+
| src/pages/family/FamilySettings.tsx            | Sole-admin warning, delete group           |
+-----------------------------------------------+--------------------------------------------+
| src/pages/family/MemberProfile.tsx             | Respect privacy flags on stats             |
+-----------------------------------------------+--------------------------------------------+
| PROGRESS.md                                   | Update with audit fixes                    |
+-----------------------------------------------+--------------------------------------------+
```

### Technical Details

**RPC privacy wrapping pattern:**

```sql
CASE WHEN COALESCE(fps.show_prayer, true) THEN
  (SELECT COUNT(DISTINCT sl.date || sl.prayer_name) ...)
ELSE 0 END AS prayers_this_week,
COALESCE(fps.show_prayer, true) AS show_prayer,
```

**Dedup unique index:**

```sql
CREATE UNIQUE INDEX idx_feed_dedup 
ON family_activity_feed (family_id, user_id, activity_type, (created_at::date));
```

**Last-admin guard:**

```typescript
const { data: admins } = await supabase
  .from('family_members').select('user_id')
  .eq('family_id', familyId).eq('role', 'admin');
const { count: total } = await supabase
  .from('family_members').select('*', { count: 'exact', head: true })
  .eq('family_id', familyId);
if (admins?.length === 1 && admins[0].user_id === user.id && (total ?? 0) > 1) {
  toast({ title: 'Transfer admin first', description: '...', variant: 'destructive' });
  return false;
}
```

**Reset countdown (pure frontend):**

```typescript
const now = new Date();
const nextSunday = new Date(now);
nextSunday.setDate(now.getDate() + (7 - now.getDay()));
nextSunday.setHours(0, 0, 0, 0);
const diff = nextSunday.getTime() - now.getTime();
const days = Math.floor(diff / 86400000);
const hours = Math.floor((diff % 86400000) / 3600000);
```