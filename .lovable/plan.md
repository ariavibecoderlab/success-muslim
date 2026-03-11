

## For You Cards — Dark Orange Theme

Orange boleh jadi menarik sebagai accent yang warm dan energetic. Tapi untuk **keseluruhan page**, dashboard sekarang guna emerald/teal sebagai warna utama (Hero Prayer Card pakai `from-emerald-700 to-teal-800`). Kalau semua For You cards jadi orange, ia mungkin clash dengan green theme.

**Cadangan yang lebih sesuai**: Guna dark card dengan **orange sebagai accent warna**, bukan full orange. Setiap card tetap ada identity warna sendiri tapi dalam dark tone.

### Approach: Dark cards with warm accent

Setiap card tukar dari light pastel (`from-rose-50`) ke dark tone (`bg-slate-800/90`) dengan colored left border atau icon glow sebagai accent:

```
┌─────────────────────────────────┐
│ ██ 2/5 solat — teruskan!        │  ← dark bg, orange icon glow
│    2 on-time · keep going    →  │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ ██ Puasa IF — 4j 30m berlalu    │  ← dark bg, emerald icon glow  
│    16:8 · teruskan momentum  →  │
└─────────────────────────────────┘
```

### Changes to `src/components/dashboard/ForYouSection.tsx`

**Card container**: Replace light gradient with dark background
- From: `bg-gradient-to-r from-rose-50 to-transparent`
- To: `bg-gradient-to-br from-slate-800 to-slate-900 text-white`

**Icon container**: Add a subtle colored glow/ring per card type
- e.g. salah: `bg-orange-500/20 ring-orange-500/30`, icon `text-orange-400`

**Text**: Title becomes `text-white`, subtitle `text-white/60`

**ChevronRight pill**: `bg-white/10` instead of `bg-black/5`

**Card border**: Add `border border-white/5` for subtle edge definition

Each card keeps its unique color identity through the icon glow color (orange for salah, emerald for IF, purple for dhikr, etc.) but the card body is uniformly dark — creating contrast against the light dashboard background.

### Files modified
- `src/components/dashboard/ForYouSection.tsx` — card data colors + render template

