

# Enhanced Admin User Management

## Current State
The AdminUsers page is basic: a table with name, country, focus areas, onboarding status, join date, and a disable/enable toggle. No filters, no user detail view, no role management, no activity data.

## Enhancements

### 1. User Detail Panel (Slide-out Sheet)
Click any user row to open a side panel showing:
- Avatar + display name + ID (copyable)
- Gender, city, country
- Consistency level, focus areas (all displayed)
- Onboarding status + step number
- Join date + last activity date (from `user_activity` table)
- Role badge (admin/moderator/user) with ability to assign/remove roles
- Disable/enable toggle inside the panel
- Activity log: last 10 actions from `user_activity` for that user

### 2. Filters Bar
Add filter dropdowns above the table:
- **Country filter**: dropdown of distinct countries from profiles
- **Onboarding status**: All / Completed / Not completed
- **Role filter**: All / Admin / Moderator / User (no role)
- **Status filter**: All / Active / Disabled

### 3. Role Management
- Show role badge in the table (admin/moderator/user)
- In the detail panel: dropdown to assign or remove a role
- Inserts/deletes from `user_roles` table
- All role changes logged to `admin_audit_log`

### 4. Last Active Column
- Query `user_activity` to get each user's most recent activity timestamp
- Display as relative time ("2h ago", "3 days ago") in the table
- Sortable column

### 5. Bulk Summary Stats
Above the table, show quick stat cards:
- Total users
- Active today (from user_activity)
- Onboarding completion rate
- Disabled users count

### 6. Enhanced CSV Export
Add columns to export: Gender, Consistency Level, Role, Last Active

## Technical Details

### Files Modified
- `src/pages/admin/AdminUsers.tsx` -- full rewrite with all enhancements above

### Data Fetching
- Profiles: `supabase.from('profiles').select('*')` (admin RLS allows reading all)
- Roles: `supabase.from('user_roles').select('*')` -- join client-side with profiles by user_id
- Last active: use a new RPC `admin_user_last_active()` that returns `user_id, last_active` from `user_activity` (avoids N+1 queries)

### New Database Function
- `admin_user_last_active()` -- SECURITY DEFINER function that returns the max `created_at` per user from `user_activity`, restricted to admin callers

### UI Components Used
- Sheet (slide-out panel) from existing `@/components/ui/sheet`
- Select for filters from existing `@/components/ui/select`
- Badge for roles
- Card for summary stats
- Existing table markup (enhanced)

### Implementation Sequence
1. Create `admin_user_last_active()` database function
2. Rewrite AdminUsers with filters, role column, last active column, summary stats
3. Add user detail Sheet with role management and activity log
4. Audit log all role changes

