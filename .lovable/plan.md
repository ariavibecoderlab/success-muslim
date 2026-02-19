
# Fix: JAKIM Hijri Date Parsing

## Problem
The JAKIM API returns the `takwim` field as an object (e.g., `{"2026-02-19":"1447-09-01"}`), but the current code checks `json.takwim.length > 0` and tries to access `json.takwim[0].hijri` -- treating it as an array. This always fails silently, causing a fallback to the local algorithmic calculation which incorrectly returns "2 Ramadhan" instead of "1 Ramadhan".

## Fix
Update `fetchJakimHijriDate` in `src/lib/hijri.ts` to correctly parse the object structure:

1. Check if `json.takwim` is a non-null object
2. Get the first value from the object (the hijri date string like `"1447-09-01"`)
3. Split and parse it as before

## Technical Detail

Replace lines 36-46 in `src/lib/hijri.ts`:

```typescript
// Current (broken):
if (json.takwim && json.takwim.length > 0) {
  const entry = json.takwim[0];
  if (entry.hijri) { ... }
}

// Fixed:
if (json.takwim && typeof json.takwim === 'object') {
  const hijriStr = Object.values(json.takwim)[0] as string;
  if (hijriStr) {
    const parts = hijriStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      const monthName = HIJRI_MONTHS[month - 1] || '';
      return `${day} ${monthName} ${year} H`;
    }
  }
}
```

This single change will make the dashboard and Iman page correctly display **1 Ramadhan 1447 H** from the JAKIM API data.
