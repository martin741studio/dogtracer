import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle(/.+/);
});
