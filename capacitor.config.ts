import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.successmuslim.app", // Replace with your domain
  appName: "Success Muslim",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    // Remove url for production builds (uses local files)
    cleartext: true,
  },
  ios: {
    contentInset: "automatic",
    scrollEnabled: true,
  },
  android: {
    webContentsDebuggingEnabled: true, // Set false in production
  },
};

export default config;
