import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');
  await expect(page).toHaveTitle(/DogTracer/);
});

test('camera button is visible', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');
  const cameraButton = page.getByTestId('camera-button');
  await expect(cameraButton).toBeVisible();
});
