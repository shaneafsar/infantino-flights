const { test, expect } = require("@playwright/test");

test("arcade intro is lazy loaded and can be closed", async ({ page }) => {
  const introRequests = [];
  page.on("request", request => {
    if (/intro\.(js|css)$|intro-title-theme\.mp3$|arcade-(players|officials|crowd-animations|stadium|logo)\.webp$/.test(new URL(request.url()).pathname)) introRequests.push(request.url());
  });
  await page.goto("/");
  await expect(page.locator("circle.city")).toHaveCount(16);
  expect(introRequests).toEqual([]);

  await page.locator("#intro-trigger").click();
  await expect(page.locator("#arcade-intro")).toBeVisible();
  await expect(page.locator(".arcade-intro__canvas")).toBeVisible();
  expect(introRequests.some(url => url.endsWith("/intro.js"))).toBe(true);
  expect(introRequests.some(url => url.endsWith("/intro.css"))).toBe(true);
  expect(introRequests.some(url => url.endsWith("/intro-title-theme.mp3"))).toBe(true);
  expect(introRequests.some(url => url.endsWith("/arcade-players.webp"))).toBe(true);
  expect(introRequests.some(url => url.endsWith("/arcade-officials.webp"))).toBe(true);
  expect(introRequests.some(url => url.endsWith("/arcade-crowd-animations.webp"))).toBe(true);
  expect(introRequests.some(url => url.endsWith("/arcade-stadium.webp"))).toBe(true);
  expect(introRequests.some(url => url.endsWith("/arcade-logo.webp"))).toBe(true);

  await page.keyboard.press("Escape");
  await expect(page.locator("#arcade-intro")).toHaveCount(0);
  await expect(page.locator("#intro-trigger")).toBeFocused();
});

test("shows download progress while lazy intro assets load", async ({ page }) => {
  await page.route("**/arcade-stadium.webp", async route => {
    await new Promise(resolve => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.goto("/");
  await expect(page.locator("#intro-loader")).toBeHidden();

  await page.locator("#intro-trigger").click();
  await expect(page.locator("#intro-loader")).toBeVisible();
  await expect(page.locator("#intro-trigger")).toBeHidden();
  await expect(page.getByRole("progressbar", { name: "Loading arcade intro" })).toBeVisible();

  await expect(page.locator("#arcade-intro")).toBeVisible();
  await expect(page.locator("#intro-loader")).toBeHidden();
  await expect(page.locator("#intro-trigger")).toBeVisible();
  await expect(page.locator("#intro-trigger")).toBeEnabled();
});

test("reduced motion shows replay and close controls immediately", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#intro-trigger").click();

  await expect(page.locator("#arcade-intro")).toHaveClass(/is-finished/);
  await expect(page.getByRole("heading", { name: "Infantino Flights '26: World Cup Tour" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Replay" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mute music" })).toBeVisible();
  await page.getByRole("button", { name: "Mute music" }).click();
  await expect(page.getByRole("button", { name: "Unmute music" })).toBeVisible();
  await page.getByRole("button", { name: "Replay" }).click();
  await expect(page.locator("#arcade-intro")).not.toHaveClass(/is-finished/);
  await page.keyboard.press("Escape");
});
