# Marketing Assets Specification — Success Muslim

## App icon

- **Source size**: 1024×1024 PNG, no transparency, no rounded corners (stores apply mask).
- **Source file**: `public/smlogo.webp` → re-export as `marketing/icon-1024.png`.
- **Design**: emerald gradient backdrop (`#10B981` → `#0E9F71`), centered "SM" mark in white, subtle Islamic geometric pattern at 6% opacity.
- **Generation**: `npm run generate:icons` produces all native sizes.

### Required exports

| Platform | Sizes |
|---|---|
| iOS | 1024 (App Store), plus all `Assets.xcassets/AppIcon` slots auto-generated |
| Android | 512 (Play Store), 192/144/96/72/48 mipmaps, adaptive icon foreground+background |

## Feature graphic (Google Play)

- **Size**: 1024×500 PNG/JPEG, max 1MB.
- **Content**: brand background + "Success Muslim" wordmark + tagline `Your balanced Muslim life, daily.`
- **Safe area**: keep logo and text within 924×400 centered (Play crops on some surfaces).
- **Output**: `marketing/play-feature-graphic.png`.

## Promo video (optional but recommended)

- **Length**: 15–30 seconds.
- **Aspect**: 16:9 landscape (Play) and a vertical 9:16 cut for App Preview (iOS).
- **Storyboard**:
  1. (0–3s) Logo + tagline.
  2. (3–8s) Home dashboard with Life Score animating up.
  3. (8–13s) Prayer times + Adhan toggle.
  4. (13–18s) Quran reader scroll.
  5. (18–23s) Fasting timer + family group snapshot.
  6. (23–30s) "Download Success Muslim — your balanced Muslim life, daily." + store badges.
- **Audio**: soft ambient nasheed (instrumental, halal-compliant) OR no audio + on-screen text.
- **Captions**: burned-in for accessibility.
- **Output**:
  - YouTube unlisted URL for Play (must be public-listed at submission time).
  - `.mov` H.264 for App Store Preview, exact resolution per device target.

## App Preview (iOS — optional)

| Device | Resolution | Length |
|---|---|---|
| iPhone 6.9" | 886×1920 or 1080×1920 | 15–30s |
| iPhone 6.5" | 886×1920 | 15–30s |

No external audio music in App Preview unless you own the rights — Apple is strict.

## Brand assets

| Asset | Spec | File |
|---|---|---|
| Wordmark (light bg) | SVG | `marketing/wordmark-emerald.svg` |
| Wordmark (dark bg) | SVG | `marketing/wordmark-white.svg` |
| Logo mark | SVG | `marketing/sm-mark.svg` (already in `src/assets/`) |
| Brand color | Emerald | `#10B981` primary, `#0E9F71` deep, `#F59E0B` accent |
| Display font | Plus Jakarta Sans / DM Serif Display | per design system |

## Press kit

Bundle as `marketing/press-kit-vYYYYMMDD.zip` containing:
- App icon (1024 PNG + SVG)
- Wordmark variants
- 5 hero screenshots
- Founder photo (if applicable)
- 1-page PDF "About Success Muslim"
- Boilerplate paragraph (50, 100, 250 words)
- Contact: press@successmuslim.app

## Store badges (for marketing site / social)

- Use official Apple "Download on the App Store" badge — do NOT recreate or recolor.
- Use official Google Play "GET IT ON" badge — do NOT recreate or recolor.
- Localize badges per locale (Apple/Google provide localized versions).

## Pre-submission checklist

- [ ] icon-1024.png is exactly 1024×1024 with no alpha
- [ ] feature-graphic 1024×500 PNG produced
- [ ] All 8 phone screenshots produced for iOS 6.9" and Android phone
- [ ] Promo video uploaded to YouTube (Play) and exported to .mov (iOS App Preview optional)
- [ ] Localized assets for ms-MY, id-ID, ar (RTL) at minimum
- [ ] Press kit zipped and hosted at https://successmuslim.app/press
