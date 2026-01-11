'use client';

import { useState } from 'react';
import { type Moment } from '../lib/moments';
import { getDetectionResultByMomentId } from '../lib/detection';
import { type LabeledEntity } from '../lib/labeling';
import { getMoodDisplay } from '../lib/mood';
import DetectionOverlay from './DetectionOverlay';
import EntityNamingModal from './EntityNamingModal';

interface MomentCardProps {
  moment: Moment;
  onClick?: () => void;
}

export default function MomentCard({ moment, onClick }: MomentCardProps) {
  const [selectedEntity, setSelectedEntity] = useState<LabeledEntity | null>(null);
  const [, forceUpdate] = useState({});
  
  const detectionResult = getDetectionResultByMomentId(moment.id);
  const entities = detectionResult?.entities ?? [];

  const handleEntityTap = (entity: LabeledEntity) => {
    setSelectedEntity(entity);
  };

  const handleModalClose = () => {
    setSelectedEntity(null);
  };

  const handleEntitySave = () => {
    setSelectedEntity(null);
    forceUpdate({});
  };

  return (
    <>
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
          {entities.length > 0 && (
            <DetectionOverlay 
              entities={entities} 
              onEntityTap={handleEntityTap}
            />
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
          {moment.mood && (
            <div className="mt-2" data-testid="mood-display">
              {(() => {
                const display = getMoodDisplay(moment.mood);
                return (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${display.color}`}>
                    <span>{display.emoji}</span>
                    <span>{display.label}</span>
                    {moment.moodConfidence && (
                      <span className="opacity-70">({moment.moodConfidence}%)</span>
                    )}
                  </span>
                );
              })()}
            </div>
          )}
          {entities.length > 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {entities.filter(e => e.type === 'dog').length > 0 && (
                <span>🐕 {entities.filter(e => e.type === 'dog').length} dog{entities.filter(e => e.type === 'dog').length > 1 ? 's' : ''}</span>
              )}
              {entities.filter(e => e.type === 'dog').length > 0 && entities.filter(e => e.type === 'human').length > 0 && ' • '}
              {entities.filter(e => e.type === 'human').length > 0 && (
                <span>👤 {entities.filter(e => e.type === 'human').length} {entities.filter(e => e.type === 'human').length > 1 ? 'people' : 'person'}</span>
              )}
            </p>
          )}
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Tap on detected entities to name them
          </p>
        </div>
      </div>

      {selectedEntity && (
        <EntityNamingModal
          entity={selectedEntity}
          onClose={handleModalClose}
          onSave={handleEntitySave}
        />
      )}
    </>
  );
}
