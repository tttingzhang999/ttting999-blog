import {test,expect} from '@playwright/test';

test('locale change preserves the header, chapter and final reading position',async({page})=>{
 await page.goto('/en/projects#eatswiper');
 await expect(page.locator('#eatswiper')).toBeInViewport();
 await page.evaluate(()=>{(window as any).originalHeader=document.querySelector('.site-header')});
 await page.getByLabel('Language',{exact:true}).selectOption('ja');
 await expect(page).toHaveURL(/\/ja\/projects#eatswiper/);
 await expect(page.locator('.site-header')).toHaveAttribute('aria-busy','false');
 expect(await page.evaluate(()=>(window as any).originalHeader===document.querySelector('.site-header'))).toBe(true);
 await expect(page.locator('#eatswiper')).toBeInViewport();
 expect(await page.locator('.case-study').first().evaluate(el=>getComputedStyle(el).opacity)).toBe('1');
});

test('home locale change retains writing without replaying the scan',async({page})=>{
 await page.goto('/en#writing');
 await expect(page.locator('.home-scenes')).toHaveAttribute('data-mode','scenes');
 await page.getByLabel('Language',{exact:true}).selectOption('ja');
 await expect(page).toHaveURL(/\/ja#writing/);
 await expect(page.locator('.site-header')).toHaveAttribute('aria-busy','false');
 await expect(page.locator('.home-scenes')).toHaveAttribute('data-scene','1');
 await expect(page.locator('.home-scenes')).toHaveAttribute('data-journal-intro','done');
 await expect(page.locator('.journal-composition')).toBeVisible();
});

test('article language preference keeps content, query and scroll',async({page})=>{
 await page.goto('/blog/concurrency');
 await page.evaluate(()=>scrollTo(0,600));
 await page.getByLabel('Language',{exact:true}).selectOption('ja');
 await expect(page.locator('.site-header')).toHaveAttribute('aria-busy','false');
 await expect(page).toHaveURL(/\/blog\/concurrency$/);
 expect(await page.evaluate(()=>scrollY)).toBe(600);
 await page.reload();
 await expect(page.getByLabel('Language',{exact:true})).toHaveValue('ja');
});

test('native homepage manual scroll survives language switching',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/en');
 await expect(page.locator('.home-scenes')).toHaveAttribute('data-mode','reading');
 await page.locator('.journal-heading').evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY+140));
 const position=await page.evaluate(()=>scrollY);
 await page.getByLabel('Language',{exact:true}).selectOption('ja');
 await expect(page.locator('.site-header')).toHaveAttribute('aria-busy','false');
 expect(Math.abs(await page.evaluate(()=>scrollY)-position)).toBeLessThan(5);
 await expect(page).toHaveURL(/\/ja/);
});
