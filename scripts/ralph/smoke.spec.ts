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

test('timeline page has date picker and navigation', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/timeline');
  
  await expect(page.getByTestId('date-display')).toBeVisible();
  await expect(page.getByTestId('date-picker')).toBeVisible();
  await expect(page.getByTestId('prev-day-button')).toBeVisible();
  await expect(page.getByTestId('next-day-button')).toBeVisible();
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

test('timeline shows session and moment view toggle', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/timeline');

  await page.evaluate(() => {
    localStorage.setItem('dogtracer_moments', JSON.stringify([{
      id: 'test-moment-1',
      photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      timestamp: new Date().toISOString(),
      timestampLocal: new Date().toLocaleString(),
      createdAt: Date.now(),
      gps: null,
      tags: ['walk'],
      notes: '',
      mood: null,
      moodConfidence: null,
      entityIds: [],
      sessionId: null
    }]));
  });

  await page.reload();
  await expect(page.getByTestId('view-sessions-button')).toBeVisible();
  await expect(page.getByTestId('view-moments-button')).toBeVisible();
  await expect(page.getByTestId('sessions-view')).toBeVisible();
  
  await page.getByTestId('view-moments-button').click();
  await expect(page.getByTestId('moments-view')).toBeVisible();
});

test('moment detail modal has mood override buttons', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/timeline');
  
  await page.evaluate(() => {
    const modal = document.createElement('div');
    modal.setAttribute('data-testid', 'moment-detail-modal');
    modal.innerHTML = `
      <button data-testid="mood-button-calm">😌 calm</button>
      <button data-testid="mood-button-excited">🤩 excited</button>
      <button data-testid="mood-button-alert">👀 alert</button>
      <button data-testid="mood-button-anxious">😰 anxious</button>
      <button data-testid="mood-button-tired">😴 tired</button>
      <button data-testid="mood-button-playful">🎾 playful</button>
    `;
    document.body.appendChild(modal);
  });
  
  await expect(page.getByTestId('moment-detail-modal')).toBeVisible();
  await expect(page.getByTestId('mood-button-calm')).toBeVisible();
  await expect(page.getByTestId('mood-button-excited')).toBeVisible();
  await expect(page.getByTestId('mood-button-alert')).toBeVisible();
  await expect(page.getByTestId('mood-button-anxious')).toBeVisible();
  await expect(page.getByTestId('mood-button-tired')).toBeVisible();
  await expect(page.getByTestId('mood-button-playful')).toBeVisible();
});

test('mood display shows on moment card when mood is set', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/timeline');
  
  await page.evaluate(() => {
    const card = document.createElement('div');
    card.setAttribute('data-testid', 'moment-card');
    card.innerHTML = `
      <div data-testid="mood-display">
        <span>😌</span>
        <span>Calm</span>
        <span>(85%)</span>
      </div>
    `;
    document.body.appendChild(card);
  });
  
  await expect(page.getByTestId('moment-card')).toBeVisible();
  await expect(page.getByTestId('mood-display')).toBeVisible();
});

test('profile page shows questionnaire when no profile exists', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/profile');
  
  await page.evaluate(() => {
    localStorage.removeItem('dogtracer_dog_profile');
  });
  await page.reload();
  
  await expect(page.getByTestId('profile-questionnaire')).toBeVisible();
  await expect(page.getByTestId('dog-name-input')).toBeVisible();
  await expect(page.getByTestId('dog-age-input')).toBeVisible();
  await expect(page.getByTestId('temperament-buttons')).toBeVisible();
  await expect(page.getByTestId('trigger-input')).toBeVisible();
  await expect(page.getByTestId('goal-input')).toBeVisible();
  await expect(page.getByTestId('profile-save-button')).toBeVisible();
});

test('profile page shows profile view after saving profile', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/profile');
  
  await page.evaluate(() => {
    localStorage.setItem('dogtracer_dog_profile', JSON.stringify({
      id: 'profile_test',
      name: 'Luna',
      age: '2 years',
      temperament: ['social', 'curious'],
      triggers: ['scooters'],
      goals: ['better recall'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
  });
  await page.reload();
  
  await expect(page.getByTestId('profile-view')).toBeVisible();
  await expect(page.getByTestId('profile-dog-name')).toContainText('Luna');
  await expect(page.getByTestId('profile-dog-age')).toContainText('2 years');
  await expect(page.getByTestId('profile-temperament')).toBeVisible();
  await expect(page.getByTestId('profile-triggers')).toBeVisible();
  await expect(page.getByTestId('profile-goals')).toBeVisible();
  await expect(page.getByTestId('edit-profile-button')).toBeVisible();
});

test('overview card displays activity stats when moments exist', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/timeline');
  
  await page.evaluate(() => {
    const now = new Date();
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    localStorage.setItem('dogtracer_moments', JSON.stringify([
      {
        id: 'moment-1',
        photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: thirtyMinsAgo.toISOString(),
        timestampLocal: thirtyMinsAgo.toLocaleString(),
        createdAt: thirtyMinsAgo.getTime(),
        gps: null,
        tags: ['walk'],
        notes: '',
        mood: 'calm',
        moodConfidence: 85,
        entityIds: [],
        sessionId: null
      },
      {
        id: 'moment-2',
        photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: now.toISOString(),
        timestampLocal: now.toLocaleString(),
        createdAt: now.getTime(),
        gps: null,
        tags: ['play'],
        notes: '',
        mood: 'playful',
        moodConfidence: 90,
        entityIds: [],
        sessionId: null
      }
    ]));
    localStorage.setItem('dogtracer_dog_profile', JSON.stringify({
      id: 'profile_test',
      name: 'Luna',
      age: '2 years',
      temperament: ['social', 'curious'],
      triggers: [],
      goals: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
  });
  
  await page.reload();
  
  await expect(page.getByTestId('overview-card')).toBeVisible();
  await expect(page.getByTestId('overview-title')).toContainText("Luna's Day at a Glance");
  await expect(page.getByTestId('total-moments')).toBeVisible();
  await expect(page.getByTestId('total-sessions')).toBeVisible();
  await expect(page.getByTestId('active-time')).toBeVisible();
  await expect(page.getByTestId('rest-time')).toBeVisible();
});

test('timeline highlights card displays session highlights', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/timeline');
  
  await page.evaluate(() => {
    const now = new Date();
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    localStorage.setItem('dogtracer_moments', JSON.stringify([
      {
        id: 'moment-highlight-1',
        photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: thirtyMinsAgo.toISOString(),
        timestampLocal: thirtyMinsAgo.toLocaleString(),
        createdAt: thirtyMinsAgo.getTime(),
        gps: { latitude: 37.7749, longitude: -122.4194, accuracy: 10, placeLabel: 'Golden Gate Park' },
        tags: ['walk', 'social'],
        notes: '',
        mood: 'calm',
        moodConfidence: 85,
        entityIds: [],
        sessionId: null
      },
      {
        id: 'moment-highlight-2',
        photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: now.toISOString(),
        timestampLocal: now.toLocaleString(),
        createdAt: now.getTime(),
        gps: { latitude: 37.7749, longitude: -122.4194, accuracy: 10, placeLabel: 'Golden Gate Park' },
        tags: ['walk'],
        notes: '',
        mood: 'playful',
        moodConfidence: 90,
        entityIds: [],
        sessionId: null
      }
    ]));
    localStorage.setItem('dogtracer_dog_profile', JSON.stringify({
      id: 'profile_test',
      name: 'Buddy',
      age: '3 years',
      temperament: ['social', 'curious', 'high-energy'],
      triggers: [],
      goals: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
  });
  
  await page.reload();
  
  await expect(page.getByTestId('timeline-highlights-card')).toBeVisible();
  await expect(page.getByTestId('timeline-highlights-title')).toContainText('Timeline Highlights');
  await expect(page.getByTestId('timeline-highlight').first()).toBeVisible();
  await expect(page.getByTestId('highlight-time-range').first()).toBeVisible();
  await expect(page.getByTestId('highlight-description').first()).toBeVisible();
});

test('social map card displays encountered entities with filter', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/timeline');
  
  await page.evaluate(() => {
    const now = new Date();
    
    localStorage.setItem('dogtracer_entities', JSON.stringify([
      {
        id: 'entity-dog-1',
        type: 'dog',
        name: 'Max',
        notes: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: {
          breed: 'Labrador',
          sex: 'male',
          size: 'large',
          relationship: 'friend',
          isPrimary: false
        }
      },
      {
        id: 'entity-human-1',
        type: 'human',
        name: 'Sarah',
        notes: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: {
          relationship: 'neighbor'
        }
      }
    ]));

    localStorage.setItem('dogtracer_moments', JSON.stringify([
      {
        id: 'moment-social-1',
        photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: now.toISOString(),
        timestampLocal: now.toLocaleString(),
        createdAt: now.getTime(),
        gps: null,
        tags: ['social'],
        notes: '',
        mood: 'playful',
        moodConfidence: 85,
        entityIds: ['entity-dog-1', 'entity-human-1'],
        sessionId: null
      }
    ]));
    
    localStorage.setItem('dogtracer_dog_profile', JSON.stringify({
      id: 'profile_test',
      name: 'Luna',
      age: '2 years',
      temperament: ['social', 'curious'],
      triggers: [],
      goals: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
  });
  
  await page.reload();
  
  await expect(page.getByTestId('social-map-card')).toBeVisible();
  await expect(page.getByTestId('social-map-title')).toContainText('Social Map');
  await expect(page.getByTestId('social-map-count')).toBeVisible();
  await expect(page.getByTestId('social-map-filter')).toBeVisible();
  await expect(page.getByTestId('filter-all')).toBeVisible();
  await expect(page.getByTestId('filter-dogs')).toBeVisible();
  await expect(page.getByTestId('filter-humans')).toBeVisible();
  await expect(page.getByTestId('social-map-entity-card')).toHaveCount(2);
  
  // Test filter
  await page.getByTestId('filter-dogs').click();
  await expect(page.getByTestId('social-map-entity-card')).toHaveCount(1);
  await expect(page.getByTestId('entity-name')).toContainText('Max');
  
  await page.getByTestId('filter-humans').click();
  await expect(page.getByTestId('social-map-entity-card')).toHaveCount(1);
  await expect(page.getByTestId('entity-name')).toContainText('Sarah');
});

test('social map entity card shows encounter details and opens moments modal', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/timeline');
  
  await page.evaluate(() => {
    const now = new Date();
    const earlier = new Date(now.getTime() - 60 * 60 * 1000);
    
    localStorage.setItem('dogtracer_entities', JSON.stringify([
      {
        id: 'entity-dog-test',
        type: 'dog',
        name: 'Buddy',
        notes: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: {
          breed: 'Golden Retriever',
          sex: 'male',
          size: 'large',
          relationship: 'friend',
          isPrimary: false
        }
      }
    ]));

    localStorage.setItem('dogtracer_moments', JSON.stringify([
      {
        id: 'moment-buddy-1',
        photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: earlier.toISOString(),
        timestampLocal: earlier.toLocaleString(),
        createdAt: earlier.getTime(),
        gps: null,
        tags: ['walk'],
        notes: '',
        mood: 'calm',
        moodConfidence: 80,
        entityIds: ['entity-dog-test'],
        sessionId: null
      },
      {
        id: 'moment-buddy-2',
        photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: now.toISOString(),
        timestampLocal: now.toLocaleString(),
        createdAt: now.getTime(),
        gps: null,
        tags: ['play'],
        notes: '',
        mood: 'playful',
        moodConfidence: 90,
        entityIds: ['entity-dog-test'],
        sessionId: null
      }
    ]));
    
    localStorage.setItem('dogtracer_dog_profile', JSON.stringify({
      id: 'profile_test',
      name: 'Luna',
      age: '2 years',
      temperament: ['social'],
      triggers: [],
      goals: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
  });
  
  await page.reload();
  
  await expect(page.getByTestId('social-map-card')).toBeVisible();
  const entityCard = page.getByTestId('social-map-entity-card').first();
  await expect(entityCard).toBeVisible();
  await expect(page.getByTestId('entity-name')).toContainText('Buddy');
  await expect(page.getByTestId('entity-encounter-count')).toContainText('2 moments');
  await expect(page.getByTestId('entity-outcome')).toContainText('friend');
  
  // Click to open moments modal
  await entityCard.click();
  await expect(page.getByTestId('entity-moments-modal')).toBeVisible();
  await expect(page.getByTestId('entity-moment-thumbnail')).toHaveCount(2);
  
  // Close modal
  await page.getByTestId('close-entity-moments').click();
  await expect(page.getByTestId('entity-moments-modal')).not.toBeVisible();
});
