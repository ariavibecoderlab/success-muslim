
# Fix: Replace `navigate(-1)` with Explicit Routes in Family Module

## Root Cause
All back buttons in the family module use `navigate(-1)` (browser history). When a user arrives at `/family/[id]/dashboard` directly from the bottom nav tab, the history stack's previous entry is the dashboard itself, causing the loop. The fix is to replace every `navigate(-1)` call with a hardcoded explicit route.

## Route Map

| Page | Current | Fixed |
|---|---|---|
| `/family/[id]/dashboard` → Back | `navigate(-1)` | `navigate('/family')` |
| `/family/[id]/member/[uid]` → Back (header) | `navigate(-1)` | `navigate(\`/family/${familyId}/dashboard\`)` |
| `/family/[id]/member/[uid]` → Back (private fallback) | `navigate(-1)` | `navigate(\`/family/${familyId}/dashboard\`)` |
| `/family/[id]/settings` → Back (header) | `navigate(-1)` | `navigate(\`/family/${id}/dashboard\`)` |

`FamilySettings.tsx` line 70 already uses `navigate('/family')` for the leave-family action — this is correct and will not be changed.

## Files to Change

### 1. `src/pages/family/FamilyDashboard.tsx` — line 38
```tsx
// Before
<Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
// After
<Button variant="ghost" size="icon" onClick={() => navigate('/family')}>
```

### 2. `src/pages/family/MemberProfile.tsx` — lines 59 and 74
```tsx
// Line 59 — private profile fallback button
// Before
<Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
// After
<Button variant="outline" onClick={() => navigate(`/family/${familyId}/dashboard`)}>Go back</Button>

// Line 74 — header back button
// Before
<Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
// After
<Button variant="ghost" size="icon" onClick={() => navigate(`/family/${familyId}/dashboard`)}>
```

### 3. `src/pages/family/FamilySettings.tsx` — line 90
```tsx
// Before
<Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
// After
<Button variant="ghost" size="icon" onClick={() => navigate(`/family/${id}/dashboard`)}>
```

## Also: Update `PROGRESS.md`
Add an entry under the Family Module section marking the back button fix as complete.

## No Database Changes Required
This is a pure frontend routing fix — no schema or RLS changes needed.

## Verified Navigation Flow After Fix
1. User on `/family` → taps family card → lands on `/family/[id]/dashboard`
2. Taps **Back** → lands on `/family` ✅
3. From dashboard → taps a member → lands on `/family/[id]/member/[uid]`
4. Taps **Back** → lands on `/family/[id]/dashboard` ✅
5. From dashboard → taps Settings → lands on `/family/[id]/settings`
6. Taps **Back** → lands on `/family/[id]/dashboard` ✅
