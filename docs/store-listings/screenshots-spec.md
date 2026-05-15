# Screenshots Specification — Success Muslim

## Required sizes

### Apple App Store (mandatory)

| Device | Resolution | Quantity (min/max) |
|---|---|---|
| iPhone 6.9" (15/16 Pro Max) | 1320×2868 or 2868×1320 | 3 min / 10 max |
| iPhone 6.5" (XS Max, 11 Pro Max) | 1284×2778 or 1242×2688 | 3 / 10 |
| iPad Pro 13" (M4) | 2064×2752 | 3 / 10 (only if iPad supported) |
| iPad Pro 12.9" (6th gen) | 2048×2732 | 3 / 10 (only if iPad supported) |

iPhone 6.9" is required; others are optional but recommended.

### Google Play Store (mandatory)

| Asset | Spec | Quantity |
|---|---|---|
| Phone screenshots | 16:9 or 9:16, min 1080px on long side, JPEG/PNG, max 8MB | 2 min / 8 max |
| 7-inch tablet | min 1080px on long side | 0 / 8 |
| 10-inch tablet | min 1080px on long side | 0 / 8 |
| Feature graphic | 1024×500 PNG/JPEG | 1 (required) |
| App icon | 512×512 PNG, 32-bit with alpha | 1 (required) |
| Promo video | YouTube URL | 0 / 1 |

## Recommended set: 8 phone screenshots

Same caption + screen content across iOS and Android.

| # | Screen captured | Caption (max 30 chars on iOS overlay) |
|---|---|---|
| 1 | Home dashboard with Life Score and prayer card | "Your balanced Muslim life" |
| 2 | Prayer Times with adhan toggle | "Never miss a prayer" |
| 3 | Quran reader (Mushaf mode, Surah Al-Fatihah) | "Read Quran. Build streaks." |
| 4 | Salah log with Sunnah & Tarawih | "Track every salah" |
| 5 | Intermittent fasting timer (mid-fast view) | "Fast with intention" |
| 6 | Zakat calculator + Sadaqah log | "Wealth with barakah" |
| 7 | Family group dashboard | "Grow in deen together" |
| 8 | 7-day check-in reward + Daily Dakwah | "Stay consistent. Be inspired." |

## Caption design rules

- Caption goes ABOVE the device frame, not on the screen.
- Background: brand emerald gradient (`#10B981` → `#0E9F71`) with subtle Islamic geometric pattern at 8% opacity.
- Caption font: Inter Bold 72pt white.
- Sub-caption (optional, 1 line) Inter Regular 36pt at 80% white.
- Device frame: iPhone 15 Pro (Titanium Black) for iOS, Pixel 8 Pro (Obsidian) for Android.
- Safe area: keep critical UI 80px away from edges.

## Localization

Provide each screenshot in:
- English (default)
- Bahasa Malaysia
- Indonesian
- Arabic (RTL — mirror layout, swap caption font to a strong Arabic display face such as IBM Plex Sans Arabic Bold)

## Tools

- Capture from device or Xcode/Android Studio simulator at exact target resolution (do NOT upscale).
- Compose captions in Figma using the `screenshots-template.fig` (to be created).
- Export as PNG-24 (no transparency required for store).

## File naming convention

```
ios/iphone-6.9/01-home_en.png
ios/iphone-6.9/01-home_ms.png
android/phone/01-home_en.png
android/feature-graphic_en.png
android/icon-512.png
```

## Pre-submission checklist

- [ ] All screenshots show the actual app UI (no mockups, no fake data that misrepresents)
- [ ] No promotional pricing claims (e.g. "FREE" badges) overlaid on the device
- [ ] No competitor app names or trademarks visible
- [ ] Status bar shows full battery, full signal, 9:41 AM (iOS convention)
- [ ] Demo content uses Arabic names with diacritics correctly (e.g. Aisha, Yusuf)
- [ ] Prayer times shown match a real city (e.g. Kuala Lumpur)
