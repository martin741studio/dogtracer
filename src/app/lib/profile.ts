export type Temperament =
  | 'confident'
  | 'shy'
  | 'curious'
  | 'protective'
  | 'social'
  | 'independent'
  | 'high-energy'
  | 'calm'
  | 'anxious'
  | 'reactive';

export const TEMPERAMENTS: Temperament[] = [
  'confident',
  'shy',
  'curious',
  'protective',
  'social',
  'independent',
  'high-energy',
  'calm',
  'anxious',
  'reactive',
];

export interface DogProfile {
  id: string;
  name: string;
  age: string | null;
  temperament: Temperament[];
  triggers: string[];
  goals: string[];
  createdAt: number;
  updatedAt: number;
}

const PROFILE_KEY = 'dogtracer_dog_profile';

export function getProfile(): DogProfile | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(PROFILE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveProfile(profile: DogProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({
    ...profile,
    updatedAt: Date.now(),
  }));
}

export function deleteProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}

export function generateProfileId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createProfile(name: string): DogProfile {
  const now = Date.now();
  return {
    id: generateProfileId(),
    name,
    age: null,
    temperament: [],
    triggers: [],
    goals: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function hasProfile(): boolean {
  return getProfile() !== null;
}

export function updateProfileField<K extends keyof DogProfile>(
  field: K,
  value: DogProfile[K]
): void {
  const profile = getProfile();
  if (profile) {
    profile[field] = value;
    saveProfile(profile);
  }
}
