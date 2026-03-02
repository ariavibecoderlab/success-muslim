

## Add Uthmani Font, Mushaf Mode, and Long-Press Ayah Menu

### Overview
Three enhancements to the Quran reader:
1. **Uthmani font** -- load "Amiri Quran" from Google Fonts for authentic Mushaf typography
2. **Two reading modes** -- toggle between current "Ayah-by-Ayah" mode and a new "Mushaf Page" mode that renders continuous Arabic text like a printed Mushaf (matching the reference image)
3. **Long-press context menu** -- hold on any ayah to reveal action menu (Tafsir, Play, Bookmark, Memorize, Copy, Share)

---

### Changes

#### 1. Load Amiri Quran Font (`index.html`)
Add Google Fonts import for "Amiri Quran" -- an Uthmani script designed for Quran display. This replaces the generic `serif` currently used for Arabic text.

```html
<link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap" rel="stylesheet">
```

#### 2. New API Function (`quran-api.ts`)
Add `fetchAyahsByPage(pageNumber)` -- calls Quran.com's `verses/by_page/{page}` endpoint to get all ayahs on a specific Mushaf page. Returns ayahs with surah info for rendering surah headers mid-page.

#### 3. Mushaf Page Component (`src/components/quran/MushafPageView.tsx`)
New component that renders a single Mushaf page:
- Fetches ayahs for the given Mushaf page number (1-604)
- Renders Arabic text in continuous RTL flow (no line breaks between ayahs)
- Inline ayah number markers styled as decorative circles (matching the reference image's `۝` end-of-ayah markers)
- Surah Bismillah header rendered when a new surah starts mid-page
- Page number displayed at the bottom
- Uses `font-family: 'Amiri Quran'` with larger font size (~28px)
- Swipe left/right or arrow buttons to navigate pages

#### 4. Long-Press Context Menu (`src/components/quran/AyahContextMenu.tsx`)
New component using Radix Popover (not native context menu -- better for mobile):
- Triggered by `onTouchStart`/`onTouchEnd` (500ms hold) and right-click on desktop
- Menu items with icons:
  - Play/Pause audio
  - Open Tafsir
  - Bookmark ayah
  - Mark as memorized
  - Copy Arabic text
  - Share (Web Share API)
- Appears near the touch point
- Works in both Ayah-by-Ayah and Mushaf modes

#### 5. Updated SurahReader (`SurahReader.tsx`)
- Add mode toggle button in header: "Ayah" / "Mushaf" (two-segment toggle)
- Save selected mode to QuranPrefs (`reading_mode: 'ayah' | 'mushaf'`)
- When mode is "mushaf":
  - Calculate starting Mushaf page from surah number using `quran-mapping.ts`
  - Render `MushafPageView` instead of ayah list
  - Navigate by Mushaf page (1-604) instead of ayah pagination
- When mode is "ayah":
  - Keep current behavior but apply Amiri Quran font
  - Replace inline action buttons with long-press menu
  - Keep the action row for quick access but make it more compact
- Apply `font-family: 'Amiri Quran', serif` to all Arabic text in both modes

#### 6. Quran Mapping Helper (`quran-mapping.ts`)
Add `getPageForSurah(surahNumber)` -- returns the starting Mushaf page for a given surah (needed to initialize Mushaf mode at the right page).

---

### Files Modified / Created

| File | Action | Change |
|------|--------|--------|
| `index.html` | Modified | Add Amiri Quran Google Font link |
| `src/lib/quran-api.ts` | Modified | Add `fetchAyahsByPage()` function |
| `src/lib/quran-mapping.ts` | Modified | Add `getPageForSurah()` helper |
| `src/components/quran/MushafPageView.tsx` | **New** | Mushaf page renderer with continuous flow |
| `src/components/quran/AyahContextMenu.tsx` | **New** | Long-press popover menu component |
| `src/pages/deen/SurahReader.tsx` | Modified | Mode toggle, font update, integrate context menu + mushaf view |

### Technical Notes
- Amiri Quran is ~200KB, loaded async via Google Fonts (`display=swap` prevents FOIT)
- Quran.com API `verses/by_page` returns surah boundaries, enabling mid-page Bismillah headers
- Long-press uses 500ms touch timer (standard mobile UX pattern), with cleanup on scroll/move
- Mushaf page navigation preserves session tracking (start/end positions still recorded)
- No database changes needed -- reading mode preference stored in existing `quran_preferences` via the flexible prefs pattern

