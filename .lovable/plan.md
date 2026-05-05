# /today Page — Muslim Pro Style + Logo FAB

Reference image (Muslim Pro home) jadi inspirasi visual & susunan. Aku adapt ke aesthetik **Refined Islamic Calm** (light mode, white + emerald + orange) — bukan dark theme reference.

## 1. Asset
- Copy `user-uploads://logo.svg` → `src/assets/sm-mark.svg` (untuk FAB, lebih tajam dari `.webp`).

## 2. `src/components/BottomNav.tsx` — FAB jadi Logo + Link
- Buang `SalahQuickLogSheet`, `useTodaySalahCount`, sheet state, badge logged.
- Tukar `<button>` FAB → `<Link to="/today">`.
- Render `<img src={smMark} />` di dalam bulatan FAB:
  - Bulatan 56x56, ring-4 background, shadow emerald.
  - Background putih (bukan gradient hijau lagi) supaya logo hijau menonjol — atau kekal gradient + logo putih. **Cadangan:** background gradient emerald kekal, logo invert ke putih (guna CSS filter atau versi putih SVG).
- Active state: bila `pathname === '/today'`, scale 1.05 + glow ring lebih tebal.
- Haptic light kekal pada tap.

## 3. Halaman Baru `src/pages/Today.tsx`
Susunan ikut reference, adapted:

```text
┌─────────────────────────────────────┐
│ [avatar] 18 Dhu'l-Qi'dah  🔔 🎁     │  ← greeting header (Hijri date)
├─────────────────────────────────────┤
│ ╭─ Daily Inspiration carousel ─╮    │  ← horizontal scroll round cards
│ │  ⊙   ⊙   ⊙   ⊙   ⊙           │     (link ke /iman/dakwah posters)
│ ╰──────────────────────────────╯    │
├─────────────────────────────────────┤
│ ┌──Now──────┐ ┌──Next─────┐         │  ← prayer cards 2-col
│ │ Maghrib🌅 │ │ Isha 🌙   │            (live from useNextPrayer hook)
│ │ 17:33     │ │ View →    │
│ └───────────┘ └───────────┘         │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │  ← Track prayer card
│ │ ◐ Track Maghrib prayer       → │ │     (progress 0/5, tap → SalahLog)
│ │   2/5 prayers tracked          │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Features                  [More →]  │
│ 🕋  🤲  📿  📖  📓  …               │  ← horizontal scroll features
│ Qibla Duas Tasbih Quran Journal     │     (link ke modul masing-masing)
├─────────────────────────────────────┤
│ For You                             │  ← daily ayah / hadith / dakwah feed
│ [card] [card] …                     │
└─────────────────────────────────────┘
```

**Reuse komponen sedia ada (jangan buat baharu kalau dah ada):**
- `GreetingHeader` (Hijri date, avatar) — `src/components/dashboard/GreetingHeader.tsx`
- `HeroPrayerCard` / Next prayer hook
- `DailyCheckinCard` / SalahQuickLog inline
- `DakwahWidget` posters carousel
- `ForYouSection`

**Komponen baharu (kecil) kalau perlu:**
- `TodayPrayerDuo.tsx` — 2-col Now/Next prayer cards
- `TodayFeatureRail.tsx` — horizontal scroll features (Qibla, Duas, Tasbih, Quran, Journal, Sadaqah, Zakat, More)

**Quick Log Salah** — kekal accessible: tap Track Prayer card buka `SalahQuickLogSheet` (komponen kekal wujud, dipanggil dari dalam Today page). Jadi fungsi quick log tak hilang, cuma tak lagi pada FAB.

## 4. Route
`src/App.tsx`:
```tsx
<Route path="/today" element={<Today />} />
```
Letak dalam group `AppLayout` supaya BottomNav nampak. AuthGuard mengikut pattern Dashboard sedia ada.

## 5. Files
- **New**: `src/pages/Today.tsx`, `src/assets/sm-mark.svg`, `src/components/today/TodayPrayerDuo.tsx`, `src/components/today/TodayFeatureRail.tsx`
- **Modified**: `src/components/BottomNav.tsx`, `src/App.tsx`

## 6. Tidak Disentuh
- `SalahQuickLogSheet.tsx` — kekal, dipanggil dari Today page Track card.
- `Dashboard.tsx` (`/`) kekal sebagai home utama.

Approve untuk laksana.
