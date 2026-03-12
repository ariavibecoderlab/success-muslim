

## Fix: Ramadan Banner Missing & Prayer Card Not Visible on Dashboard

### Root Causes

**1. Ramadan Banner** — The `RamadanBanner` component exists (`src/components/dashboard/RamadanBanner.tsx`) but is **not imported or used anywhere**. It was previously on the Iman page and got removed when we merged Ramadan info into the Iman hero card. It was never added to Dashboard.

**2. Prayer Card (HeroPrayerCard)** — Line 47: `if (!prayerData) return null;` causes the entire card to vanish if `fetchPrayerTimes()` returns null (network failure, no cache). No loading state, no fallback — just invisible. The network logs show zero requests to JAKIM or Aladhan APIs, meaning the fetch is either cached or silently failing.

### Plan

#### `src/pages/Dashboard.tsx`
- Import and render `RamadanBanner` above `HeroPrayerCard` when `isRamadan` is true
- Pass `ramadanDay` from the existing `useDashboardData()` hook (already available)

```tsx
{isRamadan && <RamadanBanner ramadanDay={ramadanDay} />}
<HeroPrayerCard />
```

#### `src/components/dashboard/HeroPrayerCard.tsx`
- Replace `if (!prayerData) return null;` with a skeleton loading card so the prayer section always occupies space and shows a loading state while data loads
- Add error handling: if fetch fails after 5 seconds, show a compact fallback card with "Tap to load prayer times" instead of nothing

### Files Modified
- `src/pages/Dashboard.tsx` — Add RamadanBanner during Ramadan
- `src/components/dashboard/HeroPrayerCard.tsx` — Show skeleton/fallback instead of returning null

