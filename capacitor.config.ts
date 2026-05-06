import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.successmuslim.app",
  appName: "Success Muslim",
  webDir: "dist",
  bundledWebRuntime: false,
  // For local dev hot-reload uncomment server.url and rebuild.
  // Cleartext + remote URL must be removed for production releases.
  // server: {
  //   url: "https://b9a116fe-f80b-4255-b061-8b5d84d41884.lovableproject.com?forceHideBadge=true",
  //   cleartext: true,
  // },
  ios: {
    contentInset: "automatic",
    scrollEnabled: true,
    // "production" silences verbose webview logs in release builds
    loggingBehavior: "production",
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    // Set webContentsDebuggingEnabled to false for release builds
    webContentsDebuggingEnabled: false,
    loggingBehavior: "production",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: false, // we hide manually after app boot
      backgroundColor: "#10B981",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      overlaysWebView: false,
      style: "LIGHT",
      backgroundColor: "#10B981",
    },
    Keyboard: {
      resize: "native",
      style: "LIGHT",
      resizeOnFullScreen: true,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#10B981",
    },
  },
};

export default config;
