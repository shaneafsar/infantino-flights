const { test, expect } = require("@playwright/test");

test("?stop=<slug> opens paused on that stop", async ({ page }) => {
  await page.goto("/?stop=jun-21-miami");
  await expect(page.locator("circle.city")).toHaveCount(15);
  await expect(page.locator("#leg")).toContainText("Hard Rock Stadium");
  await expect(page.locator("#leg")).toContainText("Uruguay 2–2 Cape Verde");
  await expect(page.locator("#pp")).not.toContainText("Pause"); // paused, not autoplaying
  expect(await page.$eval("#slider", el => el.value)).toBe("16"); // last stop index
});

test("?stop=<number> works (1-based)", async ({ page }) => {
  await page.goto("/?stop=1");
  await expect(page.locator("circle.city")).toHaveCount(15);
  await expect(page.locator("#leg")).toContainText("Mexico City");
  await expect(page.locator("#pp")).not.toContainText("Pause");
  expect(await page.$eval("#slider", el => el.value)).toBe("0");
});

test("invalid ?stop= falls back to autoplay with no console errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("/?stop=bogus");
  await expect(page.locator("circle.city")).toHaveCount(15);
  await expect(page.locator("#pp")).toContainText("Pause"); // autoplaying from the start
  expect(errors).toEqual([]);
});

test("Share button copies a link to the current stop", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/?stop=jun-19-boston");
  await expect(page.locator("circle.city")).toHaveCount(15);
  await page.locator("#share").click();
  await expect(page.locator("#share")).toContainText("Copied");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("?stop=jun-19-boston");
});
