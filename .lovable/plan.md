

## Polish Prayer Times Page to Match Reference Design

Redesign the PrayerTimes page to match the dark-green, split-hero, checklist-style layout from the reference image.

### Key Visual Changes

**1. Hero Section — Split into two panels**
- **Left panel**: Shows current/next prayer name, time (large), and countdown ("Asr in 9m 55s")
- **Right panel**: Circular progress ring showing "X/5 prayed" with the salah count from `useTodaySalahCount()`
- Both panels sit side-by-side on a dark emerald gradient (`from-emerald-800 to-teal-900`)

**2. Date & Location Header (above hero)**
- "Today, 12 March" bold with Hijri date below ("22 Ramadan 1447")
- Location badge pill + calculation method badge pill below the date

**3. Imsak / Sunrise Info Bar**
- Small centered pill between hero and prayer list: "Imsak HH:MM | Sunrise HH:MM" (data from Aladhan Imsak/Sunrise if available, or hide if JAKIM source)

**4. Prayer List Rows — Checklist Style**
- Each row has: a **check circle** on the left (green filled if logged on-time/late, empty circle if pending/missed), prayer name with weather emoji icon, **"Now"** or **"in Xm"** badge, time on the right, and adhan bell icon
- Current prayer row gets a subtle green-tinted highlight background
- Integrate `useTodaySalahCount` / `useSalahLog` to show logged status per prayer
- Tapping the check circle toggles salah status (using `useSalahMutation`)

**5. Color & Theme Shift**
- Hero gradient: change from orange to dark emerald/teal (`from-emerald-700 to-teal-800`) per the app's spiritual card identity
- Prayer rows: use subtle rounded cards with border, green highlight for current

### Files Modified
- `src/pages/deen/PrayerTimes.tsx` — major layout restructure for hero split, checklist rows, date header, Imsak bar

### Data Dependencies
- Import `useSalahLog` and `useSalahMutation` from `@/hooks/useSalahQuery` for check circle state
- Import `getTodayKey` from `@/lib/calculations` for today's date key
- Countdown per-prayer ("in Xm Ys") calculated inline for the next prayer row

