const { test, expect } = require("@playwright/test");

// Drive state deterministically via the slider instead of waiting on animation.
const setT = (page, v) =>
  page.$eval("#slider", (el, val) => { el.value = String(val); el.dispatchEvent(new Event("input")); }, v);
const scrubToEnd = (page) =>
  page.$eval("#slider", (el) => { el.value = el.max; el.dispatchEvent(new Event("input")); });

async function ready(page) {
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(12);
}

test("end-of-tour stats", async ({ page }) => {
  await ready(page);
  await scrubToEnd(page);
  await expect(page.locator("#miles")).toHaveText("20,053");
  await expect(page.locator("#games")).toHaveText("15");
  await expect(page.locator("#co2")).toHaveText("60.2");
  await expect(page.locator("#leg")).toContainText("Atlanta");
  await expect(page.locator("#leg")).toContainText("Mercedes-Benz Stadium");
  await expect(page.locator("#leg")).toContainText("mi total");
});

test("mi/km toggle flips value, label, active segment, and caption total", async ({ page }) => {
  await ready(page);
  await scrubToEnd(page);
  await expect(page.locator("#miles")).toHaveText("20,053");
  await expect(page.locator("#unit .u-mi")).toHaveClass(/on/);

  await page.locator("#unit").click(); // whole control is the target
  await expect(page.locator("#miles")).toHaveText("32,272");
  await expect(page.locator("#milesLabel")).toHaveText("Km flown");
  await expect(page.locator("#unit .u-km")).toHaveClass(/on/);
  await expect(page.locator("#leg")).toContainText("km total");

  await page.locator("#unit").click();
  await expect(page.locator("#miles")).toHaveText("20,053");
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

test("plane nose points toward the next city", async ({ page }) => {
  await ready(page);
  // mid first leg: Mexico City (dot 0) -> Guadalajara (dot 1)
  await page.$eval("#slider", (el) => { el.value = "0.5"; el.dispatchEvent(new Event("input")); });
  const d = await page.evaluate(() => {
    const c = document.querySelectorAll("circle.city");
    const a = { x: +c[0].getAttribute("cx"), y: +c[0].getAttribute("cy") };
    const b = { x: +c[1].getAttribute("cx"), y: +c[1].getAttribute("cy") };
    const tr = document.querySelector("text.plane").getAttribute("transform");
    const m = /rotate\(([-\d.]+)/.exec(tr || "");
    return { a, b, angle: m ? parseFloat(m[1]) : null };
  });
  // travel angle + 45deg offset for the emoji's default up-right nose
  const expected = Math.atan2(d.b.y - d.a.y, d.b.x - d.a.x) * 180 / Math.PI + 45;
  expect(d.angle).not.toBeNull();
  expect(Math.abs(d.angle - expected)).toBeLessThan(0.5);
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
