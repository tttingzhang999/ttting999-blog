import {test,expect} from '@playwright/test';
test('desktop uses native cursor with no tracking overlay',async({page})=>{
 for(const path of ['/en#intro','/en/projects','/blog']) {
  await page.goto(path);
  await page.mouse.move(300,200);
  await expect(page.locator('.site-cursor')).toHaveCount(0);
  const link=page.locator('a:visible').first();
  await expect(link).toHaveCSS('cursor','pointer');
  expect(await page.locator('body').evaluate(el=>getComputedStyle(el).cursor)).not.toBe('none');
 }
});
