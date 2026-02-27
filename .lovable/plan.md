

## Add 90-Day Limit Guard to Fasting Calendar Pages

Both `HealthFasting.tsx` and `DeenFasting.tsx` currently allow toggling any past date without restriction. This plan adds a guard so dates older than 90 days are disabled and non-clickable.

### Changes

**1. HealthFasting.tsx (lines 7, 75-90)**

- Add `subDays`, `isBefore`, `startOfDay`, `isFuture` to the `date-fns` import
- Compute `const minDate = subDays(startOfDay(new Date()), 90)` at the top of the component
- In the calendar day button: compute `tooOld = isBefore(startOfDay(day), minDate)` and `future = isFuture(day)`
- Disable click: `onClick={() => !tooOld && !future && handleToggle(key)}`
- Add disabled styling: `opacity-40 cursor-not-allowed` when `tooOld || future`

**2. DeenFasting.tsx (lines 237-264)**

- Already imports `isFuture` and `isToday`; add `subDays`, `isBefore`, `startOfDay` to import
- Compute `const minDate = subDays(startOfDay(new Date()), 90)` at the top
- In the calendar day button: add `tooOld = isBefore(startOfDay(day), minDate)`
- Update click guard: `onClick={() => !future && !tooOld && handleToggle(key)}`
- Update disabled prop: `disabled={future || tooOld}`
- Update styling class to apply `opacity-40` for `tooOld` days (same as `future`)

### Files Modified
- `src/pages/health/HealthFasting.tsx`
- `src/pages/deen/DeenFasting.tsx`
