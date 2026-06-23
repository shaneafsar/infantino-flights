const { test, expect } = require("@playwright/test");

const noHorizontalOverflow = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 0.5);

test("iPhone 15: mi/km toggle stays inside the Miles box, no page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(15);

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
  await expect(page.locator("circle.city")).toHaveCount(15);

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

test("CO2 milestone box keeps a constant height while scrubbing (no jump)", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(15);
  const heights = await page.evaluate(() => {
    const note = document.getElementById("co2note");
    const s = document.getElementById("slider");
    const hs = new Set();
    for (let v = 0; v <= parseFloat(s.max); v += 0.5) {
      s.value = String(v); s.dispatchEvent(new Event("input"));
      hs.add(note.offsetHeight);
    }
    return [...hs];
  });
  expect(heights).toHaveLength(1); // one distinct height across all milestones
});

test("Boston label stays within the map bounds on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(15);
  const within = await page.evaluate(() => {
    const map = document.getElementById("map").getBoundingClientRect();
    const boston = [...document.querySelectorAll("text.clabel")].find(l => l.textContent === "Boston");
    if (!boston) return null;
    const r = boston.getBoundingClientRect();
    return r.right <= map.right + 0.5 && r.left >= map.left - 0.5;
  });
  expect(within).toBe(true);
});

test("Philadelphia & New York labels fit and don't overlap on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(15);
  const r = await page.evaluate(() => {
    const map = document.getElementById("map").getBoundingClientRect();
    const box = name => {
      const el = [...document.querySelectorAll("text.clabel")].find(l => l.textContent === name);
      return el.getBoundingClientRect();
    };
    const phl = box("Philadelphia"), nyc = box("New York");
    const within = b => b.right <= map.right + 0.5 && b.left >= map.left - 0.5;
    const overlap = !(phl.right <= nyc.left || nyc.right <= phl.left || phl.bottom <= nyc.top || nyc.bottom <= phl.top);
    return { within: within(phl) && within(nyc), overlap };
  });
  expect(r.within).toBe(true);   // neither label is cut off at the map edge
  expect(r.overlap).toBe(false); // the close PHL/NYC pair doesn't collide
});

test("desktop: no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(15);
  expect(await noHorizontalOverflow(page)).toBe(true);
});
