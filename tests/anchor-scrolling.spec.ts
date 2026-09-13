import {test,expect} from '@playwright/test';
for (const sample of [
 {path:'/en/projects',link:'.chapter-nav a[href="#solar-pv-monitoring-system"]',target:'#solar-pv-monitoring-system',root:'.editorial-projects'},
 {path:'/en/resume',link:'.chapter-nav a[href="#skills"]',target:'#skills',root:'.editorial-resume'},
 {path:'/blog/concurrency',link:'.reader-toc a[href="#範例程式碼"]',target:'#範例程式碼',root:'.reader-page'},
]) test(`chapter click scrolls continuously without replacing content: ${sample.path}`,async({page})=>{
 await page.goto(sample.path);
 await page.locator(sample.link).scrollIntoViewIfNeeded();
 await page.evaluate((selector)=>{
  const root=document.querySelector(selector)!;
  (window as any).anchorFrames=[];
  const sample=()=>{const style=getComputedStyle(root);(window as any).anchorFrames.push({y:scrollY,same:root===document.querySelector(selector),opacity:style.opacity,filter:style.filter});(window as any).anchorRaf=requestAnimationFrame(sample)};
  (window as any).anchorRaf=requestAnimationFrame(sample);
 },sample.root);
 await page.locator(sample.link).click();
 await expect.poll(()=>page.locator(sample.target).evaluate(el=>Math.abs(el.getBoundingClientRect().top-parseFloat(getComputedStyle(el).scrollMarginTop)))).toBeLessThan(2);
 const frames=await page.evaluate(()=>{cancelAnimationFrame((window as any).anchorRaf);return (window as any).anchorFrames as {y:number;same:boolean;opacity:string;filter:string}[]});
 expect(new Set(frames.map(frame=>Math.round(frame.y))).size).toBeGreaterThan(5);
 expect(frames.every(frame=>frame.same && frame.opacity==='1' && frame.filter==='none')).toBeTruthy();
});
test('reduced motion keeps chapter navigation immediate',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/en/projects');
 await page.evaluate(()=>{
  const original=window.scrollTo.bind(window);
  (window as any).scrollModes=[];
  window.scrollTo=((...args:any[])=>{(window as any).scrollModes.push(args[0]?.behavior);(original as any)(...args)}) as typeof window.scrollTo;
 });
 await page.locator('.chapter-nav a[href="#eatswiper"]').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).scrollModes.at(-1))).toBe('instant');
});
