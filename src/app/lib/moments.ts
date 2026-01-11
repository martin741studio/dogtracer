export interface GpsLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  placeLabel: string | null;
}

export type MomentTag = 'walk' | 'play' | 'rest' | 'training' | 'feeding' | 'vet' | 'bath' | 'social' | 'stress';

export const MOMENT_TAGS: MomentTag[] = ['walk', 'play', 'rest', 'training', 'feeding', 'vet', 'bath', 'social', 'stress'];

export interface Moment {
  id: string;
  photoDataUrl: string;
  timestamp: string;
  timestampLocal: string;
  createdAt: number;
  gps: GpsLocation | null;
  tags: MomentTag[];
  notes: string;
}

const MOMENTS_KEY = 'dogtracer_moments';

export function generateId(): string {
  return `moment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function saveMoment(moment: Moment): void {
  const moments = getMoments();
  moments.unshift(moment);
  localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments));
}

export function getMoments(): Moment[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(MOMENTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getMomentById(id: string): Moment | undefined {
  return getMoments().find((m) => m.id === id);
}

export function createMoment(
  photoDataUrl: string, 
  gps: GpsLocation | null = null,
  tags: MomentTag[] = [],
  notes: string = ''
): Moment {
  const now = new Date();
  return {
    id: generateId(),
    photoDataUrl,
    timestamp: now.toISOString(),
    timestampLocal: now.toLocaleString(),
    createdAt: now.getTime(),
    gps,
    tags,
    notes,
  };
}
