import { defineConfig, devices } from "@playwright/test";

/**
 * Testes E2E da jornada pública (Home → ingressos → checkout).
 * Roda contra o `next dev` (basePath /encontro27) e o Supabase real via anon.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000/encontro27/",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 5"], viewport: { width: 375, height: 667 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/encontro27/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
