

## Auto-Promote Last Member to Admin

### Problem
When members leave and only 1 person remains, that person might be a regular "member" -- they can't see the Settings button on the dashboard, can't rename the group, and can't delete it.

### Changes

#### 1. `src/hooks/useFamily.ts` -- Auto-promote remaining member
In `leaveFamily`, after removing the user, if exactly 1 member remains, update their role to `'admin'`.

```typescript
// After existing count check
if (count === 1) {
  // Promote the sole remaining member to admin
  await supabase
    .from('family_members')
    .update({ role: 'admin' })
    .eq('family_id', familyId);
}
```

#### 2. `src/pages/family/FamilyDashboard.tsx` -- Show Settings for sole member
Change Settings button visibility from `isAdmin` to `isAdmin || family?.member_count <= 1` so even if the promotion hasn't refreshed yet, the sole member can access settings.

#### 3. `src/pages/family/FamilySettings.tsx` -- Treat sole member as admin
Derive effective admin status: `const effectiveAdmin = isAdmin || members.length <= 1` and use it for showing rename and admin controls.

### Files Modified

| File | Change |
|------|--------|
| `src/hooks/useFamily.ts` | Auto-promote last remaining member to admin in `leaveFamily` |
| `src/pages/family/FamilyDashboard.tsx` | Show Settings button for sole member |
| `src/pages/family/FamilySettings.tsx` | Treat sole member as effective admin |

