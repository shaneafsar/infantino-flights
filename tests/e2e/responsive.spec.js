const { test, expect } = require("@playwright/test");

const noHorizontalOverflow = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 0.5);

test("iPhone 15: mi/km toggle stays inside the Miles box, no page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(12);

  const within = await page.evaluate(() => {
    const box = document.querySelector(".miles-stat").getBoundingClientRect();
    const tog = document.getElementById("unit").getBoundingClientRect();
    return tog.right <= box.right + 0.5 && tog.left >= box.left - 0.5 && tog.bottom <= box.bottom + 0.5;
  });
  expect(within).toBe(true);
  expect(await noHorizontalOverflow(page)).toBe(true);
});

test("iPhone 15: Miami summit caption does not overflow its box", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(12);

  // Jump to the Miami summit (index 5) — the tallest caption: icon + title + note + date.
  await page.$eval("#slider", (el) => { el.value = "5"; el.dispatchEvent(new Event("input")); });
  await expect(page.locator("#leg")).toContainText("Ritz-Carlton South Beach");

  // Content must fit inside the caption box (no vertical overflow -> no overlap).
  const overflow = await page.evaluate(() => {
    const leg = document.getElementById("leg");
    return leg.scrollHeight - leg.clientHeight;
  });
  expect(overflow).toBeLessThanOrEqual(1);
});

test("desktop: no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(12);
  expect(await noHorizontalOverflow(page)).toBe(true);
});
