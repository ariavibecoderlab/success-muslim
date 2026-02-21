# Quran Tracker — Updates (2026-02-21)

## Reading Log UI Improvements

### 1. Explicit Ayah / Page Labels
- **Log Entry List**: Each entry now shows a clear prefix — e.g. `Al-Baqarah · Ayah 78–286` or `Al-Baqarah · Page 25–42` — so users always know whether a range refers to ayahs or Mushaf pages.
- **Logging Form (By Ayah)**: The "To" input displays an **"Ayah"** label beneath the number.
- **Logging Form (By Page)**: Inputs are labeled **"From Page"** and **"To Page"**.

### 2. Singular / Plural Fix for "page"
All occurrences of page counts now correctly show **"1 page"** (singular) instead of "1 pages":
- Log entry summary row (e.g. `3 ayah · 1 page`)
- Success toast after logging/updating
- Today's summary card
- Live summary preview in the logging form

### 3. "Last Read" Position Fix
The dashboard's "Last Read" card now compares both:
1. The latest **manual log entry** (`quran_reading_log`)
2. The **passive reading position** saved by SurahReader (`quran_preferences`)

Whichever is further ahead in the Quran is displayed, so passive reading always updates the "Last Read" indicator correctly.

---

## Files Changed
| File | Change |
|------|--------|
| `src/pages/deen/QuranReader.tsx` | Added Ayah/Page labels, singular/plural "page" logic |
| `src/hooks/useQuranReadingLog.ts` | Updated `lastPosition` to compare log vs preferences |
