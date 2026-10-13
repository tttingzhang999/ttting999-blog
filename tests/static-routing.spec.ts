import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";

const policy = JSON.parse(readFileSync("vercel.json", "utf8"));

test("all legacy aliases keep their 308 destination and query", async ({ request }) => {
  for (const { source, destination } of policy.redirects) {
    const response = await request.get(`${source}?from=legacy`, { maxRedirects: 0 });
    expect(response.status(), source).toBe(308);
    expect(new URL(response.headers().location, response.url()).pathname).toBe(destination);
    expect(new URL(response.headers().location, response.url()).search).toBe("?from=legacy");
  }
});

test("HTML canonical forms and missing articles use asset routing", async ({ request }) => {
  for (const path of ["/blog", "/en/resume", "/ja/resume", "/blog/leetcode-contest/leetcode-weekly-591"]) {
    expect((await request.get(path)).status(), path).toBe(200);
    for (const suffix of ["/", "/index.html"]) {
      const response = await request.get(path + suffix, { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      expect(new URL(response.headers().location, response.url()).pathname).toBe(path);
    }
  }
  for (const path of ["/blog/withdrawn-article", "/blog/not-published/深層文章", "/unknown-page"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
    expect(await response.text()).not.toContain('class="archive-entry');
  }
});

test("security headers cover HTML, 404 and assets; only bundles are immutable", async ({ request }) => {
  const bundle = readdirSync(".output/public/_nuxt").find(name => name.endsWith(".js"));
  for (const path of ["/blog", "/blog/withdrawn-article", `/_nuxt/${bundle}`]) {
    const response = await request.get(path);
    for (const { key, value } of policy.headers[0].headers) {
      expect(response.headers()[key.toLowerCase()], `${path}: ${key}`).toBe(value);
    }
    if (path.startsWith("/_nuxt/")) {
      expect(response.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");
    } else {
      expect(response.headers()["cache-control"] || "").not.toContain("immutable");
    }
  }
});
