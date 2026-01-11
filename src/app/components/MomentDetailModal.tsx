'use client';

import { useState } from 'react';
import { type Moment, MOMENT_MOODS, type MomentMood, updateMoment } from '../lib/moments';
import { getDetectionResultByMomentId } from '../lib/detection';
import { type LabeledEntity } from '../lib/labeling';
import DetectionOverlay from './DetectionOverlay';
import EntityNamingModal from './EntityNamingModal';

interface MomentDetailModalProps {
  moment: Moment;
  onClose: () => void;
}

const MOOD_EMOJIS: Record<MomentMood, string> = {
  calm: '😌',
  excited: '🤩',
  alert: '👀',
  anxious: '😰',
  tired: '😴',
  playful: '🎾',
};

const TAG_EMOJIS: Record<string, string> = {
  walk: '🚶',
  play: '🎾',
  rest: '💤',
  training: '🎓',
  feeding: '🍖',
  vet: '🏥',
  bath: '🛁',
  social: '👋',
  stress: '😟',
};

export default function MomentDetailModal({ moment, onClose }: MomentDetailModalProps) {
  const [selectedEntity, setSelectedEntity] = useState<LabeledEntity | null>(null);
  const [currentMood, setCurrentMood] = useState<MomentMood | null>(moment.mood);
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

  const handleMoodOverride = (mood: MomentMood) => {
    setCurrentMood(mood);
    updateMoment(moment.id, { mood, moodConfidence: 100 });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative min-h-screen flex items-start justify-center p-4 pt-12">
          <div
            className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-lg w-full overflow-hidden"
            data-testid="moment-detail-modal"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
              data-testid="moment-detail-close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative">
              <img
                src={moment.photoDataUrl}
                alt={`Moment at ${moment.timestampLocal}`}
                className="w-full"
              />
              {entities.length > 0 && (
                <DetectionOverlay entities={entities} onEntityTap={handleEntityTap} />
              )}
            </div>

            <div className="p-4 space-y-4">
              <div>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatTime(moment.timestamp)}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(moment.timestamp)}
                </p>
              </div>

              {moment.gps?.placeLabel && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{moment.gps.placeLabel}</span>
                </div>
              )}

              {moment.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {moment.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-sm bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-100 rounded-full"
                      >
                        {TAG_EMOJIS[tag] || ''} {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {moment.notes && (
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Notes</p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{moment.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Mood {currentMood && <span className="text-amber-600">(tap to override)</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {MOMENT_MOODS.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => handleMoodOverride(mood)}
                      className={`px-2 py-1 text-sm rounded-full border transition-colors ${
                        currentMood === mood
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                      }`}
                      data-testid={`mood-button-${mood}`}
                    >
                      {MOOD_EMOJIS[mood]} {mood}
                    </button>
                  ))}
                </div>
              </div>

              {entities.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Detected entities
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {entities.filter((e) => e.type === 'dog').length > 0 && (
                      <span>🐕 {entities.filter((e) => e.type === 'dog').length} dog(s)</span>
                    )}
                    {entities.filter((e) => e.type === 'dog').length > 0 &&
                      entities.filter((e) => e.type === 'human').length > 0 &&
                      ' • '}
                    {entities.filter((e) => e.type === 'human').length > 0 && (
                      <span>👤 {entities.filter((e) => e.type === 'human').length} person(s)</span>
                    )}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Tap on entities in the photo to name them
                  </p>
                </div>
              )}
            </div>
          </div>
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
