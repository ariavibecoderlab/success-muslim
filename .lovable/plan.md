

## Add Aladhan API for Non-Malaysian Users

Currently `fetchPrayerTimes()` returns `null` for non-Malaysian countries. We need to add the Aladhan API (free, no key required) as the international source, using Umm al-Qura (method 4) as default for non-MY users.

### Architecture

```text
fetchPrayerTimes(settings)
  ├─ Malaysia → JAKIM edge function (existing)
  └─ Other    → Aladhan API (new, direct call — no proxy needed)
```

### Plan

#### 1. `src/lib/prayer-times.ts` — Add Aladhan fetch

- Add `fetchFromAladhan()` function that calls `https://api.aladhan.com/v1/timingsByCity/{date}?city={city}&country={country}&method={method}&school={school}`
  - Map `madhab: 'shafi'` → `school=0`, `'hanafi'` → `school=1`
  - Default method for non-MY: `4` (Umm al-Qura) instead of current default `3`
  - Parse response: `data.timings.Fajr`, `.Dhuhr`, `.Asr`, `.Maghrib`, `.Isha` (format "HH:mm")
  - Extract hijri date from `data.date.hijri`
  - Return `PrayerTimesData` with `source: 'aladhan'`

- Update `fetchPrayerTimes()`: replace `return null` at line 175 with a call to `fetchFromAladhan()`

- Also support lat/lng: if `settings.latitude` and `settings.longitude` are set, use `/v1/timings/{timestamp}?latitude=&longitude=&method=&school=` instead of `timingsByCity`

#### 2. `src/lib/prayer-times.ts` — Update types

- Add `'aladhan'` to the `source` type: `source?: 'jakim' | 'aladhan'`

#### 3. No edge function needed

Aladhan API is publicly accessible with CORS support — direct browser fetch works fine. No proxy required.

### Files Modified
- `src/lib/prayer-times.ts` — Add `fetchFromAladhan()`, update `fetchPrayerTimes()` fallback, update source type

