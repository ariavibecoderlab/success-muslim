## Make /iman Page More Elegant -- Softer, Less Bold Colors

Toning down the saturated gradients to create a refined, calm aesthetic while keeping the same layout structure. polish desain more simple and easy to use.

### Color Philosophy Change

From "Apple Health vibrant" to "refined Islamic calm" -- softer pastels, muted tones, and subtle gradients.

### Changes to `src/pages/Deen.tsx`

**1. Prayer Hero Card -- soften gradient**

- Change `from-emerald-600 to-teal-700` to `from-emerald-500/90 to-teal-600/90`
- Reduce `shadow-lg` to `shadow-md`

**2. Stats Ring colors -- muted tones**

- Salah: `hsl(160, 84%, 39%)` to `hsl(160, 50%, 45%)` (softer green)
- Dhikr: `hsl(330, 81%, 60%)` to `hsl(330, 45%, 60%)` (muted rose)
- Quran: `hsl(38, 92%, 50%)` to `hsl(38, 55%, 50%)` (softer amber)
- Sunnah: `hsl(271, 91%, 65%)` to `hsl(271, 45%, 60%)` (muted purple)
- Label colors: Change from `-600` shades to `-500/80` (e.g., `text-emerald-600` to `text-emerald-500/80`)

**3. Spiritual Tools grid -- softer icon badges**

- Replace all saturated `-500 to -600` gradients with lighter `-400/80 to -500/80` versions:
  - Quran: `from-amber-400/80 to-amber-500/80`
  - Dhikr: `from-pink-400/80 to-rose-500/80`
  - Sunnah: `from-purple-400/80 to-purple-500/80`
  - Prayer Times: `from-blue-400/80 to-blue-500/80`
  - Zakat: `from-emerald-400/80 to-emerald-500/80`
  - Sadaqah: `from-rose-400/80 to-rose-500/80`
  - Qiyam: `from-indigo-400/80 to-indigo-500/80`
  - Ramadan: `from-orange-400/80 to-orange-500/80`
  - Hajj: `from-teal-400/80 to-teal-500/80`
  - Da'wah: `from-violet-400/80 to-violet-500/80`
  - Iman Score: `from-emerald-400/80 to-green-500/80`

**4. Active Trackers -- softer badges**

- Qada: `from-blue-400/80 to-blue-500/80`
- Ramadhan: `from-orange-400/80 to-orange-500/80`
- Fidyah: `from-emerald-400/80 to-emerald-500/80`

**5. Setup Actions -- same treatment**

- Match the softer gradient approach for setup action icon badges

### What stays the same

- Layout, spacing, animations, data logic -- all unchanged
- Quote banner already has soft colors (emerald-50/teal-50) -- no change needed

### File modified

- `src/pages/Deen.tsx` (single file)