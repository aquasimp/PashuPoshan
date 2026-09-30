import { test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const routes = [
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
  { name: "verify", path: "/verify/FS-20260930-W402" },
  { name: "hero_demo", path: "/demo/hero" },
  { name: "judge_tour", path: "/demo/tour" },
  { name: "models", path: "/models" },
  { name: "admin", path: "/admin" },
  { name: "settings", path: "/settings" },
  { name: "design_system", path: "/design-system" },
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

test.describe("Baseline Screenshot Capture", () => {
  const outDir = path.resolve(__dirname, "../qa/baseline");

  test.beforeAll(() => {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
  });

  for (const vp of viewports) {
    for (const r of routes) {
      test(`capture local ${r.name} @ ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(r.path, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(500);
        const filename = `local_${r.name}_${vp.width}x${vp.height}.png`;
        await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
      });

      test(`capture live ${r.name} @ ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        try {
          await page.goto(`https://pashuposhann.vercel.app${r.path}`, { waitUntil: "domcontentloaded", timeout: 15000 });
          await page.waitForTimeout(500);
          const filename = `live_${r.name}_${vp.width}x${vp.height}.png`;
          await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
        } catch (e) {
          // If live fetch times out or is blocked, log and continue
          console.warn(`Could not capture live ${r.name} @ ${vp.name}: ${e}`);
        }
      });
    }
  }
});
