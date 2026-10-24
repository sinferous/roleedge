import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against a production build on port 3100 with throwaway credentials and
// a separate data file, so they never touch .env.local or the data you see in `npm run dev`.
const PORT = 3100;
export const E2E_ADMIN = { email: "owner@example.com", password: "e2e-only-password-0001" };

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    // Uses the installed Google Chrome locally; CI installs Playwright's Chromium instead.
    channel: process.env.CI ? undefined : "chrome",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /(pages|navigation)\.spec\.ts/ },
  ],
  webServer: {
    command: `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 300_000,
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      DATA_PROVIDER: "file",
      DATA_FILE: ".data/e2e-store.json",
      EMAIL_PROVIDER: "console",
      BOOKING_PROVIDER: "mock",
      AUTH_PROVIDER: "local",
      ADMIN_EMAILS: E2E_ADMIN.email,
      ADMIN_LOCAL_PASSWORD: E2E_ADMIN.password,
      SESSION_SECRET: "e2e-session-secret-not-for-real-use-000000",
      RATE_LIMIT_SALT: "e2e",
      SHOW_PENDING_CONTENT: "true",
    },
  },
});
