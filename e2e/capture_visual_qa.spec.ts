import { test } from "@playwright/test";

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/demo/hero", name: "demo_hero" },
  { path: "/history", name: "history" },
  { path: "/design-system", name: "design_system" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const THEMES = ["light", "dark"] as const;

test.describe("Visual QA Capture Suite", () => {
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      for (const route of ROUTES) {
        test(`Screenshot ${route.name} - ${vp.name} - ${theme}`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });

          await page.addInitScript(({ thm }) => {
            localStorage.setItem("feedshield_locale", "en");
            localStorage.setItem("pashuposhan_locale", "en");
            localStorage.setItem("feedshield-theme", thm);
            localStorage.setItem("pashuposhan-theme", thm);
            if (thm === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }, { thm: theme });

          await page.goto(route.path, { waitUntil: "networkidle" });
          await page.waitForTimeout(400);

          await page.screenshot({
            path: `reports/visual-qa/${route.name}-${vp.name}-${theme}.png`,
            fullPage: false,
          });
        });
      }
    }
  }

  // Drawer open screenshot
  for (const theme of THEMES) {
    test(`Screenshot drawer open - mobile - ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.addInitScript(({ thm }) => {
        localStorage.setItem("feedshield_locale", "en");
        localStorage.setItem("feedshield-theme", thm);
        if (thm === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }, { thm: theme });

      await page.goto("/design-system", { waitUntil: "networkidle" });
      await page.waitForTimeout(400);

      // Open Sample Detail Drawer
      await page.getByRole("button", { name: /Open SampleDetailDrawer Preset/i }).click();
      await page.waitForTimeout(400);

      await page.screenshot({
        path: `reports/visual-qa/drawer-sample-mobile-${theme}.png`,
        fullPage: false,
      });
    });

    test(`Screenshot drawer open - desktop - ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.addInitScript(({ thm }) => {
        localStorage.setItem("feedshield_locale", "en");
        localStorage.setItem("feedshield-theme", thm);
        if (thm === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }, { thm: theme });

      await page.goto("/design-system", { waitUntil: "networkidle" });
      await page.waitForTimeout(400);

      // Open Generic Smooth Drawer
      await page.getByRole("button", { name: /Open Generic SmoothDrawer/i }).click();
      await page.waitForTimeout(400);

      await page.screenshot({
        path: `reports/visual-qa/drawer-generic-desktop-${theme}.png`,
        fullPage: false,
      });
    });
  }
});
