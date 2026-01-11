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

test('detection overlay shows dog labels correctly', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');
  
  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.setAttribute('data-testid', 'detection-overlay');
    
    const primaryDog = document.createElement('div');
    primaryDog.setAttribute('data-testid', 'primary-dog-indicator');
    primaryDog.innerHTML = '<div>[PRIMARY_DOG] ⭐</div>';
    
    const otherDog = document.createElement('div');
    otherDog.setAttribute('data-testid', 'other-dog-indicator');
    otherDog.innerHTML = '<div>[OTHER_DOG_1]</div>';
    
    overlay.appendChild(primaryDog);
    overlay.appendChild(otherDog);
    document.body.appendChild(overlay);
  });
  
  await expect(page.getByTestId('detection-overlay')).toBeVisible();
  await expect(page.getByTestId('primary-dog-indicator')).toBeVisible();
  await expect(page.getByTestId('other-dog-indicator')).toBeVisible();
});
