

## WhatsApp-style Last Member: Leave & Delete Group

### Problem
Currently, if only 1 member remains in a group, they can leave but the `families` row becomes orphaned (no members but group still exists). Also, admin can't leave if they're the only admin with other members -- need to transfer first.

### Changes

#### 1. `src/hooks/useFamily.ts` -- Add `deleteFamily` function
Add a new function that deletes the family row (and cascading members via FK). Also update `leaveFamily` to auto-delete the family if the leaving user is the last member.

```typescript
const deleteFamily = async (familyId: string): Promise<boolean> => {
  // Delete all members first, then the family
  await supabase.from('family_members').delete().eq('family_id', familyId);
  const { error } = await supabase.from('families').delete().eq('id', familyId);
  if (error) { toast({...}); return false; }
  invalidate();
  toast({ title: 'Group deleted' });
  return true;
};
```

Update `leaveFamily`: after removing the user, check if 0 members remain. If so, auto-delete the family row.

#### 2. `src/pages/family/FamilySettings.tsx` -- Conditional UI
- If `members.length === 1` (last member): Show "Delete Group" button instead of "Leave Group"
- If admin with >1 members: Show "Leave Group" but warn they must transfer admin first
- Otherwise: Show normal "Leave Group"

The danger zone becomes:
- **1 member**: Single red "Delete & Leave Group" button → calls `deleteFamily`
- **Admin, >1 members**: "Leave Group" disabled with hint "Transfer admin role first", OR allow leave which auto-promotes oldest member
- **Non-admin**: Normal "Leave Group"

### Files Modified

| File | Change |
|------|--------|
| `src/hooks/useFamily.ts` | Add `deleteFamily`, update `leaveFamily` to cleanup empty groups |
| `src/pages/family/FamilySettings.tsx` | Conditional danger zone: delete vs leave based on member count |

