import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pashuposhan.app",
  appName: "PashuPoshan",
  webDir: "out",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#1F4D3A",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      overlaysWebView: false,
      style: "DARK",
      backgroundColor: "#1F4D3A",
    },
  },
};

export default config;
