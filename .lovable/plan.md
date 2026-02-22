

## Final Verification + Quran Hijri Monthly Target

### Verification Results

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Editable end time when ending IF fast | Working | Date/time pickers in review screen, real-time duration, validation, `stopIF` accepts override |
| 2 | Backdate (90 days) across ALL modules | Working | All 13 modules have `BackdateDatePicker` + `BackdatePrompt` |
| 3 | Quran monthly target follows Hijri calendar | Not implemented | Currently uses daily targets only. Needs new feature (see below) |
| 4 | Hijri date follows JAKIM standard | Working | `useHijriDate` hook fetches JAKIM API, falls back to algorithmic conversion |
| 5 | No "Edit with Lovable" button on production | User action required | Toggle "Hide Lovable Badge" in Lovable project Settings. Cannot be removed via code |
| 6 | Family invite link shows successmuslim.app | Working | `useFamily.ts` line 115: `https://www.successmuslim.app/family/join/...` |
| 7 | No Lovable branding on login page | Working | Auth.tsx uses Moon icon + "Success Muslim" branding. OAuth consent screen shows Lovable (expected Cloud behavior) |

### New Feature: Quran Hijri Monthly Target

Add a monthly page goal that resets on the 1st of each Hijri month.

#### How it works

- Use `useHijriDate()` to get current Hijri month/year
- Show a "Monthly Goal" card on the Quran Reader page (View B - the main tracker view)
- Default goal: 100 pages/month (configurable)
- Progress bar showing pages read this Hijri month vs target
- Resets automatically when Hijri month changes
- Monthly goal stored in `quran_preferences` (new column: `monthly_page_goal`)

#### Data aggregation

- Sum `page_count` from `quran_reading_log` entries where the Gregorian date falls within the current Hijri month
- Use the algorithmic Hijri converter to determine which Hijri month each log date belongs to
- This avoids needing a new DB table -- just aggregates existing reading log data

#### Changes

| File | Change |
|------|--------|
| `src/pages/deen/QuranReader.tsx` | Add Monthly Goal card showing Hijri month progress, settings to change goal |
| `src/hooks/useQuranReadingLog.ts` | Add `getHijriMonthPages(month, year)` computed value that sums pages for dates in the current Hijri month |
| `src/hooks/useQuranData.ts` | Add `monthly_page_goal` to `QuranPrefs` interface and defaults |
| `PROGRESS.md` | Update with verification results + new feature status |

#### DB migration

Add `monthly_page_goal` column to `quran_preferences` table:

```sql
ALTER TABLE quran_preferences 
ADD COLUMN monthly_page_goal integer DEFAULT 100;
```

#### UI design

A card below the daily stats showing:
- Hijri month name + year (e.g., "Sha'ban 1447")
- Progress bar: "42 / 100 pages"
- Percentage complete
- Pace indicator: "On track" / "Behind" / "Ahead" based on day-of-month vs expected progress
- Gear icon to change monthly target

