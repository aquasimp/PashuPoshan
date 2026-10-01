import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/demo/hero",
  "/demo/tour",
  "/models",
  "/design-system",
  "/history",
  "/sync",
  "/admin",
];

const VIEWPORTS = [
  { width: 390, height: 844, name: "iPhone 12/13/14" },
  { width: 412, height: 915, name: "Pixel 7" },
  { width: 768, height: 1024, name: "iPad Portrait" },
  { width: 1280, height: 800, name: "Small Laptop" },
  { width: 1440, height: 900, name: "Desktop Standard" },
  { width: 1536, height: 864, name: "Large Desktop" },
];

const LOCALES = ["en", "hi", "hinglish"] as const;
const THEMES = ["light", "dark"] as const;

test.describe("Section 7 Automated Overflow Matrix", () => {
  for (const vp of VIEWPORTS) {
    for (const locale of LOCALES) {
      for (const theme of THEMES) {
        test(`Viewport ${vp.width}x${vp.height} (${vp.name}) - ${locale} - ${theme}`, async ({
          page,
        }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });

          for (const route of ROUTES) {
            // Pre-seed locale and theme into localStorage before loading page
            await page.addInitScript(
              ({ loc, thm }) => {
                localStorage.setItem("pashuposhan_locale", loc);
                localStorage.setItem("feedshield_locale", loc);
                localStorage.setItem("feedshield-theme", thm);
                localStorage.setItem("pashuposhan-theme", thm);
                if (thm === "dark") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              },
              { loc: locale, thm: theme }
            );

            await page.goto(route, { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(200);

            // 1. Assert no horizontal document overflow
            const scrollWidth = await page.evaluate(
              () => document.documentElement.scrollWidth
            );
            const innerWidth = await page.evaluate(() => window.innerWidth);

            expect(
              scrollWidth,
              `Horizontal overflow detected on ${route} (${locale}, ${theme}) at ${vp.width}px. scrollWidth (${scrollWidth}) > innerWidth (${innerWidth})`
            ).toBeLessThanOrEqual(innerWidth + 1); // +1px subpixel tolerance
          }
        });
      }
    }
  }
});
