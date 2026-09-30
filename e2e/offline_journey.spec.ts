import { test, expect } from "@playwright/test";

test.describe("PashuPoshan End-to-End Farmer Offline Flow", () => {
  test("completes end-to-end 3-tap silage evaluation to actionable voice advisory", async ({ page }) => {
    // 1. Visit Farmer Home
    await page.goto("/");
    await expect(page).toHaveTitle(/PashuPoshan/);
    await expect(page.locator("h1")).toContainText("Test your feed");

    // Tap 1: Start New Test
    const startBtn = page.locator("#btn-start-new-test");
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // 2. Select Protocol
    await expect(page).toHaveURL(/\/test/);
    const silageBtn = page.locator("#btn-select-silage");
    await expect(silageBtn).toBeVisible();
    await silageBtn.click();

    // 3. Camera Capture QA
    await expect(page).toHaveURL(/\/test\/capture/);
    const captureBtn = page.locator("#btn-confirm-capture");
    await expect(captureBtn).toBeVisible();
    await captureBtn.click();

    // 4. Silage Sensor Inputs
    await expect(page).toHaveURL(/\/test\/silage/);
    const runBtn = page.locator("#btn-run-silage-analysis");
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    // 5. 7-Step Restrained Processing Sequence
    await expect(page).toHaveURL(/\/test\/processing/);
    await expect(page.locator("h1")).toContainText("PashuPoshan Multimodal Engine");

    // Auto-redirects to result upon step 7 completion
    await page.waitForURL(/\/test\/result\?id=/, { timeout: 15000 });
    await expect(page.locator("h1")).toBeVisible();

    // Verify Quality Gauge & Evidence Tags
    await expect(page.locator("text=Silage Fermentation & Storage Hazards")).toBeVisible();
    await expect(page.locator("text=Analysed on device — Offline")).toBeVisible();

    // 6. Actionable Advisory & Voice
    const advBtn = page.locator("#btn-view-advisory");
    await expect(advBtn).toBeVisible();
    await advBtn.click();

    await expect(page).toHaveURL(/\/advisory\?id=/);
    await expect(page.locator("h1")).toContainText("Decision:");
    await expect(page.locator("#btn-voice-readout")).toBeVisible();
    await expect(page.locator("text=6-Step Advisory Protocol")).toBeVisible();
  });

  test("renders Hero Demo and toggles healthy vs spoiled silage", async ({ page }) => {
    await page.goto("/demo/hero");
    await expect(page.locator("h1")).toContainText("Healthy vs Spoiled Silage");

    // Check Healthy Corn Silage
    await expect(page.locator("text=Healthy Corn Silage")).toBeVisible();
    await expect(page.locator("text=DECISION: FEED")).toBeVisible();

    // Click Scenario 2: Aerobic Bunker Heating
    const heatingTab = page.locator("button:has-text('2. Aerobic Bunker Heating')");
    await heatingTab.click();
    await expect(page.locator("text=ACTION: BLEND")).toBeVisible();
  });
});
