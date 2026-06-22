const { test, expect } = require("@playwright/test");

test("footer 'All stops' accordion is collapsed and lists the itinerary in order", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(13); // app has rendered

  const details = page.locator("details.all-stops");
  await expect(details).toHaveJSProperty("open", false); // collapsed by default (unobtrusive)
  await expect(page.locator("#stopcount")).toHaveText(String(await page.locator("#stoplist li").count()));

  const items = page.locator("#stoplist li");
  expect(await items.count()).toBeGreaterThan(10);
  await expect(items.first()).toContainText("Mexico 2–0 South Africa"); // opener
  await expect(items.last()).toContainText("Argentina 2–0 Austria");    // latest stop
  await expect(items.last()).toContainText("Dallas");

  // expands on click
  await details.locator("summary").click();
  await expect(details).toHaveJSProperty("open", true);
});
