import { NextRequest, NextResponse } from 'next/server';
import type { DetectedEntity, BoundingBox, MoodInference } from '@/app/lib/detection';
import type { MomentMood } from '@/app/lib/moments';

const MOODS: MomentMood[] = ['calm', 'excited', 'alert', 'anxious', 'tired', 'playful'];

function generateMockMoodInference(): MoodInference {
  const mood = MOODS[Math.floor(Math.random() * MOODS.length)];
  const confidence = Math.floor(50 + Math.random() * 50);
  return { mood, confidence };
}

function generateMockBoundingBox(): BoundingBox {
  const x = Math.random() * 0.5;
  const y = Math.random() * 0.3;
  const width = 0.2 + Math.random() * 0.3;
  const height = 0.3 + Math.random() * 0.4;
  return { x, y, width, height };
}

function generateMockDetections(): DetectedEntity[] {
  const entities: DetectedEntity[] = [];
  
  const numDogs = Math.floor(Math.random() * 3);
  for (let i = 0; i < numDogs; i++) {
    entities.push({
      type: 'dog',
      boundingBox: generateMockBoundingBox(),
      confidence: 70 + Math.random() * 30,
      label: i === 0 ? '[PRIMARY_DOG]' : `[OTHER_DOG_${i}]`,
    });
  }

  const numHumans = Math.floor(Math.random() * 3);
  for (let i = 0; i < numHumans; i++) {
    entities.push({
      type: 'human',
      boundingBox: generateMockBoundingBox(),
      confidence: 70 + Math.random() * 30,
      label: `[PERSON_${i + 1}]`,
    });
  }

  return entities;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.photoDataUrl || typeof body.photoDataUrl !== 'string') {
      return NextResponse.json(
        { error: 'photoDataUrl is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.photoDataUrl.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image data URL format' },
        { status: 400 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

    if (Math.random() < 0.05) {
      return NextResponse.json(
        { error: 'Temporary server error, please retry' },
        { status: 503 }
      );
    }

    const entities = generateMockDetections();
    const moodInference = generateMockMoodInference();

    return NextResponse.json({
      success: true,
      entities,
      moodInference,
      processedAt: Date.now(),
    });
  } catch (error) {
    console.error('Detection API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
