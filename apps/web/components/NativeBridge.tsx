"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function NativeBridge() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if running inside native Capacitor container
    const isNative =
      typeof window !== "undefined" &&
      (window as any).Capacitor?.isNativePlatform?.();

    if (!isNative) return;

    let cleanupBackButton: (() => void) | undefined;

    // Dynamically import Capacitor plugins only when running natively
    async function initNativePlugins() {
      try {
        const { App: CapApp } = await import("@capacitor/app");
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        const { SplashScreen } = await import("@capacitor/splash-screen");

        // 1. Hide splash screen smoothly after app is mounted
        await SplashScreen.hide().catch(() => {});

        // 2. Configure Status Bar with brand Forest color
        await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
        await StatusBar.setBackgroundColor({ color: "#1F4D3A" }).catch(() => {});

        // 3. Natural Android Back Button Handling
        const backListener = await CapApp.addListener("backButton", (event) => {
          // A. If an active modal or drawer is open, close it first
          const openDrawerCloseBtn = document.querySelector<HTMLButtonElement>(
            '[data-drawer-close="true"], button[aria-label="Close"], [role="dialog"] button'
          );
          if (openDrawerCloseBtn) {
            openDrawerCloseBtn.click();
            return;
          }

          // B. If not on the home screen, navigate back within Next.js
          if (window.location.pathname !== "/" && window.location.pathname !== "") {
            window.history.back();
            return;
          }

          // C. On root screen with canGoBack false, exit app gracefully
          if (!event.canGoBack) {
            CapApp.exitApp();
          } else {
            window.history.back();
          }
        });

        cleanupBackButton = () => {
          backListener.remove();
        };
      } catch (err) {
        console.warn("Native bridge initialization skipped:", err);
      }
    }

    initNativePlugins();

    return () => {
      if (cleanupBackButton) cleanupBackButton();
    };
  }, [router, pathname]);

  return null;
}
