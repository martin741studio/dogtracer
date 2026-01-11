export type EntityType = 'dog' | 'human';

export type DogRelationship = 'friend' | 'neutral' | 'conflict' | 'unknown';

export type HumanRelationship = 'owner' | 'friend' | 'stranger' | 'neighbor' | 'vet' | 'trainer';

export type DogSize = 'small' | 'medium' | 'large' | 'unknown';

export type DogSex = 'male' | 'female' | 'unknown';

export interface DogMetadata {
  breed: string | null;
  sex: DogSex;
  size: DogSize;
  relationship: DogRelationship;
  isPrimary: boolean;
}

export interface HumanMetadata {
  relationship: HumanRelationship;
}

export interface BaseEntity {
  id: string;
  type: EntityType;
  name: string | null;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface DogEntity extends BaseEntity {
  type: 'dog';
  metadata: DogMetadata;
}

export interface HumanEntity extends BaseEntity {
  type: 'human';
  metadata: HumanMetadata;
}

export type Entity = DogEntity | HumanEntity;

const ENTITIES_KEY = 'dogtracer_entities';

export function generateEntityId(): string {
  return `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getEntities(): Entity[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(ENTITIES_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveEntity(entity: Entity): void {
  const entities = getEntities();
  const existingIndex = entities.findIndex((e) => e.id === entity.id);
  if (existingIndex >= 0) {
    entities[existingIndex] = { ...entity, updatedAt: Date.now() };
  } else {
    entities.push(entity);
  }
  localStorage.setItem(ENTITIES_KEY, JSON.stringify(entities));
}

export function getEntityById(id: string): Entity | undefined {
  return getEntities().find((e) => e.id === id);
}

export function getEntitiesByType(type: EntityType): Entity[] {
  return getEntities().filter((e) => e.type === type);
}

export function getDogs(): DogEntity[] {
  return getEntities().filter((e): e is DogEntity => e.type === 'dog');
}

export function getHumans(): HumanEntity[] {
  return getEntities().filter((e): e is HumanEntity => e.type === 'human');
}

export function getPrimaryDog(): DogEntity | undefined {
  return getDogs().find((d) => d.metadata.isPrimary);
}

export function deleteEntity(id: string): void {
  const entities = getEntities().filter((e) => e.id !== id);
  localStorage.setItem(ENTITIES_KEY, JSON.stringify(entities));
}

export function createDogEntity(
  name: string | null = null,
  metadata: Partial<DogMetadata> = {}
): DogEntity {
  const now = Date.now();
  return {
    id: generateEntityId(),
    type: 'dog',
    name,
    notes: '',
    createdAt: now,
    updatedAt: now,
    metadata: {
      breed: metadata.breed ?? null,
      sex: metadata.sex ?? 'unknown',
      size: metadata.size ?? 'unknown',
      relationship: metadata.relationship ?? 'unknown',
      isPrimary: metadata.isPrimary ?? false,
    },
  };
}

export function createHumanEntity(
  name: string | null = null,
  relationship: HumanRelationship = 'stranger'
): HumanEntity {
  const now = Date.now();
  return {
    id: generateEntityId(),
    type: 'human',
    name,
    notes: '',
    createdAt: now,
    updatedAt: now,
    metadata: {
      relationship,
    },
  };
}
