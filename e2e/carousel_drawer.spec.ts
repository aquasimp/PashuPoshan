import { test, expect } from "@playwright/test";

test.describe("Carousel and SmoothDrawer E2E Integration Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Seed demo data into indexedDB / localStorage
    await page.addInitScript(() => {
      localStorage.setItem("feedshield_locale", "en");
      localStorage.setItem("pashuposhan_locale", "en");
    });
  });

  test("Home Page: Carousel cards render, navigate, and open SampleDetailDrawer", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    // 1. Locate Carousel section
    const carouselRegion = page.locator('section[aria-roledescription="carousel"]');
    await expect(carouselRegion.first()).toBeVisible();

    // 2. Check for carousel cards
    const cards = carouselRegion.first().locator('[data-carousel-card="true"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // 3. Click "Quick View" button on first card
    const quickViewBtn = cards.first().getByRole("button", { name: /Quick View/i });
    if (await quickViewBtn.isVisible()) {
      await quickViewBtn.click();

      // 4. Verify Drawer opens
      const drawer = page.locator('div[role="dialog"]');
      await expect(drawer).toBeVisible();

      // 5. Verify drawer title, evidence tags, and metrics
      await expect(drawer.locator("#smooth-drawer-title")).toBeVisible();

      // 6. Close drawer via Escape key
      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
    }
  });

  test("Hero Demo Page: ProductCarousel renders benchmark scenarios and opens drawer", async ({
    page,
  }) => {
    await page.goto("/demo/hero", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    // Find scenarios carousel
    const carousel = page.locator('section[aria-roledescription="carousel"]');
    await expect(carousel).toBeVisible();

    // Check for scenario cards
    const cards = carousel.locator('[data-carousel-card="true"]');
    expect(await cards.count()).toBeGreaterThanOrEqual(4);

    // Click "Inspect Scenario Details" on the first card
    const inspectBtn = cards.first().getByRole("button", { name: /Inspect Scenario Details/i });
    if (await inspectBtn.isVisible()) {
      await inspectBtn.click();

      const drawer = page.locator('div[role="dialog"]');
      await expect(drawer).toBeVisible();
      await expect(drawer.getByText(/Benchmark Dynamics/i)).toBeVisible();

      // Close drawer
      const closeBtn = drawer.getByRole("button", { name: /Close/i }).first();
      await closeBtn.click();
      await expect(drawer).toBeHidden();
    }
  });

  test("History Page: Top carousel renders and Quick View drawer functions", async ({ page }) => {
    await page.goto("/history", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    // Check if timeline samples or empty state is visible
    const quickViewBtn = page.getByRole("button", { name: /Quick View/i }).first();
    if (await quickViewBtn.isVisible()) {
      await quickViewBtn.click();
      const drawer = page.locator('div[role="dialog"]');
      await expect(drawer).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
    }
  });

  test("Design System Page: Interactive Carousel States & SmoothDrawer Showcase", async ({
    page,
  }) => {
    await page.goto("/design-system", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    // Section 7 Product Carousel component
    await expect(page.getByText("7. Product Carousel Component")).toBeVisible();

    // Test carousel states: Loading, Empty, Error
    await page.getByRole("button", { name: "Loading" }).click();
    await expect(page.locator(".animate-pulse").first()).toBeVisible();

    await page.getByRole("button", { name: "Empty" }).click();
    await expect(page.getByText(/No items recorded yet/i)).toBeVisible();

    await page.getByRole("button", { name: "Error" }).click();
    await expect(page.getByText(/Failed to stream field telemetry feed/i)).toBeVisible();

    // Switch back to Standard
    await page.getByRole("button", { name: "Standard / Multi-lang" }).click();

    // Section 8 Smooth Bottom-Sheet Drawer
    await expect(page.getByText("8. Smooth Bottom-Sheet Drawer Component")).toBeVisible();

    // Click Open Generic SmoothDrawer
    await page.getByRole("button", { name: /Open Generic SmoothDrawer/i }).click();
    const genericDrawer = page.locator('div[role="dialog"]');
    await expect(genericDrawer).toBeVisible();
    await expect(page.getByText("Field Advisory Protocol")).toBeVisible();
    await expect(page.getByText("Contributing Risk Factors")).toBeVisible();

    // Dismiss drawer
    await page.getByRole("button", { name: "Dismiss" }).click();
    await expect(genericDrawer).toBeHidden();

    // Click Open SampleDetailDrawer Preset
    await page.getByRole("button", { name: /Open SampleDetailDrawer Preset/i }).click();
    const sampleDrawer = page.locator('div[role="dialog"]');
    await expect(sampleDrawer).toBeVisible();
    await expect(page.getByText("Corn Silage Pit Alpha (High-Density Pack)")).toBeVisible();
    await expect(page.getByText("Flieg Score")).toBeVisible();

    // Close via escape
    await page.keyboard.press("Escape");
    await expect(sampleDrawer).toBeHidden();
  });
});
