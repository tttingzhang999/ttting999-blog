import { test, expect } from '@playwright/test';

for (const prefix of ['', '/en', '/ja']) {
  test(`new project chapters, images and links ${prefix || 'zh'}`, async ({ page }) => {
    await page.goto(`${prefix}/projects`);
    await expect(page.locator('.site-header')).toHaveAttribute('aria-busy', 'false');
    for (const [id, count] of [['wedding', 3], ['aws-diagram', 2]] as const) {
      await page.locator(`.chapter-nav a[href="#${id}"]`).click();
      const chapter = page.locator(`#${id}`);
      await expect(chapter).toBeInViewport();
      await chapter.locator('summary').click();
      const gallery = chapter.locator('.project-gallery');
      await expect(gallery.locator('img')).toHaveCount(count);
      await gallery.scrollIntoViewIfNeeded();
      for (let index = 0; index < count; index++) {
        if (index > 0) await gallery.getByRole('button', { name: 'Next image' }).click();
        await expect(gallery.locator('[aria-live]')).toHaveText(`${index + 1} / ${count}`);
        const image = gallery.locator('img').nth(index);
        await expect.poll(() => image.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      }
      await expect(gallery.getByRole('button', { name: 'Next image' })).toBeDisabled();
      await gallery.getByRole('button', { name: 'Previous image' }).click();
      await expect(gallery.locator('[aria-live]')).toHaveText(`${count - 1} / ${count}`);
    }
    await expect(page.locator('#wedding .interior-links a')).toHaveAttribute('href', 'https://wedding.tttingzhang999.com/');
    await expect(page.locator('#aws-diagram .interior-links a')).toHaveAttribute('href', 'https://github.com/tttingzhang999/aws-diagram');
    await page.setViewportSize({ width: 390, height: 844 });
    for (const id of ['wedding', 'aws-diagram']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    }
  });
}
