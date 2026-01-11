'use client';

import { 
  labelDetectedEntities, 
  getDogLabelColor, 
  getHumanLabelColor,
  isPrimaryDogLabel, 
  type LabeledEntity 
} from '../lib/labeling';
import type { DetectedEntity } from '../lib/detection';

interface DetectionOverlayProps {
  entities: DetectedEntity[];
  showDogsOnly?: boolean;
  onEntityTap?: (entity: LabeledEntity) => void;
}

export default function DetectionOverlay({ entities, showDogsOnly = false, onEntityTap }: DetectionOverlayProps) {
  const labeledEntities = labelDetectedEntities(entities);
  const filteredEntities = showDogsOnly 
    ? labeledEntities.filter(e => e.type === 'dog')
    : labeledEntities;

  if (filteredEntities.length === 0) return null;

  const handleEntityClick = (entity: LabeledEntity, e: React.MouseEvent) => {
    if (onEntityTap) {
      e.stopPropagation();
      onEntityTap(entity);
    }
  };

  return (
    <div 
      className={`absolute inset-0 ${onEntityTap ? '' : 'pointer-events-none'}`} 
      data-testid="detection-overlay"
    >
      {filteredEntities.map((entity, index) => {
        const { boundingBox, displayLabel, label, type } = entity;
        const isClickable = !!onEntityTap;
        
        if (type === 'dog') {
          const isPrimary = isPrimaryDogLabel(label);
          const color = getDogLabelColor(label);
          
          return (
            <div
              key={`${type}-${index}`}
              data-testid={isPrimary ? 'primary-dog-indicator' : 'other-dog-indicator'}
              className={`absolute border-2 rounded ${isClickable ? 'cursor-pointer hover:border-4' : ''}`}
              style={{
                left: `${boundingBox.x * 100}%`,
                top: `${boundingBox.y * 100}%`,
                width: `${boundingBox.width * 100}%`,
                height: `${boundingBox.height * 100}%`,
                borderColor: color,
              }}
              onClick={(e) => handleEntityClick(entity, e)}
            >
              <div
                className={`absolute -top-6 left-0 px-1.5 py-0.5 text-xs font-medium text-white rounded whitespace-nowrap ${isClickable ? 'cursor-pointer' : ''}`}
                style={{ backgroundColor: color }}
              >
                {displayLabel}
                {isPrimary && ' ⭐'}
              </div>
            </div>
          );
        }
        
        if (type === 'human') {
          const color = getHumanLabelColor();
          
          return (
            <div
              key={`${type}-${index}`}
              data-testid="person-indicator"
              className={`absolute border-2 rounded ${isClickable ? 'cursor-pointer hover:border-4' : ''}`}
              style={{
                left: `${boundingBox.x * 100}%`,
                top: `${boundingBox.y * 100}%`,
                width: `${boundingBox.width * 100}%`,
                height: `${boundingBox.height * 100}%`,
                borderColor: color,
              }}
              onClick={(e) => handleEntityClick(entity, e)}
            >
              <div
                className={`absolute -top-6 left-0 px-1.5 py-0.5 text-xs font-medium text-white rounded whitespace-nowrap ${isClickable ? 'cursor-pointer' : ''}`}
                style={{ backgroundColor: color }}
              >
                {displayLabel} 👤
              </div>
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
}
