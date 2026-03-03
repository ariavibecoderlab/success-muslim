

## Remove Group Limit

Two places in `src/hooks/useFamily.ts` enforce a 2-group limit. Both need to be removed.

### Changes to `src/hooks/useFamily.ts`

**1. `createFamily` function (lines 90-98)** -- Remove the count check and toast:
```typescript
// DELETE these lines:
const { count } = await supabase
  .from('family_members')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id);

if ((count ?? 0) >= 2) {
  toast({ title: 'Limit reached', description: 'You can be in at most 2 family groups.', variant: 'destructive' });
  return null;
}
```

**2. `joinFamily` function (lines 138-147)** -- Remove the same count check:
```typescript
// DELETE these lines:
const { count: myCount } = await supabase
  .from('family_members')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id);

if ((myCount ?? 0) >= 2) {
  toast({ title: 'Limit reached', description: 'You can be in at most 2 family groups.', variant: 'destructive' });
  return null;
}
```

Also check `CreateFamily.tsx` for any UI text mentioning the limit -- the current file doesn't reference it, so no changes needed there.

Single file modified: `src/hooks/useFamily.ts`
