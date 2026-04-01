# App Icon Generation Guide
## Success Muslim App - Icon & Splash Screen Management

**Last Updated:** 2026-04-01
**Source Icon:** `public/smlogo.webp`
**Background Color:** `#10B981` (Emerald 500)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Source Icon Requirements](#source-icon-requirements)
3. [Generation Scripts](#generation-scripts)
4. [Generated Assets](#generated-assets)
5. [Workflow](#workflow)
6. [Customization](#customization)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Quick Start

### Generate All Icons
```bash
# Generate icons from source
pnpm sync:icons

# Build and sync
pnpm build && pnpm cap:sync

# Open in IDE to test
pnpm cap:open:android
# or
pnpm cap:open:ios
```

### Update Icons After Design Change
1. Replace `public/smlogo.webp` with new design
2. Run `pnpm sync:icons`
3. Run `pnpm build && pnpm cap:sync`
4. Test in IDE

---

## Source Icon Requirements

### File Specifications

| Property | Value | Notes |
|----------|-------|-------|
| **Location** | `public/smlogo.webp` | Root of public directory |
| **Format** | WebP | Preferred for web performance |
| **Size** | Minimum 512x512px | Recommended 1024x1024px |
| **Aspect Ratio** | Square | 1:1 ratio required |
| **Background** | Transparent | Best for adaptive icon support |

### Design Guidelines

**Icon Content:**
- Keep design simple and recognizable
- Avoid thin details (will be lost at small sizes)
- Use high contrast for visibility
- Test at multiple sizes (16x16 to 1024x1024)

**Color Guidelines:**
- Primary color: `#10B981` (Emerald 500)
- Background: `#10B981` (used for padding)
- Avoid gradients that don't scale well
- Ensure good contrast on both light/dark backgrounds

**Safe Zones:**
- Keep important content within 80% of the canvas
- Android masks to a circle/squircle (varies by OEM)
- iOS uses a superellipse shape
- Leave 10-15% padding around critical elements

---

## Generation Scripts

### 1. sync-icons.js (Recommended)

**Purpose:** Manually sync icons to all platforms

**What it does:**
1. Ensures `assets/icon.png` and `assets/splash.png` exist
2. Generates them from `public/smlogo.webp` if missing
3. Copies resized icons to Android mipmap directories
4. Copies icons to iOS AppIcon.appiconset
5. Generates splash screens for both platforms

**Usage:**
```bash
pnpm sync:icons
```

**Output sizes:**
- Android: 48px, 72px, 96px, 144px, 192px (mdpi → xxxhdpi)
- iOS: 512px, 1024px (standard and @2x)
- Splash: 1920x1080, 1080x1920 (Android), 2732x2732 (iOS)

### 2. generate-icons.js

**Purpose:** Full icon generation workflow (experimental)

**What it does:**
1. Converts webp to PNG
2. Creates squared icon with background
3. Creates splash screen
4. Attempts to use @capacitor/assets CLI

**Usage:**
```bash
pnpm generate:icons
```

**Note:** May fail due to sharp module issues. Use `sync:icons` instead.

---

## Generated Assets

### Directory Structure

```
success-muslim/
├── public/
│   └── smlogo.webp                    # Source icon (1024x1024 recommended)
├── assets/
│   ├── icon.png                       # Generated app icon (1024x1024)
│   └── splash.png                     # Generated splash (2732x2732)
├── android/app/src/main/res/
│   ├── mipmap-hdpi/                   # 72x72
│   │   ├── ic_launcher.png
│   │   └── ic_launcher_round.png
│   ├── mipmap-mdpi/                   # 48x48
│   ├── mipmap-xhdpi/                  # 96x96
│   ├── mipmap-xxhdpi/                 # 144x144
│   ├── mipmap-xxxhdpi/                # 192x192
│   └── drawable-*/                    # Splash screens
│       └── splash.png
└── ios/App/App/Assets.xcassets/
    ├── AppIcon.appiconset/
    │   ├── AppIcon-512.png            # 512x512
    │   └── AppIcon-512@2x.png         # 1024x1024
    └── Splash.imageset/
        ├── splash-2732x2732.png
        ├── splash-2732x2732-1.png
        └── splash-2732x2732-2.png
```

### File Sizes

| Platform | Density/Type | Size | File |
|----------|--------------|------|------|
| Android | mdpi | 48x48 | ic_launcher.png |
| Android | hdpi | 72x72 | ic_launcher.png |
| Android | xhdpi | 96x96 | ic_launcher.png |
| Android | xxhdpi | 144x144 | ic_launcher.png |
| Android | xxxhdpi | 192x192 | ic_launcher.png |
| iOS | Standard | 512x512 | AppIcon-512.png |
| iOS | @2x | 1024x1024 | AppIcon-512@2x.png |
| iOS | Splash | 2732x2732 | splash-2732x2732.png |
| Android | Splash (port) | 1080x1920 | drawable-port-*/splash.png |
| Android | Splash (land) | 1920x1080 | drawable-land-*/splash.png |

---

## Workflow

### Initial Setup

```bash
# 1. Ensure source icon exists at public/smlogo.webp
ls -lh public/smlogo.webp

# 2. Generate all icons
pnpm sync:icons

# 3. Verify assets were created
ls -lh assets/
ls -lh android/app/src/main/res/mipmap-xxxhdpi/
ls -lh ios/App/App/Assets.xcassets/AppIcon.appiconset/

# 4. Build and sync
pnpm build && pnpm cap:sync
```

### Update Icon Design

```bash
# 1. Create or update your icon design
# Save as public/smlogo.webp

# 2. Regenerate all icons
pnpm sync:icons

# 3. Build and sync to native projects
pnpm build && pnpm cap:sync

# 4. Test in IDE
pnpm cap:open:android
# Verify icon appears correctly in launcher

pnpm cap:open:ios
# Verify icon in iOS settings and home screen
```

### Change Background Color

Edit `scripts/sync-icons.js`:

```javascript
const ICON_BACKGROUND = '#10B981'; // Change this
const SPLASH_BACKGROUND = '#10B981'; // Change this
```

Then regenerate:
```bash
pnpm sync:icons
pnpm build && pnpm cap:sync
```

---

## Customization

### Change Icon Background Color

1. Open `scripts/sync-icons.js`
2. Find line:
   ```javascript
   const ICON_BACKGROUND = '#10B981';
   const SPLASH_BACKGROUND = '#10B981';
   ```
3. Change to your preferred color:
   ```javascript
   const ICON_BACKGROUND = '#3B82F6'; // Blue
   const SPLASH_BACKGROUND = '#3B82F6';
   ```
4. Run `pnpm sync:icons`

### Adaptive Icons (Android)

Android supports adaptive icons with layered foreground/background.

**Current Implementation:**
- Uses traditional launcher icons
- Works on all Android versions
- Simpler workflow

**For Adaptive Icons:**
1. Create separate foreground layer
2. Update `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
3. Requires Android 8.0+ (API 26+)

### iOS Icon Variants

iOS supports different icons for:

**Current Setup:**
- Universal icon for all iOS versions
- Simplest approach

**Advanced Options:**
- Separate icons for iPad, iPhone, App Store
- Dark mode variants
- Notification icons

---

## Troubleshooting

### Icons Not Updating in App

**Problem:** Icons still show old design after regeneration

**Solutions:**
```bash
# 1. Clean and rebuild
pnpm build
npx cap sync

# 2. Clean Android build (if using Android Studio)
# Build -> Clean Project
# Build -> Rebuild Project

# 3. Uninstall app from device/emulator
# Then reinstall with new build

# 4. Clear capacitor cache
npx cap sync android --use-bundle
```

### Script Fails with Sharp Error

**Problem:** `Cannot find module '../build/Release/sharp-darwin-arm64v8.node'`

**Solution:**
```bash
# Rebuild sharp
pnpm rebuild sharp

# Or use sync-icons script (manual approach)
pnpm sync:icons
```

### Icons Look Blurry

**Problem:** Generated icons appear pixelated or blurry

**Causes:**
- Source icon too small (< 512px)
- Source not square
- Too much detail in design

**Solutions:**
```bash
# 1. Check source icon size
file public/smlogo.webp
# Should be at least 512x512, preferably 1024x1024

# 2. Use simpler design with fewer details
# Thin lines disappear at small sizes

# 3. Ensure source is square
# Use ImageMagick or similar to verify
```

### Splash Screen Not Showing

**Problem:** Splash screen appears blank or wrong

**Solutions:**
```bash
# 1. Check splash.png was generated
ls -lh assets/splash.png
# Should be ~2.5MB

# 2. Verify in native projects
ls -lh ios/App/App/Assets.xcassets/Splash.imageset/
ls -lh android/app/src/main/res/drawable-*/splash.png

# 3. Check launch screen configuration
# iOS: ios/App/App/Base.lproj/LaunchScreen.storyboard
# Android: Check activity_main.xml
```

### Wrong Background Color

**Problem:** Icons have wrong background color

**Solution:**
```bash
# 1. Check current setting
grep "ICON_BACKGROUND" scripts/sync-icons.js

# 2. Edit the file
nano scripts/sync-icons.js

# 3. Regenerate icons
pnpm sync:icons
```

---

## Best Practices

### Icon Design

✅ **DO:**
- Keep design simple and bold
- Use 2-3 colors maximum
- Test at small sizes (16x16)
- Leave padding around edges
- Use vector format when possible
- Test on real devices
- Check contrast ratios

❌ **DON'T:**
- Use thin lines or details
- Use gradients that don't scale
- Use photos (too complex)
- Crowd edges of icon
- Use text smaller than 20% of canvas
- Forget to test on dark backgrounds

### Workflow

✅ **DO:**
- Commit source icon (smlogo.webp)
- Include generated icons in git
- Test on both Android and iOS
- Use semantic versioning for updates
- Document color choices
- Keep backup of original design

❌ **DON'T:**
- Only commit source, ignore generated
- Skip testing on real devices
- Change colors without updating docs
- Use inconsistent branding
- Forget to sync after changes

### File Management

**Files to Track in Git:**
```gitignore
# Don't ignore these - commit them:
!public/smlogo.webp
!assets/
!android/app/src/main/res/mipmap-*/
!android/app/src/main/res/drawable-*/
!ios/App/App/Assets.xcassets/

# Ignore temporary files:
temp-icon.png
*.tmp
```

---

## Platform-Specific Notes

### Android

**Icon Shapes:**
- Different OEMs use different masks
- Samsung: Circle
- Google: Squircle
- Xiaomi: Rounded square
- Others: Various shapes

**Recommendations:**
- Keep content within safe zone (center 70%)
- Test on multiple devices
- Consider adaptive icons for Android 8.0+

**Testing:**
```bash
# Build debug APK
pnpm cap build android

# Install on device
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Check launcher icon appearance
```

### iOS

**Icon Requirements:**
- All sizes required (no missing sizes allowed)
- Must pass App Store review
- No transparency allowed in icons

**App Store Icon:**
- Separate 1024x1024 icon for App Store
- Generated during archive process
- Configured in Xcode

**Testing:**
```bash
# Build in Xcode
npx cap open ios

# Run on simulator
Product -> Run

# Check:
# - Home screen
# - Settings -> App Icon
# - Search results
```

---

## Automated Workflow

### Pre-commit Hook (Optional)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Check if icon changed
if git diff --cached --name-only | grep "public/smlogo.webp"; then
  echo "⚠️  smlogo.webp changed. Run: pnpm sync:icons"
  echo "Then git add assets/ android/ ios/"
  exit 1
fi
```

### CI/CD Integration

Add to your build pipeline:

```yaml
# Example GitHub Actions
- name: Generate Icons
  run: |
    pnpm sync:icons
    pnpm build
    npx cap sync

- name: Upload Build Artifacts
  uses: actions/upload-artifact@v3
  with:
    name: android-apk
    path: android/app/build/outputs/apk/**/*.apk
```

---

## Resources

### Design Tools
- **Figma:** https://figma.com - Design and export icons
- **Sketch:** https://sketch.com - Mac-only design tool
- **Inkscape:** https://inkscape.org - Free vector editor
- **GIMP:** https://www.gimp.org - Free raster editor

### Testing Tools
- **Android Studio:** Build and test Android apps
- **Xcode:** Build and test iOS apps (Mac only)
- **TestFlight:** iOS beta testing (requires Apple Developer account)
- **Google Play Console:** Android testing and deployment

### Documentation
- [App Icon Guidelines (Apple)](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Adaptive Icons (Android)](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [Capacitor Assets](https://capacitorjs.com/docs/guides/splash-screens-and-icons)

---

## Quick Reference

### Essential Commands

```bash
# Generate icons
pnpm sync:icons

# Build and sync
pnpm build && pnpm cap:sync

# Open IDEs
pnpm cap:open:android
pnpm cap:open:ios

# Clean everything
git clean -fdx
pnpm install
pnpm sync:icons
pnpm build && pnpm cap:sync
```

### File Locations

```
Source:        public/smlogo.webp
Generated:     assets/icon.png, assets/splash.png
Android:       android/app/src/main/res/mipmap-*/
iOS:           ios/App/App/Assets.xcassets/AppIcon.appiconset/
Config:        scripts/sync-icons.js
```

### Color Reference

```
Background:    #10B981 (Emerald 500)
Alternative:   #059669 (Emerald 600)
Dark:          #064E3B (Emerald 900)
```

---

**Last Updated:** 2026-04-01
**Status:** ✅ Ready for Production
