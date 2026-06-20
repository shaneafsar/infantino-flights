const { test, expect } = require("@playwright/test");

// Drive state deterministically via the slider instead of waiting on animation.
const setT = (page, v) =>
  page.$eval("#slider", (el, val) => { el.value = String(val); el.dispatchEvent(new Event("input")); }, v);
const scrubToEnd = (page) =>
  page.$eval("#slider", (el) => { el.value = el.max; el.dispatchEvent(new Event("input")); });

async function ready(page) {
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(9);
}

test("end-of-tour stats", async ({ page }) => {
  await ready(page);
  await scrubToEnd(page);
  await expect(page.locator("#miles")).toHaveText("14,454");
  await expect(page.locator("#games")).toHaveText("11");
  await expect(page.locator("#co2")).toHaveText("43.4");
  await expect(page.locator("#leg")).toContainText("Vancouver");
  await expect(page.locator("#leg")).toContainText("BC Place");
  await expect(page.locator("#leg")).toContainText("mi total");
});

test("mi/km toggle flips value, label, active segment, and caption total", async ({ page }) => {
  await ready(page);
  await scrubToEnd(page);
  await expect(page.locator("#miles")).toHaveText("14,454");
  await expect(page.locator("#unit .u-mi")).toHaveClass(/on/);

  await page.locator("#unit").click(); // whole control is the target
  await expect(page.locator("#miles")).toHaveText("23,261");
  await expect(page.locator("#milesLabel")).toHaveText("Km flown");
  await expect(page.locator("#unit .u-km")).toHaveClass(/on/);
  await expect(page.locator("#leg")).toContainText("km total");

  await page.locator("#unit").click();
  await expect(page.locator("#miles")).toHaveText("14,454");
  await expect(page.locator("#unit .u-mi")).toHaveClass(/on/);
});

test("CO2 milestone text steps up across the tour", async ({ page }) => {
  await ready(page);
  await setT(page, 0);
  await expect(page.locator("#co2note")).toHaveText("");
  await setT(page, 3); // ~5.7 t
  await expect(page.locator("#co2note")).toContainText("yearly carbon footprint");
  await setT(page, 5); // ~16.6 t (Miami)
  await expect(page.locator("#co2note")).toContainText("American");
  await scrubToEnd(page); // ~43 t
  await expect(page.locator("#co2note")).toContainText("Americans");
});

test("captions show stadium name; Miami summit is not counted as a game", async ({ page }) => {
  await ready(page);
  await setT(page, 0);
  await expect(page.locator("#leg")).toContainText("Estadio Azteca");
  await setT(page, 5); // Miami summit
  await expect(page.locator("#leg")).toContainText("FIFA Executive Football Summit");
  await expect(page.locator("#leg")).toContainText("Ritz-Carlton South Beach");
  await expect(page.locator("#games")).toHaveText("5"); // summit does not bump the counter
});

test("play / pause / replay button labels", async ({ page }) => {
  await ready(page);
  const pp = page.locator("#pp");
  await expect(pp).toContainText("Pause");   // auto-plays on load
  await pp.click();
  await expect(pp).toContainText("Play");     // paused
  await scrubToEnd(page);
  await expect(pp).toContainText("Replay");   // at the end
});
