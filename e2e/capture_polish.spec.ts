import { test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const allRoutes = [
  { name: "home", path: "/" },
  { name: "test_select", path: "/test" },
  { name: "capture", path: "/test/capture" },
  { name: "silage_sensors", path: "/test/silage" },
  { name: "processing", path: "/test/processing" },
  { name: "result", path: "/test/result?id=FS-20260930-W402" },
  { name: "advisory", path: "/advisory?id=FS-20260930-W402" },
  { name: "history", path: "/history" },
  { name: "compare", path: "/compare" },
  { name: "sync", path: "/sync" },
  { name: "verify_qr", path: "/verify/FS-20260930-W402" },
  { name: "hero_demo", path: "/demo/hero" },
  { name: "judge_tour", path: "/demo/tour" },
  { name: "models", path: "/models" },
  { name: "admin", path: "/admin" },
  { name: "design_system", path: "/design-system" },
];

const coreRoutes = [
  { name: "home", path: "/" },
  { name: "result", path: "/test/result?id=FS-20260930-W402" },
  { name: "advisory", path: "/advisory?id=FS-20260930-W402" },
  { name: "hero_demo", path: "/demo/hero" },
  { name: "models", path: "/models" },
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const themes = ["dark", "light"] as const;

test.describe("FeedShield Polish Screenshot Capture", () => {
  const outDir = path.resolve(__dirname, "../qa/polish");

  test.beforeAll(() => {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
  });

  // Part 1: All 16 routes in English across 2 viewports and 2 themes
  for (const vp of viewports) {
    for (const theme of themes) {
      for (const r of allRoutes) {
        test(`polish en_${theme}_${r.name}_${vp.name}`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.addInitScript(({ th }) => {
            localStorage.setItem("feedshield-theme", th);
            localStorage.setItem("pashuposhan-theme", th);
            localStorage.setItem("feedshield_locale", "en");
            localStorage.setItem("pashuposhan_locale", "en");
            if (th === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }, { th: theme });

          await page.goto(r.path, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(400);

          const filename = `polish_en_${theme}_${r.name}_${vp.width}x${vp.height}.png`;
          await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
        });
      }
    }
  }

  // Part 2: 5 Core routes in Hindi and Hinglish across 2 viewports and 2 themes
  const otherLocales = ["hi", "hinglish"] as const;
  for (const locale of otherLocales) {
    for (const vp of viewports) {
      for (const theme of themes) {
        for (const r of coreRoutes) {
          test(`polish ${locale}_${theme}_${r.name}_${vp.name}`, async ({ page }) => {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.addInitScript(({ loc, th }) => {
              localStorage.setItem("feedshield-theme", th);
              localStorage.setItem("pashuposhan-theme", th);
              localStorage.setItem("feedshield_locale", loc);
              localStorage.setItem("pashuposhan_locale", loc);
              if (th === "dark") {
                document.documentElement.classList.add("dark");
              } else {
                document.documentElement.classList.remove("dark");
              }
            }, { loc: locale, th: theme });

            await page.goto(r.path, { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(400);

            const filename = `polish_${locale}_${theme}_${r.name}_${vp.width}x${vp.height}.png`;
            await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
          });
        }
      }
    }
  }
});
