import { type MomentMood, updateMoment } from './moments';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type DetectedEntityType = 'dog' | 'human';

export interface DetectedEntity {
  type: DetectedEntityType;
  boundingBox: BoundingBox;
  confidence: number;
  label: string;
}

export interface MoodInference {
  mood: MomentMood;
  confidence: number;
}

export interface DetectionResult {
  id: string;
  momentId: string;
  entities: DetectedEntity[];
  moodInference?: MoodInference;
  processedAt: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  retryCount: number;
}

export interface DetectionQueueItem {
  momentId: string;
  photoDataUrl: string;
  addedAt: number;
  retryCount: number;
  lastAttemptAt?: number;
}

const DETECTION_RESULTS_KEY = 'dogtracer_detection_results';
const DETECTION_QUEUE_KEY = 'dogtracer_detection_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export function generateDetectionId(): string {
  return `detection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getDetectionResults(): DetectionResult[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DETECTION_RESULTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveDetectionResult(result: DetectionResult): void {
  const results = getDetectionResults();
  const existingIndex = results.findIndex((r) => r.momentId === result.momentId);
  if (existingIndex >= 0) {
    results[existingIndex] = result;
  } else {
    results.push(result);
  }
  localStorage.setItem(DETECTION_RESULTS_KEY, JSON.stringify(results));
}

export function getDetectionResultByMomentId(momentId: string): DetectionResult | undefined {
  return getDetectionResults().find((r) => r.momentId === momentId);
}

export function getDetectionQueue(): DetectionQueueItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DETECTION_QUEUE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveDetectionQueue(queue: DetectionQueueItem[]): void {
  localStorage.setItem(DETECTION_QUEUE_KEY, JSON.stringify(queue));
}

export function addToDetectionQueue(momentId: string, photoDataUrl: string): void {
  const queue = getDetectionQueue();
  if (!queue.find((item) => item.momentId === momentId)) {
    queue.push({
      momentId,
      photoDataUrl,
      addedAt: Date.now(),
      retryCount: 0,
    });
    saveDetectionQueue(queue);
  }
}

export function removeFromDetectionQueue(momentId: string): void {
  const queue = getDetectionQueue().filter((item) => item.momentId !== momentId);
  saveDetectionQueue(queue);
}

export function updateQueueItemRetry(momentId: string): boolean {
  const queue = getDetectionQueue();
  const item = queue.find((i) => i.momentId === momentId);
  if (!item) return false;
  
  item.retryCount += 1;
  item.lastAttemptAt = Date.now();
  
  if (item.retryCount > MAX_RETRIES) {
    removeFromDetectionQueue(momentId);
    return false;
  }
  
  saveDetectionQueue(queue);
  return true;
}

export interface DetectionApiResponse {
  success: boolean;
  entities?: DetectedEntity[];
  moodInference?: MoodInference;
  error?: string;
}

export async function callDetectionApi(photoDataUrl: string): Promise<DetectionApiResponse> {
  try {
    const response = await fetch('/api/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoDataUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `API error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    return { success: true, entities: data.entities, moodInference: data.moodInference };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function processDetection(momentId: string, photoDataUrl: string): Promise<DetectionResult> {
  const existingResult = getDetectionResultByMomentId(momentId);
  const result: DetectionResult = existingResult || {
    id: generateDetectionId(),
    momentId,
    entities: [],
    processedAt: 0,
    status: 'pending',
    retryCount: 0,
  };

  result.status = 'processing';
  saveDetectionResult(result);

  const response = await callDetectionApi(photoDataUrl);

  if (response.success && response.entities) {
    result.entities = response.entities;
    result.moodInference = response.moodInference;
    result.status = 'completed';
    result.processedAt = Date.now();
    removeFromDetectionQueue(momentId);
    
    if (response.moodInference) {
      updateMoment(momentId, {
        mood: response.moodInference.mood,
        moodConfidence: response.moodInference.confidence,
      });
    }
  } else {
    result.error = response.error;
    result.retryCount += 1;
    
    if (result.retryCount >= MAX_RETRIES) {
      result.status = 'failed';
      removeFromDetectionQueue(momentId);
    } else {
      result.status = 'pending';
      addToDetectionQueue(momentId, photoDataUrl);
    }
  }

  saveDetectionResult(result);
  return result;
}

export async function processDetectionQueue(): Promise<void> {
  const queue = getDetectionQueue();
  const now = Date.now();

  for (const item of queue) {
    if (item.lastAttemptAt && now - item.lastAttemptAt < RETRY_DELAY_MS) {
      continue;
    }

    await processDetection(item.momentId, item.photoDataUrl);
  }
}

export function getPendingDetectionCount(): number {
  return getDetectionQueue().length;
}
