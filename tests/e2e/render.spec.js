const { test, expect } = require("@playwright/test");

test("loads with no console errors and a fully built map", async ({ page }) => {
  const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", e => errors.push(String(e)));

  await page.goto("/");

  // app.js (ES module) has run once the deduped city dots exist
  await expect(page.locator("circle.city")).toHaveCount(16); // 39 stops dedupe to 16 unique cities
  await expect(page.locator("path.route-bg")).toHaveCount(1);
  await expect(page.locator("text.plane")).toHaveCount(1);
  await expect.poll(() => page.locator("path.land").count()).toBeGreaterThan(0);

  expect(errors).toEqual([]);
});
