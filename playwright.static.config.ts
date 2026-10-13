import { defineConfig } from "@playwright/test";

// Deliberately serves generated files with Workers, never Nuxt's dev server.
export default defineConfig({
  testDir: "./tests",
  testMatch: ["static-*.spec.ts", "article-views.spec.ts"],
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:8787",
    locale: "zh-TW",
    viewport: { width: 1440, height: 900 },
    channel: "chrome",
  },
  webServer: {
    command: "npm run test:static:serve",
    url: "http://127.0.0.1:8787/blog",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
