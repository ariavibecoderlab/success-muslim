# Scripts

This directory contains automation scripts for the Success Muslim app.

## Icon Generation Scripts

### generate-icons.js
Main icon generation script that:
1. Converts `public/smlogo.webp` to PNG
2. Creates squared icon (1024x1024)
3. Creates splash screen (2732x2732)
4. Attempts to generate Capacitor assets

**Usage:**
```bash
pnpm generate:icons
```

### sync-icons.js
Manual icon sync script that:
1. Ensures icon.png and splash.png exist in assets/
2. Copies resized icons to Android mipmap directories
3. Copies icons to iOS AppIcon.appiconset
4. Copies splash screens to iOS and Android

**Usage:**
```bash
pnpm sync:icons
```

## Source Icon

The main app icon is located at `public/smlogo.webp`.

All generated icons are created from this source file.

## Generated Assets

After running the scripts:
- **Icon:** `assets/icon.png` (1024x1024)
- **Splash:** `assets/splash.png` (2732x2732)
- **Android icons:** `android/app/src/main/res/mipmap-*/ic_launcher.png`
- **iOS icons:** `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

## Icon Color

Background color: `#10B981` (Emerald 500 - matches app theme)

## Workflow

1. Make changes to `public/smlogo.webp`
2. Run `pnpm sync:icons` to regenerate all icons
3. Run `pnpm build && pnpm cap:sync` to sync to native projects
4. Open IDE and test: `pnpm cap:open:android` or `pnpm cap:open:ios`
