

## Fix: "Last Read" Not Updating After Reading in SurahReader

### Problem
When you read up to Al-Baqarah ayah 75 in the reader and navigate back to `/iman/quran`, the "Last Read" card still shows ayah 61. This happens because:

1. The SurahReader saves your actual reading position (ayah 75) to `quran_preferences` when you leave the page.
2. But the dashboard's "Last Read" display pulls from the most recent entry in `quran_reading_log` (which has end_ayah=61 from a manually logged session).
3. The `quran_preferences` value is only used as a fallback when there are zero log entries -- so it's ignored.

### Solution
Update the `lastPosition` logic in `useQuranReadingLog.ts` to compare both sources (latest log entry vs. `quran_preferences`) and use whichever represents a more advanced position. This way, passive reading in SurahReader correctly updates "Last Read" even without creating a manual log entry.

### Technical Details

**File: `src/hooks/useQuranReadingLog.ts`** (lines 67-71)

Change the `lastPosition` memo to compare the global ayah index of the latest log entry against the position saved in `quran_preferences`, and return whichever is further ahead:

```typescript
const lastPosition = useMemo(() => {
  const prefPos = { surah: prefs.last_surah, ayah: prefs.last_ayah };
  if (logs.length === 0) return prefPos;

  const latest = logs[0];
  const logPos = { surah: latest.end_surah, ayah: latest.end_ayah };

  // Use whichever position is further in the Quran
  const logIdx = globalAyahIndex(logPos.surah, logPos.ayah);
  const prefIdx = globalAyahIndex(prefPos.surah, prefPos.ayah);
  return prefIdx > logIdx ? prefPos : logPos;
}, [logs, prefs.last_surah, prefs.last_ayah]);
```

This is a single-line-level change in one file. No database or migration changes needed.

