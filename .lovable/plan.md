
# Family Module — Phase 1 Build Plan

## Overview

Build a complete private family/group ibadah tracking system from scratch. Members can see each other's progress, motivate each other with reactions, and celebrate milestones together. The bottom nav gets a 6th tab (or the Family tab replaces its current placeholder page at `/family`).

The bottom nav currently has 6 tabs: Home, Iman, Health, Wealth, Tasks, Profile. The `/family` route already exists in `App.tsx` but is not in the bottom nav. We will add Family to the bottom nav as a 7th tab between Tasks and Profile — keeping all existing tabs.

---

## Architecture

```text
/family                    → FamilyHub (no family? → onboarding; has family → dashboard)
/family/create             → CreateFamily page
/family/join               → JoinFamily page (code entry)
/family/join/:code         → JoinFamily page (pre-filled from invite link)
/family/:id/dashboard      → FamilyDashboard (leaderboard, feed, milestones)
/family/:id/member/:uid    → MemberProfile (individual member view)
/family/:id/settings       → FamilySettings (admin: rename, remove members, transfer admin)
```

---

## Database Schema (Migration)

### New Tables

**`families`**
```sql
id uuid PK, name text, mode text DEFAULT 'family',
created_by uuid, invite_code text UNIQUE (6-char),
invite_link text, created_at timestamptz, updated_at timestamptz
```

**`family_members`**
```sql
id uuid PK, family_id uuid FK families,
user_id uuid, role text DEFAULT 'member' (admin/member),
joined_at timestamptz, is_visible boolean DEFAULT true
```
- Unique constraint: `(family_id, user_id)`

**`family_activity_feed`**
```sql
id uuid PK, family_id uuid FK families,
user_id uuid, activity_type text, message text,
created_at timestamptz
```
Activity types: `prayer_streak`, `quran_done`, `fasting_milestone`, `streak_milestone`

**`family_reactions`**
```sql
id uuid PK, feed_id uuid FK family_activity_feed,
user_id uuid, reaction_type text (dua/love/fire),
created_at timestamptz
```
- Unique constraint: `(feed_id, user_id, reaction_type)` — one reaction per type per user

**`family_announcements`**
```sql
id uuid PK, family_id uuid FK families,
admin_id uuid, message text, created_at timestamptz
```

**`family_privacy_settings`**
```sql
id uuid PK, user_id uuid UNIQUE, show_prayer boolean DEFAULT true,
show_quran boolean DEFAULT true, show_fasting boolean DEFAULT true,
show_health boolean DEFAULT false, show_streaks boolean DEFAULT true,
show_on_leaderboard boolean DEFAULT true, ghost_mode boolean DEFAULT false,
updated_at timestamptz
```

### RLS Policies

All tables protected with:
- `SELECT`: Only members of the same family
- `INSERT/UPDATE/DELETE`: Own records only (family_members admin checks for management)
- `families`: Readable by members via join; writable by creator/admin
- `family_privacy_settings`: Each user reads/writes their own row only

### Security: Family membership check

A `SECURITY DEFINER` function `is_family_member(family_id uuid)` to avoid RLS recursion when checking membership for other table policies.

---

## Files to Create

### Hooks
- `src/hooks/useFamily.ts` — core hook: load user's families, CRUD operations, invite code generation
- `src/hooks/useFamilyDashboard.ts` — leaderboard data (fetches member scores from DB), activity feed, reactions

### Pages
- `src/pages/Family.tsx` — **rewrite** existing placeholder → FamilyHub (router between "no family" state and dashboard)
- `src/pages/family/CreateFamily.tsx` — form: name input → creates DB row, generates 6-digit code, shows shareable link
- `src/pages/family/JoinFamily.tsx` — code entry or link param → shows preview → confirm join
- `src/pages/family/FamilyDashboard.tsx` — main family view: leaderboard cards, today's snapshot, activity feed
- `src/pages/family/MemberProfile.tsx` — individual member view (respects privacy settings)
- `src/pages/family/FamilySettings.tsx` — admin controls: rename, remove members, transfer admin, leave group

### Components
- `src/components/family/LeaderboardCard.tsx` — member ranked card (rank badge, Iman score, streak, prayer/quran status)
- `src/components/family/ActivityFeedItem.tsx` — single feed item with 3 reaction buttons (🤲 ❤️ 🔥)
- `src/components/family/TodaySnapshot.tsx` — per-member compact row showing prayer/quran/fast/streak
- `src/components/family/FamilyPrivacySettings.tsx` — toggle group for sharing preferences

---

## Navigation Change

**`src/components/BottomNav.tsx`** — add Family tab between Tasks and Profile:
```
Home | Iman | Health | Wealth | Tasks | Family | Profile
```
Use `Users` icon from lucide-react. This gives 7 tabs — each label gets slightly smaller text (`text-[9px]`) to fit. Alternatively, we keep 6 tabs by removing Wealth (unlikely). We keep all 7 and slightly tighten spacing.

---

## Key Implementation Details

### Invite Code Generation
- 6 uppercase alphanumeric characters (no O/0/I/1 for readability): generated on client, stored in DB, unique constraint enforced
- Invite link format: `https://success-muslim.lovable.app/family/join/{code}`

### Leaderboard Score
- Uses the existing `life-score.ts` Iman pillar score (prayer, quran, dhikr, sunnah, fasting)
- Problem: life score reads from localStorage (device-local), not DB
- Solution for leaderboard: query each member's DB records directly:
  - Prayers: count `salah_logs` for this week per member
  - Quran: check `quran_daily_log` for this week
  - Fasting: count `fasting_log` this week
  - Streak: count consecutive `quran_daily_log` `target_met` entries
- This requires a `SECURITY DEFINER` RPC `get_family_leaderboard(family_id uuid)` that returns member scores without exposing raw data to other users

### Activity Feed Auto-generation
- Feed items are written to `family_activity_feed` when events happen (not auto-triggered by DB — we write from client on user action)
- When user marks Quran done → write feed event
- When prayer streak milestone hit → write feed event
- Keep it simple: insert on key events, deduplicate with `ON CONFLICT`

### Privacy
- `family_privacy_settings` table — each user controls their own row
- Leaderboard RPC respects `show_on_leaderboard` and `ghost_mode` flags
- Member profile view checks privacy flags before showing sections

### Max Members
- Enforced in `joinFamily()` function: count members before insert, reject if ≥ 20

### Max Families Per User
- Enforced in `joinFamily()` / `createFamily()`: count user's memberships, reject if ≥ 2

---

## App.tsx Changes

Add routes:
```
/family/create             → CreateFamily (AuthGuard, no AppLayout)
/family/join               → JoinFamily (AuthGuard, no AppLayout)
/family/join/:code         → JoinFamily (AuthGuard, no AppLayout)
/family/:id/dashboard      → FamilyDashboard (AuthGuard, no AppLayout)
/family/:id/member/:uid    → MemberProfile (AuthGuard, no AppLayout)
/family/:id/settings       → FamilySettings (AuthGuard, no AppLayout)
```

The `/family` route inside `AppLayout` stays → becomes FamilyHub.

---

## PROGRESS.md Update

Add new Family Module section documenting all Phase 1 features as complete.

---

## Build Sequence

1. **DB Migration** — all 5 new tables + RLS + `is_family_member` function + `get_family_leaderboard` RPC
2. **`useFamily.ts` hook** — load families, create, join, leave, invite code
3. **`Family.tsx` rewrite** — hub: empty state → create/join CTA; or redirect to dashboard
4. **`CreateFamily.tsx`** — name form, generates invite code, saves to DB, shows shareable link
5. **`JoinFamily.tsx`** — code input or URL param, preview, confirm
6. **`FamilyDashboard.tsx`** — leaderboard (RPC), activity feed, today snapshot, announcement banner
7. **`LeaderboardCard.tsx`**, **`ActivityFeedItem.tsx`**, **`TodaySnapshot.tsx`** — sub-components
8. **`MemberProfile.tsx`** — individual expanded view with privacy gates
9. **`FamilySettings.tsx`** — admin panel: rename, remove, transfer, leave
10. **`FamilyPrivacySettings.tsx`** + add section to `Settings.tsx`
11. **`BottomNav.tsx`** — add Family tab
12. **`App.tsx`** — add all new routes
13. **`PROGRESS.md`** update

---

## UI/UX Principles Applied

- Warm green/primary colour palette — same as rest of app
- Leaderboard framed as "inspire each other" — rank medal icons (Gold/Silver/Bronze), no "loser" language
- Activity feed is good-news-only: completions, streaks, milestones only
- Privacy controls prominently accessible from Family Settings and Profile Settings
- Ghost mode toggle clearly labelled with reassuring copy
- All cards follow existing `Card` + `CardContent` patterns
- Lucide icons only — no hardcoded emojis in JSX (text strings like "🤲" are allowed in reaction buttons since they're user-facing Unicode, not icon components)
- Dark mode supported via existing Tailwind CSS variable system
