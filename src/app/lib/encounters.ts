import { getEntities, type Entity } from './entities';
import { getMoments, type Moment } from './moments';

export interface EntityEncounterStats {
  entity: Entity;
  encounterCount: number;
  lastSeenDate: Date;
  momentIds: string[];
}

export function getEntityEncounterStats(): EntityEncounterStats[] {
  const entities = getEntities();
  const moments = getMoments();

  const statsMap = new Map<string, EntityEncounterStats>();

  // Initialize stats for all named entities
  for (const entity of entities) {
    if (entity.name) {
      statsMap.set(entity.id, {
        entity,
        encounterCount: 0,
        lastSeenDate: new Date(entity.createdAt),
        momentIds: [],
      });
    }
  }

  // Count encounters from moments
  for (const moment of moments) {
    for (const entityId of moment.entityIds) {
      const stats = statsMap.get(entityId);
      if (stats) {
        stats.encounterCount++;
        stats.momentIds.push(moment.id);
        const momentDate = new Date(moment.timestamp);
        if (momentDate > stats.lastSeenDate) {
          stats.lastSeenDate = momentDate;
        }
      }
    }
  }

  // Sort by last seen date descending
  return Array.from(statsMap.values())
    .filter((s) => s.entity.name)
    .sort((a, b) => b.lastSeenDate.getTime() - a.lastSeenDate.getTime());
}

export function getMomentsForEntity(entityId: string): Moment[] {
  const moments = getMoments();
  return moments
    .filter((m) => m.entityIds.includes(entityId))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function formatLastSeen(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateDay.getTime() === today.getTime()) {
    return 'Today';
  } else if (dateDay.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    const days = Math.floor((today.getTime() - dateDay.getTime()) / (24 * 60 * 60 * 1000));
    if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  }
}
