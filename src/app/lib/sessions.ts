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
