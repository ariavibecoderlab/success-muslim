

## Remove Aladhan API -- Use JAKIM as Single Source of Truth

This plan removes all Aladhan API references from the codebase, making JAKIM the sole source for prayer times, imsak, and Hijri dates. The local algorithmic Hijri conversion remains as an offline fallback.

### Changes

**1. Edge Function: `supabase/functions/jakim-proxy/index.ts`**
- Remove the entire Aladhan fallback block for `tarikhtakwim` (lines 60-82)
- Remove the entire Aladhan fallback block for `takwimsolat` (lines 84-144), including the `zoneCoords` mapping
- Keep only the JAKIM fetch logic -- if JAKIM fails, return 502 error (already handled)

**2. Client: `src/lib/prayer-times.ts`**
- Remove `fetchFromAladhan()` function entirely (lines 253-304)
- Remove the Aladhan fallback call on line 174-175
- Remove `'aladhan'` from the `source` type (line 17) -- simplify to just `'jakim'`
- When JAKIM fails, return `null` (the UI already handles this gracefully with cached data)

**3. UI: `src/pages/deen/PrayerTimes.tsx`**
- Update line 536: Change "Source: Aladhan API" text to "Source: JAKIM e-Solat" 

**4. Comment update: `src/lib/hijri.ts`**
- Update line 11 comment: Remove mention of "Aladhan as fallback" -- the proxy now only uses JAKIM, and the local algorithmic fallback handles failures

### What stays
- JAKIM proxy edge function (primary source)
- Local algorithmic Hijri conversion in `hijri.ts` (offline fallback)
- `sessionStorage` caching for Hijri dates
- `localStorage` caching for prayer times

### Technical notes
- Non-Malaysian users will get `null` from `fetchPrayerTimes()` since JAKIM only covers Malaysian zones. The UI should handle this -- currently it shows nothing, which is correct since this is a Malaysia-focused app.
- The `calculation_method`, `madhab`, and GPS coordinate settings in `PrayerSettings` become unused for API calls but can remain in the interface for future use.

