import { getProfile } from './profile';
import { getPrimaryDog, getDogs, getHumans, type DogEntity, type HumanEntity } from './entities';
import type { DetectedEntity } from './detection';

export interface LabeledEntity extends DetectedEntity {
  displayLabel: string;
  entityId?: string;
}

export function getHumanDisplayLabel(detectedLabel: string): { displayLabel: string; entityId?: string } {
  const humans = getHumans();

  const match = detectedLabel.match(/^\[PERSON_(\d+)\]$/);
  if (match) {
    const index = parseInt(match[1], 10);
    const human = humans[index - 1];
    if (human?.name) {
      return { displayLabel: human.name, entityId: human.id };
    }
    return { displayLabel: detectedLabel };
  }

  return { displayLabel: detectedLabel };
}

export function getDogDisplayLabel(detectedLabel: string): { displayLabel: string; entityId?: string } {
  const profile = getProfile();
  const primaryDog = getPrimaryDog();
  const dogs = getDogs();

  if (detectedLabel === '[PRIMARY_DOG]') {
    if (profile?.name) {
      return { displayLabel: profile.name, entityId: primaryDog?.id };
    }
    if (primaryDog?.name) {
      return { displayLabel: primaryDog.name, entityId: primaryDog.id };
    }
    return { displayLabel: '[PRIMARY_DOG]' };
  }

  const match = detectedLabel.match(/^\[OTHER_DOG_(\d+)\]$/);
  if (match) {
    const index = parseInt(match[1], 10);
    const otherDogs = dogs.filter(d => !d.metadata.isPrimary);
    const dog = otherDogs[index - 1];
    if (dog?.name) {
      return { displayLabel: dog.name, entityId: dog.id };
    }
    return { displayLabel: detectedLabel };
  }

  return { displayLabel: detectedLabel };
}

export function labelDetectedEntities(entities: DetectedEntity[]): LabeledEntity[] {
  return entities.map((entity) => {
    if (entity.type === 'dog') {
      const { displayLabel, entityId } = getDogDisplayLabel(entity.label);
      return { ...entity, displayLabel, entityId };
    }
    if (entity.type === 'human') {
      const { displayLabel, entityId } = getHumanDisplayLabel(entity.label);
      return { ...entity, displayLabel, entityId };
    }
    return { ...entity, displayLabel: entity.label };
  });
}

export function getDogLabelColor(label: string): string {
  if (label === '[PRIMARY_DOG]') {
    return '#f59e0b';
  }
  return '#3b82f6';
}

export function getHumanLabelColor(): string {
  return '#10b981';
}

export function isPrimaryDogLabel(label: string): boolean {
  return label === '[PRIMARY_DOG]';
}

export function isHumanLabel(label: string): boolean {
  return /^\[PERSON_\d+\]$/.test(label);
}
