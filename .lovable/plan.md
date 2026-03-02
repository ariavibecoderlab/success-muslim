

## Fix Quran Reader Navigation Issues

### Problems Identified
1. **SurahReader has no obvious exit**: The page has only a small header back button. In Mushaf mode especially, there's no persistent way to leave the page.
2. **Navigation loop**: QuranReader's SubPageLayout uses `navigate(-1)` which goes back to SurahReader instead of `/iman`, creating a back-button loop between the two pages.

### Changes

#### 1. SurahReader.tsx -- Add a sticky bottom bar with Back button
Add a simple sticky bottom bar (similar to SubPageLayout's pattern) with:
- A centered "Back to Quran" button that navigates to `/iman/quran` using `navigate('/iman/quran', { replace: true })` -- using `replace` breaks the history loop
- Previous/Next surah navigation on either side (compact chevrons with surah name)

This gives users a persistent, visible exit from the Quran reader in both Ayah and Mushaf modes.

#### 2. SurahReader.tsx -- Fix header back button to use `replace`
Change the header's `ChevronLeft` button from `navigate('/iman/quran')` to `navigate('/iman/quran', { replace: true })` so it replaces the history entry instead of pushing, preventing the back-loop.

#### 3. QuranReader (SubPageLayout) -- No changes needed
The SubPageLayout's `navigate(-1)` is correct for general use. The fix is on SurahReader's side by using `replace: true` when going back, so the SurahReader entry is removed from history and SubPageLayout's back button won't return to it.

---

### Files Modified

| File | Change |
|------|--------|
| `src/pages/deen/SurahReader.tsx` | Add sticky bottom nav bar with "Back to Quran" + prev/next surah; fix header back to use `replace: true` |

### Technical Notes
- Using `replace: true` on navigation removes the SurahReader from the history stack, breaking the loop
- Bottom bar uses the same styling pattern as SubPageLayout (sticky, backdrop-blur, border-t)
- The `pb-24` on the ayah container already provides space for a bottom bar
- In Mushaf mode, the MushafPageView's own bottom page nav is separate from this navigation bar
