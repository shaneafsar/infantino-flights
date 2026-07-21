const { test, expect } = require("@playwright/test");

test("footer 'All stops' accordion is collapsed and lists the itinerary in order", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(16); // app has rendered

  const details = page.locator("details.all-stops");
  await expect(details).toHaveJSProperty("open", false); // collapsed by default (unobtrusive)
  await expect(page.locator("#stopcount")).toHaveText(String(await page.locator("#stoplist li").count()));

  const items = page.locator("#stoplist li");
  expect(await items.count()).toBeGreaterThan(10);
  await expect(items.first()).toContainText("Mexico 2–0 South Africa"); // opener
  await expect(items.last()).toContainText("Spain 1–0 Argentina");  // latest stop (the final)
  await expect(items.last()).toContainText("New York");
  await expect(page.locator("#stoplist")).toContainText("Condolence visit to Qatar's Emir"); // the Doha detour

  // expands on click
  await details.locator("summary").click();
  await expect(details).toHaveJSProperty("open", true);
});

test("every itinerary stop links to its source reference", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(16);
  const items = await page.locator("#stoplist li").count();
  await expect(page.locator("#stoplist a.src-link")).toHaveCount(items); // one link per stop
  const first = page.locator("#stoplist a.src-link").first();
  await expect(first).toHaveAttribute("target", "_blank");        // opens in a new tab
  await expect(first).toHaveAttribute("rel", /noopener/);
  await expect(first).toHaveAttribute("href", /^https:\/\//);      // a real source URL
});

test("'By the numbers' recap renders derived insights", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(16);

  const items = page.locator("#insights li");
  await expect(items).toHaveCount(7);
  await expect(page.locator("#insights")).toContainText("around the Earth");
  await expect(page.locator("#insights")).toContainText("Per match");
  await expect(page.locator("#insights")).toContainText("Miami ×6");          // most-visited hub
  await expect(page.locator("#insights")).toContainText("Busiest day");        // most-travel double-header
  await expect(page.locator("#insights")).toContainText("weather saved");      // Miami what-if
  await expect(page.locator("#insights")).toContainText("Doha detour");        // the off-continent trip
  await expect(page.locator("#insights")).toContainText("Doha → Dallas");      // longest hop is now the return leg
  // every insight highlights at least one figure
  await expect(page.locator("#insights .fig").first()).toBeVisible();
});

test("'data last updated' stamp renders a formatted date with a timezone", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(16);

  const time = page.locator("#updated");
  await expect(time).toHaveText(/2026.*(EDT|EST|GMT|UTC|[A-Z]{2,4})/); // formatted date + tz abbreviation
  await expect(time).toHaveAttribute("datetime", /^2026-\d\d-\d\dT/);   // machine-readable ISO
});
