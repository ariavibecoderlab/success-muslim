

## Polish "Untuk Kamu" / For You Section

### Problems
1. **Copy is generic/vibecoded** — messages like "Tetap semangat! Lihat progress kamu" and "Allah Maha Pengampun. Semangat!" feel like placeholder motivational text, not personal or specific.
2. **Visual design is flat** — plain left-border cards with muted icon boxes look template-y.
3. **Missing time-awareness in copy** — greetings don't reflect the actual time of day or prayer context.
4. **Limited triggers** — only 5-6 card types; misses common states like partial salah progress (1-4), dhikr nudge, sunnah fasting days (Mon/Thu).

### Changes — `src/components/dashboard/ForYouSection.tsx`

**1. Richer, more specific copy**
Replace generic motivational text with contextual, time-aware messages:

| State | Current | New |
|-------|---------|-----|
| Salah = 0, morning | "Yuk mulai solat hari ini" | "Subuh sudah lepas — log sekarang?" |
| Salah = 0, afternoon | same | "Zuhur & Asar belum dilog" |
| Salah 1-4 | (missing) | "{logged}/5 solat hari ini — teruskan!" |
| Salah = 5 | "MasyaAllah! Solat lengkap" | "5/5 solat — MasyaAllah, konsisten!" |
| Quran evening | "Walau 5 menit — barakah tetap ada" | "Belum baca Quran — 1 muka surat sebelum tidur?" |
| Active IF | "Tetap semangat! Lihat progress kamu" | Show actual elapsed time from `activeIF` |
| Ramadan last 10 | Generic | Include specific odd-night callout |

**2. Add new card triggers**
- **Partial salah (1-4 logged)**: progress encouragement with count
- **Monday/Thursday sunnah fasting**: suggest logging sunnah fast
- **Dhikr nudge (afternoon)**: if no dhikr logged today

**3. Visual polish**
- Replace `border-l-4` cards with subtle gradient background tint matching the icon color (e.g. `bg-gradient-to-r from-emerald-50 to-transparent`)
- Icon container: use matching soft color bg instead of generic `bg-muted` (e.g. `bg-emerald-100`)
- Add a small chevron-right on the trailing edge to signal tappability
- Animate card entry with staggered fade-up (consistent with app's framer-motion patterns)

**4. Section header**
- Keep "Untuk Kamu" label as-is (matches app style)

### Props change
- Accept `activeIF` object to extract elapsed time for display
- Accept `dhikrCount` (optional) for dhikr nudge — passed from `useDashboardData`

### Dashboard.tsx
- Pass `dhikrCount` from `useDashboardData` (already available via `useDhikrDaily` in the hook)

### useDashboardData.ts
- Expose `dailyDhikrCount` from existing `useDhikrDaily` hook (already imported, just not returned)

