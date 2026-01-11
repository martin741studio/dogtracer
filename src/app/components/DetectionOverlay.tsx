'use client';

import { labelDetectedEntities, getDogLabelColor, isPrimaryDogLabel, type LabeledEntity } from '../lib/labeling';
import type { DetectedEntity } from '../lib/detection';

interface DetectionOverlayProps {
  entities: DetectedEntity[];
  showDogsOnly?: boolean;
}

export default function DetectionOverlay({ entities, showDogsOnly = false }: DetectionOverlayProps) {
  const labeledEntities = labelDetectedEntities(entities);
  const filteredEntities = showDogsOnly 
    ? labeledEntities.filter(e => e.type === 'dog')
    : labeledEntities;

  if (filteredEntities.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" data-testid="detection-overlay">
      {filteredEntities.map((entity, index) => {
        if (entity.type !== 'dog') return null;
        
        const { boundingBox, displayLabel, label } = entity;
        const isPrimary = isPrimaryDogLabel(label);
        const color = getDogLabelColor(label);
        
        return (
          <div
            key={`${entity.type}-${index}`}
            data-testid={isPrimary ? 'primary-dog-indicator' : 'other-dog-indicator'}
            className="absolute border-2 rounded"
            style={{
              left: `${boundingBox.x * 100}%`,
              top: `${boundingBox.y * 100}%`,
              width: `${boundingBox.width * 100}%`,
              height: `${boundingBox.height * 100}%`,
              borderColor: color,
            }}
          >
            <div
              className="absolute -top-6 left-0 px-1.5 py-0.5 text-xs font-medium text-white rounded whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {displayLabel}
              {isPrimary && ' ⭐'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
