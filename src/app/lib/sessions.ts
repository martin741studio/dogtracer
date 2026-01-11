export type SessionType = 'walk' | 'play' | 'training' | 'rest' | 'social';

export const SESSION_TYPES: SessionType[] = ['walk', 'play', 'training', 'rest', 'social'];

export type BehaviorFlag = 'win' | 'trigger' | 'social' | 'training' | 'food' | 'rest';

export const BEHAVIOR_FLAGS: BehaviorFlag[] = ['win', 'trigger', 'social', 'training', 'food', 'rest'];

export interface Session {
  id: string;
  type: SessionType;
  startTime: string;
  endTime: string;
  momentIds: string[];
  keyPhotoIds: string[];
  behaviorFlags: BehaviorFlag[];
  placeLabel: string | null;
  createdAt: number;
  updatedAt: number;
}

const SESSIONS_KEY = 'dogtracer_sessions';

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getSessions(): Session[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SESSIONS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveSession(session: Session): void {
  const sessions = getSessions();
  const existingIndex = sessions.findIndex((s) => s.id === session.id);
  if (existingIndex >= 0) {
    sessions[existingIndex] = { ...session, updatedAt: Date.now() };
  } else {
    sessions.push(session);
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getSessionById(id: string): Session | undefined {
  return getSessions().find((s) => s.id === id);
}

export function getSessionsByDate(date: Date): Session[] {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return getSessions().filter((s) => {
    const sessionStart = new Date(s.startTime);
    return sessionStart >= startOfDay && sessionStart <= endOfDay;
  });
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function createSession(
  type: SessionType,
  momentIds: string[] = [],
  startTime?: string,
  endTime?: string
): Session {
  const now = Date.now();
  const nowISO = new Date().toISOString();
  return {
    id: generateSessionId(),
    type,
    startTime: startTime ?? nowISO,
    endTime: endTime ?? nowISO,
    momentIds,
    keyPhotoIds: [],
    behaviorFlags: [],
    placeLabel: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function addMomentToSession(sessionId: string, momentId: string): void {
  const session = getSessionById(sessionId);
  if (session && !session.momentIds.includes(momentId)) {
    session.momentIds.push(momentId);
    saveSession(session);
  }
}

import { getMoments, updateMoment, type Moment, type MomentTag } from './moments';

const TIME_THRESHOLD_MS = 30 * 60 * 1000;
const DISTANCE_THRESHOLD_M = 100;

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function shouldClusterMoments(a: Moment, b: Moment): boolean {
  const timeDiff = Math.abs(
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  if (timeDiff > TIME_THRESHOLD_MS) return false;

  if (a.gps && b.gps) {
    const dist = haversineDistance(
      a.gps.latitude,
      a.gps.longitude,
      b.gps.latitude,
      b.gps.longitude
    );
    if (dist > DISTANCE_THRESHOLD_M) return false;
  }

  return true;
}

function inferSessionType(moments: Moment[]): SessionType {
  const tagCounts: Record<string, number> = {};
  for (const m of moments) {
    for (const tag of m.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  if (tagCounts['walk'] && tagCounts['walk'] > 0) return 'walk';
  if (tagCounts['play'] && tagCounts['play'] > 0) return 'play';
  if (tagCounts['training'] && tagCounts['training'] > 0) return 'training';
  if (tagCounts['social'] && tagCounts['social'] > 0) return 'social';
  if (tagCounts['rest'] && tagCounts['rest'] > 0) return 'rest';

  return 'rest';
}

function selectKeyPhotos(moments: Moment[]): string[] {
  const sorted = [...moments].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const keyPhotos: string[] = [];

  if (sorted.length >= 1) keyPhotos.push(sorted[0].id);
  if (sorted.length >= 3) keyPhotos.push(sorted[Math.floor(sorted.length / 2)].id);
  if (sorted.length >= 2) keyPhotos.push(sorted[sorted.length - 1].id);

  return [...new Set(keyPhotos)].slice(0, 3);
}

function deriveBehaviorFlags(moments: Moment[]): BehaviorFlag[] {
  const flags = new Set<BehaviorFlag>();
  const tagToBehavior: Record<MomentTag, BehaviorFlag | null> = {
    walk: null,
    play: 'social',
    rest: 'rest',
    training: 'training',
    feeding: 'food',
    vet: null,
    bath: null,
    social: 'social',
    stress: 'trigger',
  };

  for (const m of moments) {
    for (const tag of m.tags) {
      const flag = tagToBehavior[tag];
      if (flag) flags.add(flag);
    }
  }

  return Array.from(flags);
}

export function clusterMomentsIntoSessions(date: Date): Session[] {
  const moments = getMoments().filter((m) => {
    const mDate = m.timestamp.split('T')[0];
    const targetDate = date.toISOString().split('T')[0];
    return mDate === targetDate;
  });

  if (moments.length === 0) return [];

  const sorted = [...moments].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const clusters: Moment[][] = [];
  let currentCluster: Moment[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    if (shouldClusterMoments(prev, curr)) {
      currentCluster.push(curr);
    } else {
      clusters.push(currentCluster);
      currentCluster = [curr];
    }
  }
  clusters.push(currentCluster);

  const sessions: Session[] = [];

  for (const cluster of clusters) {
    const clusterSorted = [...cluster].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const type = inferSessionType(cluster);
    const keyPhotoIds = selectKeyPhotos(cluster);
    const behaviorFlags = deriveBehaviorFlags(cluster);
    const placeLabel = cluster.find((m) => m.gps?.placeLabel)?.gps?.placeLabel ?? null;

    const session = createSession(
      type,
      cluster.map((m) => m.id),
      clusterSorted[0].timestamp,
      clusterSorted[clusterSorted.length - 1].timestamp
    );
    session.keyPhotoIds = keyPhotoIds;
    session.behaviorFlags = behaviorFlags;
    session.placeLabel = placeLabel;

    sessions.push(session);
  }

  return sessions;
}

export function rebuildSessionsForDate(date: Date): Session[] {
  const existingSessions = getSessionsByDate(date);
  for (const s of existingSessions) {
    deleteSession(s.id);
  }

  const newSessions = clusterMomentsIntoSessions(date);
  for (const session of newSessions) {
    saveSession(session);

    for (const momentId of session.momentIds) {
      updateMoment(momentId, { sessionId: session.id });
    }
  }

  return newSessions;
}
