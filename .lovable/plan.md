

## Fix Back Button Navigation Across All Sub-Pages

### Root Cause
The Back button logic lives in a single shared component: `SubPageLayout.tsx` (line 47). Every sub-page passes a `backTo` prop (e.g., `backTo="/health"`), and the Back button does `navigate(backTo)`. This means it always goes to a hardcoded parent, not where the user actually came from.

### Solution
Fix it once in `SubPageLayout.tsx` -- no need to touch 30+ individual page files.

### Changes

**File: `src/components/SubPageLayout.tsx`**

Replace the Back button's `onClick` handler (line 47) with a history-aware function:

```typescript
const handleBack = () => {
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate(backTo); // fallback for direct URL access
  }
};
```

Then use `onClick={handleBack}` on the Back button.

The `backTo` prop stays in the interface as the fallback destination -- no changes needed to any sub-page files.

**File: `PROGRESS.md`**

Add entry documenting the fix.

### Why This Works
- Normal flow: user navigates from one page to another, `history.length > 1`, so `navigate(-1)` goes back correctly
- Direct URL access: no prior history, falls back to the parent route via `backTo`
- All 30+ sub-pages fixed automatically since they all use `SubPageLayout`

### Files Modified
- `src/components/SubPageLayout.tsx` (1 line change)
- `PROGRESS.md` (append entry)
