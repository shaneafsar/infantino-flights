const { test, expect } = require("@playwright/test");

test("loads with no console errors and a fully built map", async ({ page }) => {
  const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", e => errors.push(String(e)));

  await page.goto("/");

  // app.js (ES module) has run once the deduped city dots exist
  await expect(page.locator("circle.city")).toHaveCount(16); // 50 stops dedupe to 16 on-map cities (Doha flies off-screen, no dot)
  await expect(page.locator("path.route-bg")).toHaveCount(1);
  await expect(page.locator("path.route-proj")).toHaveCount(0);   // tour complete — nothing projected
  await expect(page.locator("circle.proj-node")).toHaveCount(0);
  await expect(page.locator("text.plane")).toHaveCount(1);
  await expect.poll(() => page.locator("path.land").count()).toBeGreaterThan(0);

  expect(errors).toEqual([]);
});

test("off-continent inset renders the Doha detour", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(16);
  await expect(page.locator("g.inset")).toHaveCount(1);
  await expect(page.locator("path.inset-arc")).toHaveCount(1);            // Miami→Doha→Dallas great-circle
  await expect(page.locator("circle.inset-dot.doha")).toHaveCount(1);     // the Doha endpoint
  expect(await page.locator("path.inset-land").count()).toBeGreaterThan(20); // world silhouette
  await expect(page.locator(".inset")).toContainText("condolence detour");
  await expect(page.locator(".inset")).toContainText("Doha");
});

test("inset stays hidden until the plane flies the Doha detour, then its plane runs the arc", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(16);
  const inset = page.locator(".inset");
  const setT = (v) => page.$eval("#slider", (el, val) => { el.value = String(val); el.dispatchEvent(new Event("input")); }, v);

  await setT(0);
  await expect(inset).not.toHaveClass(/revealed/);            // hidden before the detour

  await setT(43.5);                                            // mid Miami→Doha leg (Doha is stop 44)
  await expect(inset).toHaveClass(/revealed/);                // pops up
  await expect(inset).toHaveClass(/active/);                  // brightens while airborne
  await expect(page.locator(".inset-plane")).toBeVisible();   // little plane flying out

  await setT(45);                                             // returned, resting at Dallas
  await expect(inset).toHaveClass(/revealed/);                // still up through the Dallas stop
  await expect(page.locator(".inset-plane")).toBeVisible();

  await setT(45.5);                                           // departing Dallas for the next stop
  await expect(inset).not.toHaveClass(/revealed/);           // fades out
  await expect(page.locator(".inset-plane")).toBeHidden();

  await page.$eval("#slider", (el) => { el.value = el.max; el.dispatchEvent(new Event("input")); });
  await expect(inset).not.toHaveClass(/revealed/);           // stays hidden for the rest of the tour
});
