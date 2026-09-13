import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:3000",
    locale: "zh-TW",
    viewport: { width: 1440, height: 900 },
    channel: "chrome",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
