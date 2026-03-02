

## Polish Mushaf Page View to Match Physical Mushaf

### Reference Analysis
The uploaded screenshot shows a professional Quran app with:
- **Top bar**: Bookmark icon + "Page 50" on left, "Juz 3 / Hizb 5" on right
- **Surah bar**: "3. Ali 'Imran" with dropdown, mode toggle icons (list/mushaf/font), settings gear
- **Content area**: Large Uthmani text with generous line-height (~2.6), decorative circular ayah markers with numbers inside
- **Page number**: Centered at bottom ("50")
- **Overall feel**: Clean, cream/white background, no heavy borders, spacious

### Changes

#### 1. MushafPageView.tsx -- Major Visual Overhaul

**Header redesign**:
- Left side: Bookmark icon + "Page {n}" label
- Right side: "Juz {n} / Hizb {h}" (add Hizb calculation from page number)
- Subtle separator line below

**Content area**:
- Increase line-height from `2.4` to `2.6` for more breathing room
- Make ayah end markers decorative circles: render verse number inside a circular border (`inline-flex w-7 h-7 rounded-full border border-muted-foreground/40 items-center justify-center text-[0.5em]`) instead of the bracket style
- Increase default minimum font size from 26 to 28px
- Add subtle warm background tint: `bg-[#fefcf7] dark:bg-background` for a parchment feel
- Generous padding: `px-6 py-8`

**Surah header**:
- Show surah number prefix: "3. Ali 'Imran"
- More elegant styling with a decorative divider line
- Bismillah in larger size with more spacing

**Bottom navigation**:
- Simplified: just centered page number ("50") as primary element
- Prev/Next as subtle ghost arrows on either side
- Remove "Next"/"Prev" text labels, just use chevron icons

**Green accent line**: Add a thin teal/emerald accent line at the top of the content area (matching the green line visible in the reference image below the surah header)

#### 2. quran-mapping.ts -- Add Hizb Helper

Add `hizbForPage(page: number): number` function. Each hizb spans ~8 pages (604 pages / 60 hizb). This can be derived from the juz (each juz has 2 hizbs) and the page position within the juz.

#### 3. SurahReader.tsx -- Header Polish for Mushaf Mode

When in mushaf mode, update the header bar to show the surah name with number prefix and a more compact mode toggle that matches the reference (icons instead of text labels).

---

### Files Modified

| File | Change |
|------|--------|
| `src/components/quran/MushafPageView.tsx` | Complete visual overhaul: decorative ayah circles, parchment bg, header with hizb, elegant surah headers, bottom page number |
| `src/lib/quran-mapping.ts` | Add `hizbForPage()` helper |
| `src/pages/deen/SurahReader.tsx` | Polish header for mushaf mode (numbered surah name, compact mode toggle) |

### Technical Notes
- Parchment tint uses `bg-[#fefcf7]` which is warm cream, only in light mode
- Hizb calculation: `Math.ceil(page / (604/60))` gives approximate hizb
- Ayah number circles use inline-flex with fixed dimensions for consistent sizing
- No new dependencies needed
