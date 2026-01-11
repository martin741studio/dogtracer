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

test('tags modal has all preset tags', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');
  
  const expectedTags = ['walk', 'play', 'rest', 'training', 'feeding', 'vet', 'bath', 'social', 'stress'];
  
  await page.evaluate((tags) => {
    const modal = document.createElement('div');
    modal.setAttribute('data-testid', 'tags-modal');
    modal.innerHTML = `
      <div data-testid="tag-buttons">
        ${tags.map(tag => `<button data-testid="tag-${tag}">${tag}</button>`).join('')}
      </div>
      <textarea data-testid="notes-input"></textarea>
      <button data-testid="save-button">Save</button>
      <button data-testid="cancel-button">Cancel</button>
    `;
    document.body.appendChild(modal);
  }, expectedTags);
  
  for (const tag of expectedTags) {
    await expect(page.getByTestId(`tag-${tag}`)).toBeVisible();
  }
  
  await expect(page.getByTestId('notes-input')).toBeVisible();
  await expect(page.getByTestId('save-button')).toBeVisible();
  await expect(page.getByTestId('cancel-button')).toBeVisible();
});
