import {test,expect} from '@playwright/test';
for (const width of [1440,390]) test(`page titles share position and type scale at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 const samples=[];
 for(const path of ['/resume','/projects','/blog']) {
  await page.goto(path);
  samples.push(await page.locator('h1').first().evaluate(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,size:getComputedStyle(el).fontSize,line:getComputedStyle(el).lineHeight})));
 }
 for(const sample of samples.slice(1)) {
  expect(Math.abs(sample.x-samples[0]!.x)).toBeLessThan(1);
  expect(Math.abs(sample.y-samples[0]!.y)).toBeLessThan(1);
  expect(sample.size).toBe(samples[0]!.size);expect(sample.line).toBe(samples[0]!.line);
 }
});
test('header routes dissolve and home owns every scene',async({page})=>{
 await page.goto('/en#practice');
 await expect(page.locator('.home-scenes')).toHaveAttribute('data-scene','2');
 await expect(page.locator('.site-primary a')).toHaveText(['Home','Resume','Projects','Writing']);
 await expect(page.locator('.site-primary a[aria-current="page"]')).toHaveText('Home');
 await page.evaluate(()=>{const original=document.startViewTransition.bind(document);(window as any).transitions=0;document.startViewTransition=(...args:Parameters<typeof original>)=>{(window as any).transitions++;return original(...args)}});
 await page.locator('.site-primary a[href="/en/resume"]').click();
 await expect(page.locator('.editorial-resume')).toBeVisible();
 await expect(page.locator('.site-header')).toHaveAttribute('aria-busy','false');
 expect(await page.evaluate(()=>(window as any).transitions)).toBe(1);
 await page.locator('.site-primary a[href="/en"]').click();
 await expect(page.locator('.site-header')).toHaveAttribute('aria-busy','false');
 await expect(page.locator('.home-scenes')).toHaveAttribute('data-scene','0');
 expect(await page.evaluate(()=>(window as any).transitions)).toBe(2);
});

test('a header destination requested during a dissolve is not discarded',async({page})=>{
 await page.goto('/resume');
 await page.locator('.site-primary a[href="/projects"]').click();
 await expect(page.locator('.case-study')).toHaveCount(6);
 await expect(page.locator('.site-header')).toHaveAttribute('aria-busy','true');
 await page.locator('.site-primary a[href="/blog"]').dispatchEvent('click',{button:0});
 await expect(page).toHaveURL(/\/blog$/);
 await expect(page.locator('.site-header')).toHaveAttribute('aria-busy','false');
});
