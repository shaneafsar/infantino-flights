const { test, expect } = require("@playwright/test");

// Drive state deterministically via the slider instead of waiting on animation.
const setT = (page, v) =>
  page.$eval("#slider", (el, val) => { el.value = String(val); el.dispatchEvent(new Event("input")); }, v);
const scrubToEnd = (page) =>
  page.$eval("#slider", (el) => { el.value = el.max; el.dispatchEvent(new Event("input")); });

async function ready(page) {
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(16);
}

test("end-of-tour stats", async ({ page }) => {
  await ready(page);
  await scrubToEnd(page);
  await expect(page.locator("#miles")).toHaveText("50,360"); // final is a 0-mile leg (he was already in NY)
  await expect(page.locator("#games")).toHaveText("41");     // the final counts; reception did not
  await expect(page.locator("#co2")).toHaveText("438.1");
  await expect(page.locator("#cost")).toHaveText("$1,372,640"); // no landing fee for the 0-mile leg
  await expect(page.locator("#leg")).toContainText("New York");
  await expect(page.locator("#leg")).toContainText("MetLife Stadium");
});

test("mi/km flips on a tap anywhere in the control (not just the off radio)", async ({ page }) => {
  await ready(page);
  await scrubToEnd(page);
  await expect(page.locator("#miles")).toHaveText("50,360");
  await expect(page.getByRole("radio", { name: "mi" })).toBeChecked();

  // tapping the whole control flips mi -> km
  await page.locator("#unit").click();
  await expect(page.locator("#miles")).toHaveText("81,046");
  await expect(page.locator("#milesLabel")).toHaveText("Km flown");
  await expect(page.getByRole("radio", { name: "km" })).toBeChecked();

  // tapping the *already-active* "km" label still flips back to mi (whole area toggles)
  await page.locator('label[for="unit-km"]').click();
  await expect(page.locator("#miles")).toHaveText("50,360");
  await expect(page.getByRole("radio", { name: "mi" })).toBeChecked();
});

test("mi/km still responds to the native radio change (keyboard / assistive tech path)", async ({ page }) => {
  await ready(page);
  // Selecting a radio via keyboard fires `change` (no pointer click); simulate that directly.
  await page.evaluate(() => {
    const km = document.getElementById("unit-km");
    km.checked = true;
    km.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(page.locator("#milesLabel")).toHaveText("Km flown");
  await expect(page.getByRole("radio", { name: "km" })).toBeChecked();
});

test("CO2 milestone text steps up across the tour", async ({ page }) => {
  await ready(page);
  await setT(page, 0);
  await expect(page.locator("#co2note")).toHaveText("");
  await setT(page, 3); // ~17 t (San Francisco)
  await expect(page.locator("#co2note")).toContainText("average American");
  await setT(page, 5); // ~48 t (Miami)
  await expect(page.locator("#co2note")).toContainText("cars driven for a full year");
  await scrubToEnd(page); // ~438 t — lands on the "around the Earth ~43 times" tier (coal rung is headroom)
  await expect(page.locator("#co2note")).toContainText("around the Earth");
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

test("paused animation stops its rAF loop (guards the double-speed-on-resume bug)", async ({ page }) => {
  // Count every requestAnimationFrame call (the app's only rAF user is the tick loop).
  await page.addInitScript(() => {
    window.__raf = 0;
    const orig = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => { window.__raf++; return orig(cb); };
  });
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(16);

  await page.locator("#pp").click();        // pause
  await expect(page.locator("#pp")).toContainText("Play");
  await page.waitForTimeout(100);           // let the in-flight frame settle
  await page.evaluate(() => { window.__raf = 0; });
  await page.waitForTimeout(500);           // ~30 frames at 60fps if a loop were still running

  // With the bug, tick() kept rescheduling while paused (~30); fixed, it stops (~0).
  expect(await page.evaluate(() => window.__raf)).toBeLessThan(5);
});

test("animation pace is frame-rate independent (30fps vs 60fps reach the same point)", async ({ page }) => {
  // Replace rAF with a manual queue so the test feeds the loop exact timestamps.
  // Frame-based timing (the old bug) would advance 2x further per wall-clock ms at 60fps;
  // time-based timing lands on the same t for the same elapsed time at any frame rate.
  await page.addInitScript(() => {
    window.__q = [];
    window.requestAnimationFrame = (cb) => { window.__q.push(cb); return window.__q.length; };
    // Run `totalMs` of simulated time in fixed `stepMs` ticks, then report t (= slider.value).
    window.__simulate = (totalMs, stepMs) => {
      let now = 0;
      while (now < totalMs) {
        now += stepMs;
        const cbs = window.__q.splice(0);
        for (const cb of cbs) cb(now);
      }
      return parseFloat(document.getElementById("slider").value);
    };
  });

  // 10s covers: 4s pause + leg 0 (~1.4s) + 4s pause + partway into leg 1, so t lands
  // mid-leg (a non-integer) — a real motion check, not just a snapped-to-stop integer.
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(16);
  const t30 = await page.evaluate(() => window.__simulate(10000, 1000 / 30)); // 10s at 30fps

  await page.reload();
  await expect(page.locator("circle.city")).toHaveCount(16);
  const t60 = await page.evaluate(() => window.__simulate(10000, 1000 / 60)); // 10s at 60fps

  expect(t30).toBeGreaterThan(1.2);               // cleared two pauses and flew into the second leg
  expect(Math.abs(t30 - t60)).toBeLessThan(0.1);  // same wall-clock time -> same position (frame-rate independent)
});

test("plane lands on the final stop regardless of path (no stale-transform fling)", async ({ page }) => {
  await ready(page);
  const center = () => page.evaluate(() => {
    const r = document.querySelector("text.plane").getBoundingClientRect();
    return [r.x + r.width / 2, r.y + r.height / 2];
  });
  const go = (v) => page.$eval("#slider", (el, val) => { el.value = String(val); el.dispatchEvent(new Event("input")); }, String(v));
  const max = await page.$eval("#slider", (el) => el.max);

  await go(parseFloat(max) - 0.01); await go(max); const fromNear = await center();
  await go(2);                      await go(max); const fromFar = await center();

  // end position must be path-independent (bug flung it ~775px off-screen)
  expect(Math.hypot(fromNear[0] - fromFar[0], fromNear[1] - fromFar[1])).toBeLessThan(2);
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

test("slider tick ruler has one tick per stop, aligned to the track, with phase majors", async ({ page }) => {
  await ready(page);
  const stopCount = Number(await page.locator("#stopcount").textContent());
  await expect(page.locator("#ticks .tick")).toHaveCount(stopCount);   // one mark per stop
  expect(await page.locator("#ticks .tick.major").count()).toBeGreaterThanOrEqual(5); // opener + knockout starts
  const align = await page.evaluate(() => {
    const s = document.getElementById("slider").getBoundingClientRect();
    const t = [...document.querySelectorAll("#ticks .tick")];
    const f = t[0].getBoundingClientRect(), l = t[t.length - 1].getBoundingClientRect();
    return { dl: Math.abs(f.left - s.left), dr: Math.abs(l.left - s.right) };
  });
  expect(align.dl).toBeLessThan(14); // first tick ≈ thumb centre at stop 0
  expect(align.dr).toBeLessThan(14); // last tick ≈ thumb centre at final stop
});

// Guards the regression where a global `svg{}` rule (meant for the map) leaked onto
// the button icons and blew them up to ~100px, overlapping the whole UI.
test("control button icons stay small and never exceed their button", async ({ page }) => {
  await ready(page);
  const icons = page.locator("button .btn-ico svg");
  const count = await icons.count();
  expect(count).toBeGreaterThan(0); // #pp + #share at minimum
  for (let i = 0; i < count; i++) {
    const size = await icons.nth(i).evaluate((svg) => {
      const r = svg.getBoundingClientRect();
      const btn = svg.closest("button").getBoundingClientRect();
      return { w: r.width, h: r.height, btnH: btn.height };
    });
    expect(size.w).toBeGreaterThan(6);          // rendered, not collapsed
    expect(size.w).toBeLessThan(24);            // small icon, not a giant SVG
    expect(size.h).toBeLessThan(24);
    expect(size.h).toBeLessThanOrEqual(size.btnH + 0.5); // fits inside its button
  }
});
