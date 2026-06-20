// Unit tests only (pure logic in public/core.js + public/data.js). E2E lives in Playwright.
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/unit/**/*.test.js"],
};
