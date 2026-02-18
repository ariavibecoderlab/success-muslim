

# Plan: Custom Fasting Timer + Ramadan Feature Enhancements

This is a large feature set covering 4 major additions. Here's the breakdown:

---

## 1. Custom Fasting with Date/Time Picker (like the reference image)

Redesign the IF Timer page (`src/pages/health/HealthIFTimer.tsx`) to support custom start/end date+time selection:

- Add a "Fasting Custom" mode where users pick a **Start date+time** and **End date+time** using scroll-wheel style pickers (similar to the reference screenshot)
- Show "Total Fasting Time" at the top with a live countdown timer
- Include **Delete** and **Save** buttons at the bottom
- The timer runs based on the selected start/end rather than just "start now"
- Reuse the existing circular progress ring for the active timer display

**Files:** `src/pages/health/HealthIFTimer.tsx`, `src/lib/health-storage.ts` (update to store custom start/end times)

---

## 2. Selawat & Dzikir Counter (Target: 1,000 each)

Enhance the Ramadan Optimizer page (`src/pages/deen/RamadanOptimizer.tsx`):

- Add **Selawat counter** with target 1,000 and **Dzikir counter** with target 1,000
- Show progress bars with daily tracking
- Add +10, +33 increment buttons
- Store in `ramadan_daily_log` table (add `selawat_count` and extra fields via migration)

**Database migration:** Add `selawat_count integer NOT NULL DEFAULT 0` to `ramadan_daily_log` table.

---

## 3. Tarawih Tracking + Solat Sunnah Tracker

Enhance Ramadan Optimizer with:

- **Tarawih selection**: Choose between 8 or 20 rakaat, track completion
- **Solat Sunnah checklist**: Witir, Rawatib, Taubat, Hajat, Dhuha -- daily tick/check system
- Store sunnah solat completions in `ramadan_daily_log` (add `sunnah_solat jsonb DEFAULT '[]'` column)

**Database migration:** Add `sunnah_solat jsonb NOT NULL DEFAULT '[]'::jsonb` to `ramadan_daily_log` table.

---

## 4. Daily Da'wah Tab

Create a new dedicated page at `/iman/dakwah`:

- New page `src/pages/deen/DailyDakwah.tsx`
- Tagline: "Deliver even from 1 ayat"
- Display a daily da'wah poster (admin-uploadable via a new `dakwah_posters` table)
- Users can **download** the poster and **share** to social media (Web Share API)
- Clean, motivating Ramadan-themed UI
- Add link to the Iman page grid and route in `App.tsx`

**Database migration:** Create `dakwah_posters` table with columns: `id`, `user_id` (uploader), `image_url`, `title`, `date`, `created_at`. Enable Storage bucket for poster images.

---

## Technical Summary

### Database Migrations (3 total):
1. `ALTER TABLE ramadan_daily_log ADD COLUMN selawat_count integer NOT NULL DEFAULT 0;`
2. `ALTER TABLE ramadan_daily_log ADD COLUMN sunnah_solat jsonb NOT NULL DEFAULT '[]'::jsonb;`
3. Create `dakwah_posters` table with RLS policies

### New Files:
- `src/pages/deen/DailyDakwah.tsx`

### Modified Files:
- `src/pages/health/HealthIFTimer.tsx` -- custom date/time fasting
- `src/pages/deen/RamadanOptimizer.tsx` -- selawat, dzikir 1000, tarawih 8/20, sunnah solat checklist
- `src/pages/Deen.tsx` -- add Da'wah card to grid
- `src/App.tsx` -- add `/iman/dakwah` route
- `src/lib/health-storage.ts` -- support custom start/end time for fasting

