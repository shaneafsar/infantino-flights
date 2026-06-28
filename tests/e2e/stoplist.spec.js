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
  await expect(items.last()).toContainText("South Africa 0–0 Canada");  // latest stop
  await expect(items.last()).toContainText("Los Angeles");

  // expands on click
  await details.locator("summary").click();
  await expect(details).toHaveJSProperty("open", true);
});

test("'data last updated' stamp renders a formatted date with a timezone", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(16);

  const time = page.locator("#updated");
  await expect(time).toHaveText(/2026.*(EDT|EST|GMT|UTC|[A-Z]{2,4})/); // formatted date + tz abbreviation
  await expect(time).toHaveAttribute("datetime", /^2026-\d\d-\d\dT/);   // machine-readable ISO
});
