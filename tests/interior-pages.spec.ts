import {test,expect} from '@playwright/test';
for (const prefix of ['', '/en', '/ja']) {
 test(`unified resume and projects ${prefix || 'zh'}`,async({page})=>{
  await page.goto(`${prefix}/resume`);
  await expect(page.locator('.editorial-resume h1')).toBeVisible();
  await expect(page.locator('.career-entry')).not.toHaveCount(0);
  await expect(page.locator('a[href="/resume.pdf"]')).toBeVisible();
  await page.locator('.site-primary a[href$="/projects"]').click();
  await expect(page.locator('.case-study')).toHaveCount(6);
  const details=page.locator('.case-study details').first();
  await details.locator('summary').focus();await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open','');
  await expect(details.locator('.case-highlights')).toBeVisible();
  await page.locator('.site-primary a[href="/blog"]').click();
  await expect(page.locator('.archive-entry')).not.toHaveCount(0);
 });
}
test('mobile and no-JS interior content remains available',async({browser,page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const path of ['/resume','/projects','/blog']) {
  await page.goto(path);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 }
 const context=await browser.newContext({javaScriptEnabled:false});
 const ssr=await context.newPage();await ssr.goto('http://127.0.0.1:3000/projects');
 await ssr.locator('.case-study summary').first().click();
 await expect(ssr.locator('.case-highlights').first()).toBeVisible();
 await ssr.goto('http://127.0.0.1:3000/resume');
 await expect(ssr.locator('.career-entry').first()).toBeVisible();await context.close();
});
