

## Move RamadanBanner to Iman Page + Reorder QuickLogGrid

### Changes

#### 1. `src/pages/Dashboard.tsx`
- **Remove** `RamadanBanner` import and its render line (`{isRamadan && <RamadanBanner ...>}`)
- **Move** `<QuickLogGrid />` from after LifeScore to directly after `<HeroPrayerCard />`
- New order: AnnouncementsBanner → HeroPrayerCard → **QuickLogGrid** → DailyCheckinCard → LifeScore → ForYouSection → WidgetGrid → DailyQuoteCard

#### 2. `src/pages/Deen.tsx`
- **Import** `RamadanBanner` and `useHijriDate`
- **Add** `const { isRamadan, ramadanDay } = useHijriDate();` (hook already imported in this file)
- **Render** `{isRamadan && <RamadanBanner ramadanDay={ramadanDay} />}` right above the Prayer Times Hero Card (first element in `<main>`)
- The banner will conditionally appear at the very top of the Iman page during Ramadan, linking to `/health/fasting` as it currently does

#### 3. No other files affected
- `RamadanBanner.tsx` component stays unchanged
- `useHijriDate` already provides `isRamadan` and `ramadanDay`

