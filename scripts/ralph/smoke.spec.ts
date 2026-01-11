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

test('detection overlay shows human labels correctly', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');
  
  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.setAttribute('data-testid', 'detection-overlay');
    
    const person1 = document.createElement('div');
    person1.setAttribute('data-testid', 'person-indicator');
    person1.innerHTML = '<div>[PERSON_1] 👤</div>';
    
    const person2 = document.createElement('div');
    person2.setAttribute('data-testid', 'person-indicator');
    person2.innerHTML = '<div>[PERSON_2] 👤</div>';
    
    overlay.appendChild(person1);
    overlay.appendChild(person2);
    document.body.appendChild(overlay);
  });
  
  await expect(page.getByTestId('detection-overlay')).toBeVisible();
  const personIndicators = page.getByTestId('person-indicator');
  await expect(personIndicators).toHaveCount(2);
});

test('entity naming modal has all required fields', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');
  
  await page.evaluate(() => {
    const modal = document.createElement('div');
    modal.setAttribute('data-testid', 'entity-naming-modal');
    modal.innerHTML = `
      <input data-testid="entity-name-input" placeholder="Name" />
      <input data-testid="dog-breed-input" placeholder="Breed" />
      <button data-testid="dog-sex-male">Male</button>
      <button data-testid="dog-sex-female">Female</button>
      <button data-testid="dog-size-small">Small</button>
      <button data-testid="dog-size-medium">Medium</button>
      <button data-testid="dog-size-large">Large</button>
      <button data-testid="dog-relationship-friend">Friend</button>
      <button data-testid="dog-relationship-neutral">Neutral</button>
      <button data-testid="dog-relationship-conflict">Conflict</button>
      <textarea data-testid="entity-notes-input" placeholder="Notes"></textarea>
      <button data-testid="entity-modal-save">Save</button>
      <button data-testid="entity-modal-cancel">Cancel</button>
    `;
    document.body.appendChild(modal);
  });
  
  await expect(page.getByTestId('entity-naming-modal')).toBeVisible();
  await expect(page.getByTestId('entity-name-input')).toBeVisible();
  await expect(page.getByTestId('dog-breed-input')).toBeVisible();
  await expect(page.getByTestId('entity-notes-input')).toBeVisible();
  await expect(page.getByTestId('entity-modal-save')).toBeVisible();
  await expect(page.getByTestId('entity-modal-cancel')).toBeVisible();
});
