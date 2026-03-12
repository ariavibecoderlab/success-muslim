

## Mobile App Conversion

Based on the project's technology stack (React + Vite + TypeScript), **Capacitor** is the right choice here. React Native would require a complete rewrite since it uses different components (`<View>`, `<Text>` instead of HTML). Capacitor wraps your existing web app as-is into a native shell.

Your app already scores **8/10 for mobile readiness** with safe area support, 44px touch targets, and WebView-compatible navigation in place. It's also already a PWA.

### Two Options

**Option 1: Keep as Installable Web App (PWA)** — Already done. Users install from browser to home screen. Works on all phones, no app store needed. Some native features (push notifications, camera) are limited.

**Option 2: True Native App via Capacitor** — Wraps your existing app in a native container. Publishable to App Store and Google Play. Full access to native APIs (camera, push notifications, sensors). Requires Xcode (iOS) and/or Android Studio (Android) on your local machine.

### What the Conversion Involves

1. Install Capacitor dependencies (`@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`)
2. Initialize Capacitor with config pointing to your app
3. Configure live-reload for development via your preview URL
4. You then pull the code to your machine, run `npx cap add ios` / `npx cap add android`, and open in Xcode/Android Studio

### Known Blocker
Google Sign-in currently uses a web redirect flow and will need a native Capacitor plugin during conversion.

### Next Steps
If you want to proceed with Capacitor, I'll set up the configuration files and dependencies. You'll need a Mac with Xcode for iOS, or Android Studio for Android, to build and test locally.

