

## Fix: Family Invite Links Using Wrong Domain

### Root Cause

Two separate issues:
1. The share function in `FamilySettings.tsx` reads `family.invite_link` from the database. Families created before the domain fix still have `https://success-muslim.lovable.app/...` stored.
2. The `CreateFamily.tsx` post-creation screen also reads `created.invite_link` from the DB response, which is correct for new families but the pattern is fragile.

### Solution

Stop relying on the stored `invite_link` from the database. Instead, always construct the link dynamically from the invite code + production domain constant.

### Changes

| File | Change |
|------|--------|
| `src/pages/family/FamilySettings.tsx` | In `handleShare`, construct the link as `https://www.successmuslim.app/family/join/${family.invite_code}` instead of using `family.invite_link` |
| `src/pages/family/CreateFamily.tsx` | Same approach: construct the invite link from the code rather than reading from DB response |
| Database migration | Update existing records: `UPDATE families SET invite_link = 'https://www.successmuslim.app/family/join/' || invite_code WHERE invite_link LIKE '%success-muslim.lovable.app%';` |

### Technical Detail

A shared constant `PRODUCTION_DOMAIN` could be introduced, but since only two files use it and `useFamily.ts` already hardcodes the same URL, the simplest approach is to construct the URL inline in the two affected files. The DB migration fixes all existing records so the stored values are also correct going forward.

