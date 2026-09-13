import {test,expect} from '@playwright/test';
test('navigation keeps geometry and language through article routes',async({page})=>{
 await page.goto('/en/projects');
 const start=await page.locator('.site-primary').boundingBox();
 await page.locator('.site-primary a[href="/blog"]').click();
 await expect(page.locator('.site-primary a[href="/en/resume"]')).toBeVisible();
 const end=await page.locator('.site-primary').boundingBox();
 expect(Math.abs(start!.x-end!.x)).toBeLessThan(2);
 await page.reload();await expect(page.locator('.site-primary a[href="/en/resume"]')).toBeVisible();
 await expect(page.getByLabel('Language',{exact:true})).toHaveValue('en');
 await page.evaluate(()=>scrollTo(0,700));
 expect((await page.locator('.writing-nav').boundingBox())!.y).toBe(0);
});
test('mobile menu and TOC work without hydration layout changes',async({browser,page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/projects');
 expect((await page.locator('.writing-nav').boundingBox())!.height).toBeLessThan(100);
 await page.locator('.mobile-menu summary').click();await page.locator('.mobile-menu a[href="/resume"]').click();
 await expect(page.locator('.editorial-resume')).toBeVisible();
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const ssr=await context.newPage();await ssr.goto('http://127.0.0.1:3000/blog/concurrency');
 await expect(ssr.locator('.reader-toc a').first()).not.toBeVisible();
 await ssr.locator('.reader-toc summary').click();await expect(ssr.locator('.reader-toc a').first()).toBeVisible();
 await context.close();
});
test('chapter navigation and gallery respond to explicit actions',async({page})=>{
 await page.goto('/en/projects');
 await page.locator('.chapter-nav a[href="#solar-pv-monitoring-system"]').click();
 await expect(page.locator('.chapter-nav a[aria-current="location"]')).toHaveAttribute('href','#solar-pv-monitoring-system');
 await page.locator('#solar-pv-monitoring-system summary').click();
 const gallery=page.locator('#solar-pv-monitoring-system .project-gallery');
 await gallery.getByRole('button',{name:'Next image'}).click();
 await expect(gallery.locator('[aria-live]')).toHaveText('2 / 3');
 await page.goto('/blog/concurrency');
 await page.locator('.reader-toc a').nth(1).click();
 await expect(page.locator('.reader-toc a').nth(1)).toHaveAttribute('aria-current','location');
});
test('archive return is positioned before its first visible frame',async({page})=>{
 await page.goto('/blog');
 await page.locator('.archive-entry a').last().scrollIntoViewIfNeeded();
 const target=await page.evaluate(()=>scrollY);
 await page.locator('.archive-entry a').last().click();await page.locator('.reading-content').waitFor();
 await page.evaluate(()=>{
  (window as any).archiveFrames=[];
  const sample=()=>{if(document.querySelector('.archive-page')) (window as any).archiveFrames.push(scrollY);(window as any).archiveRaf=requestAnimationFrame(sample)};
  (window as any).archiveRaf=requestAnimationFrame(sample);
 });
 await page.getByRole('link',{name:'返回文章列表',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).archiveFrames.length)).toBeGreaterThan(8);
 const frames=await page.evaluate(()=>{cancelAnimationFrame((window as any).archiveRaf);return (window as any).archiveFrames as number[]});
 expect(Math.min(...frames)).toBeGreaterThan(target-50);
});
