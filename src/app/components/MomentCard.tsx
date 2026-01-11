'use client';

import { type Moment } from '../lib/moments';
import { getDetectionResultByMomentId } from '../lib/detection';
import DetectionOverlay from './DetectionOverlay';

interface MomentCardProps {
  moment: Moment;
  onClick?: () => void;
}

export default function MomentCard({ moment, onClick }: MomentCardProps) {
  const detectionResult = getDetectionResultByMomentId(moment.id);
  const entities = detectionResult?.entities ?? [];
  const dogEntities = entities.filter(e => e.type === 'dog');

  return (
    <div
      className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden cursor-pointer"
      onClick={onClick}
      data-testid="moment-card"
    >
      <div className="relative">
        <img
          src={moment.photoDataUrl}
          alt={`Moment at ${moment.timestampLocal}`}
          className="w-full aspect-square object-cover"
        />
        {dogEntities.length > 0 && (
          <DetectionOverlay entities={dogEntities} showDogsOnly />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {new Date(moment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        {moment.gps?.placeLabel && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {moment.gps.placeLabel}
          </p>
        )}
        {moment.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {moment.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-100 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {dogEntities.length > 0 && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            🐕 {dogEntities.length} dog{dogEntities.length > 1 ? 's' : ''} detected
          </p>
        )}
      </div>
    </div>
  );
}
