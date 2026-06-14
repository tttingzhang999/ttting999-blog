import { defineNitroPlugin } from "nitropack/runtime";

// Blog is single-language (zh-TW only, opted out of i18n). The sitemap module's
// autoI18n adds en/ja hreflang alternates to every URL; strip them from blog
// entries so the sitemap advertises a single canonical URL per article,
// consistent with the page <head>. Other pages keep their alternates.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("sitemap:resolved", (ctx) => {
    for (const url of ctx.urls) {
      const path = String(url.loc).replace(/^https?:\/\/[^/]+/, "");
      if (/^\/blog(\/|$)/.test(path)) {
        url.alternatives = [];
      }
    }
  });
});
