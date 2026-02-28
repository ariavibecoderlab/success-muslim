

## Add Class Group Type + Redesign Family Module UI

### Part 1: Database Migration

**Migration: Add `group_type` column to `families` table**
```sql
ALTER TABLE families ADD COLUMN group_type text NOT NULL DEFAULT 'family';
```
No new RLS policies needed -- existing policies cover the column automatically.

### Part 2: Shared Terminology Helper

**New file: `src/lib/family-helpers.ts`**

A utility module that returns the correct terminology based on `group_type`:
- `getGroupTerms(groupType)` returns `{ adminLabel, memberLabel, icon, gradient, badgeColor, groupLabel, inviteMessage }`
- Family: Admin/Member, Home icon, green gradient, "Family"
- Class: Teacher/Student, GraduationCap icon, blue gradient, "Class"

### Part 3: Update `useFamily` Hook

**File: `src/hooks/useFamily.ts`**
- Add `group_type` field to `Family` interface (default: `'family'`)
- Update `createFamily(name, groupType)` to accept and pass `group_type` to the insert

### Part 4: Create Group Flow (Type Selector)

**File: `src/pages/family/CreateFamily.tsx`**
- Add a `groupType` state (`'family' | 'class' | null`, starts `null`)
- When `null`, show type selector screen with two large cards:
  - Home icon + "Family" + "For family members" (green gradient)
  - GraduationCap icon + "Class" + "For teachers and students" (blue gradient)
- After selecting type, show the existing name input flow
- Pass `groupType` to `createFamily(name, groupType)`
- Success screen terminology adapts: "Family Created!" vs "Class Created!", "family group" vs "class group"
- Share text adapts: "Join my family group..." vs "Join my class..."

### Part 5: Redesign Family List Page (`/family`)

**File: `src/pages/Family.tsx`**
- Add `framer-motion` animations (staggered fade-up)
- Header: "My Groups" with gradient text
- Each group card becomes a gradient card:
  - Family type: green gradient (`from-emerald-500 to-emerald-600`)
  - Class type: blue gradient (`from-blue-500 to-blue-600`)
  - Shows: name, member count, role label (Admin/Teacher/Member/Student), white text
- "Create Group" button: gradient green, prominent
- Empty state: colorful with matching Health page energy

### Part 6: Redesign Family Dashboard

**File: `src/pages/family/FamilyDashboard.tsx`**
- **Header banner**: Gradient based on group_type (green for family, blue for class), shows group name + type icon + member count
- **Announcement banner**: Amber gradient card with Megaphone icon, "Teacher says:" for class, "Admin says:" for family
- **Leaderboard section**: Wrap each `LeaderboardCard` in `motion.div` with staggered slide-in-from-right
- **Today's Snapshot**: Replace single card with 2x2 colorful grid (Prayers green, Quran blue, Fasting purple, Streak orange)
- **Activity Feed**: Each item gets colored left border based on `activity_type`
- All sections: `motion.div` with fadeUp + viewport once

### Part 7: Redesign LeaderboardCard

**File: `src/components/family/LeaderboardCard.tsx`**
- Rank 1: Gold gradient card (`from-yellow-400 to-amber-500`) with white text + subtle glow animation
- Rank 2: Silver gradient (`from-slate-300 to-slate-400`)
- Rank 3: Bronze gradient (`from-amber-600 to-amber-700`)
- Others: Clean white/card cards
- Add framer-motion wrapper

### Part 8: Redesign TodaySnapshot

**File: `src/components/family/TodaySnapshot.tsx`**
- Transform into a colorful 2x2 grid per member (or keep per-member row but with colorful status dots/pills)
- Prayer: green pill, Quran: blue pill, Fasting: purple pill, Streak: orange pill

### Part 9: Redesign ActivityFeedItem

**File: `src/components/family/ActivityFeedItem.tsx`**
- Add colored left border based on activity_type:
  - Achievement: green (`border-l-emerald-500`)
  - Streak: amber (`border-l-amber-500`)
  - Milestone: purple (`border-l-purple-500`)
  - Default: primary
- Reaction buttons: colorful emoji-style pills

### Part 10: Update Settings, Join, MemberProfile Pages

**File: `src/pages/family/FamilySettings.tsx`**
- Title adapts: "Family Settings" vs "Class Settings"
- Role labels: "Admin" vs "Teacher", members labeled accordingly
- Colorful section headers with matching group gradient
- Privacy toggles with colored icons

**File: `src/pages/family/JoinFamily.tsx`**
- Title: "Join Group" (generic)
- Preview card adapts gradient based on group_type

**File: `src/pages/family/MemberProfile.tsx`**
- Colorful header matching group type gradient
- Stats in colorful metric cards (like Health page rings)

### Part 11: Update PROGRESS.md

Add entries for:
- Class Mode implementation (group_type column, type selector, terminology)
- Family Module UI redesign (colorful gradients, animations, Health-style layout)

---

### Technical Notes

**Files to create:**
- `src/lib/family-helpers.ts`

**Files to modify:**
- `src/hooks/useFamily.ts` -- add group_type to interface + createFamily
- `src/hooks/useFamilyDashboard.ts` -- no changes needed (data unchanged)
- `src/pages/Family.tsx` -- full redesign with gradients + animations
- `src/pages/family/CreateFamily.tsx` -- type selector step + terminology
- `src/pages/family/FamilyDashboard.tsx` -- full redesign
- `src/pages/family/FamilySettings.tsx` -- terminology + styling
- `src/pages/family/JoinFamily.tsx` -- terminology + styling
- `src/pages/family/MemberProfile.tsx` -- colorful styling
- `src/components/family/LeaderboardCard.tsx` -- gradient rank cards
- `src/components/family/TodaySnapshot.tsx` -- colorful grid
- `src/components/family/ActivityFeedItem.tsx` -- colored borders
- `PROGRESS.md`

**Database migration:**
- One `ALTER TABLE` adding `group_type` text column with default `'family'`

**Animation patterns (matching Health page):**
- `fadeUp` variant with staggered delay
- `staggerContainer` + `staggerItem` for lists
- `motion.div` with `initial="hidden" animate="visible"` viewport trigger
- Rank 1 gold pulse: `animate={{ scale: [1, 1.02, 1] }}` with infinite repeat

