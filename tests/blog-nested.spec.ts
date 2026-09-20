import { test, expect } from "@playwright/test";

test("nested article renders on direct load and archive navigation", async ({
  page,
}) => {
  const route = "/blog/leetcode-contest/leetcode-weekly-591";
  await page.goto(route);
  await expect(page.locator("h1")).toContainText("591");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://info.tttingzhang999.com${route}`,
  );
  const schema = JSON.parse(
    await page.locator('script[type="application/ld+json"]').innerText(),
  );
  expect(schema.url).toBe(`https://info.tttingzhang999.com${route}`);
  await page.goto("/blog");
  const search = page.getByRole("searchbox");
  await search.fill("591");
  await page.locator(`a[href="${route}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(route + "$"));
  await expect(page.locator("h1")).toContainText("591");
});
test("withdrawn article and unknown nested article are missing", async ({
  request,
}) => {
  for (const route of [
    "/blog/how-i-get-saa",
    "/blog/leetcode-contest/not-found",
  ])
    expect((await request.get(route)).status()).toBe(404);
});
