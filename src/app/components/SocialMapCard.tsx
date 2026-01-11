'use client';

import { useState } from 'react';
import type { SocialMapEntry, SummaryTone } from '../lib/summary';
import { getMomentById, type Moment } from '../lib/moments';

interface SocialMapCardProps {
  socialMap: SocialMapEntry[];
  tone: SummaryTone;
  onMomentClick?: (moment: Moment) => void;
}

function getToneHeaderColor(tone: SummaryTone): string {
  switch (tone) {
    case 'upbeat':
      return 'bg-amber-50 border-amber-200';
    case 'calm':
      return 'bg-blue-50 border-blue-200';
    case 'protective':
      return 'bg-purple-50 border-purple-200';
  }
}

function getEntityTypeIcon(type: 'dog' | 'human'): string {
  return type === 'dog' ? '🐕' : '👤';
}

function getOutcomeColor(outcome: string): string {
  switch (outcome) {
    case 'friend':
    case 'owner':
      return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    case 'conflict':
      return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
    case 'stranger':
      return 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400';
    case 'neutral':
    case 'neighbor':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    case 'vet':
    case 'trainer':
      return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
    default:
      return 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400';
  }
}

function getOutcomeLabel(outcome: string): string {
  switch (outcome) {
    case 'friend':
      return '🤝 friend';
    case 'owner':
      return '💛 owner';
    case 'conflict':
      return '⚠️ conflict';
    case 'neutral':
      return 'neutral';
    case 'stranger':
      return 'stranger';
    case 'neighbor':
      return '🏠 neighbor';
    case 'vet':
      return '🏥 vet';
    case 'trainer':
      return '🎓 trainer';
    case 'unknown':
    default:
      return 'unknown';
  }
}

interface EntityCardProps {
  entry: SocialMapEntry;
  onTap: () => void;
}

function EntityCard({ entry, onTap }: EntityCardProps) {
  return (
    <button
      onClick={onTap}
      className="w-full text-left bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-amber-300 dark:hover:border-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
      data-testid="social-map-entity-card"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl">
          {getEntityTypeIcon(entry.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className="font-medium text-zinc-900 dark:text-zinc-100 truncate"
              data-testid="entity-name"
            >
              {entry.name}
            </h4>
            <span
              className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${getOutcomeColor(entry.outcome)}`}
              data-testid="entity-outcome"
            >
              {getOutcomeLabel(entry.outcome)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-zinc-500 dark:text-zinc-400" data-testid="entity-encounter-count">
              {entry.encounterCount} moment{entry.encounterCount !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {entry.type === 'dog' ? 'Dog' : 'Person'}
            </span>
          </div>
        </div>
        <svg
          className="w-5 h-5 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

interface EntityMomentsModalProps {
  entry: SocialMapEntry;
  onClose: () => void;
  onMomentClick: (moment: Moment) => void;
}

function EntityMomentsModal({ entry, onClose, onMomentClick }: EntityMomentsModalProps) {
  const moments = entry.momentIds
    .map((id) => getMomentById(id))
    .filter((m): m is Moment => m !== undefined);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      data-testid="entity-moments-modal"
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getEntityTypeIcon(entry.type)}</span>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {entry.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            data-testid="close-entity-moments"
          >
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {moments.length === 0 ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
              No moments found
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {moments.map((moment) => (
                <button
                  key={moment.id}
                  onClick={() => {
                    onMomentClick(moment);
                    onClose();
                  }}
                  className="aspect-square rounded-lg overflow-hidden focus:ring-2 focus:ring-amber-500"
                  data-testid="entity-moment-thumbnail"
                >
                  <img
                    src={moment.photoDataUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            {moments.length} moment{moments.length !== 1 ? 's' : ''} with {entry.name}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SocialMapCard({
  socialMap,
  tone,
  onMomentClick,
}: SocialMapCardProps) {
  const [selectedEntity, setSelectedEntity] = useState<SocialMapEntry | null>(null);
  const [filter, setFilter] = useState<'all' | 'dogs' | 'humans'>('all');

  if (socialMap.length === 0) {
    return null;
  }

  const dogs = socialMap.filter((e) => e.type === 'dog');
  const humans = socialMap.filter((e) => e.type === 'human');

  const filteredEntries =
    filter === 'dogs' ? dogs : filter === 'humans' ? humans : socialMap;

  return (
    <div
      className={`rounded-xl border p-4 ${getToneHeaderColor(tone)}`}
      data-testid="social-map-card"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-zinc-900" data-testid="social-map-title">
          Social Map
        </h3>
        <div className="text-sm text-zinc-500 dark:text-zinc-400" data-testid="social-map-count">
          {dogs.length} dog{dogs.length !== 1 ? 's' : ''}, {humans.length} person{humans.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="flex gap-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg p-0.5 mb-3" data-testid="social-map-filter">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-2 py-1 text-xs rounded-md ${
            filter === 'all'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
          data-testid="filter-all"
        >
          All ({socialMap.length})
        </button>
        <button
          onClick={() => setFilter('dogs')}
          className={`flex-1 px-2 py-1 text-xs rounded-md ${
            filter === 'dogs'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
          data-testid="filter-dogs"
        >
          🐕 Dogs ({dogs.length})
        </button>
        <button
          onClick={() => setFilter('humans')}
          className={`flex-1 px-2 py-1 text-xs rounded-md ${
            filter === 'humans'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
          data-testid="filter-humans"
        >
          👤 People ({humans.length})
        </button>
      </div>

      <div className="space-y-2">
        {filteredEntries.map((entry) => (
          <EntityCard
            key={entry.entityId}
            entry={entry}
            onTap={() => setSelectedEntity(entry)}
          />
        ))}
      </div>

      {selectedEntity && onMomentClick && (
        <EntityMomentsModal
          entry={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          onMomentClick={onMomentClick}
        />
      )}
    </div>
  );
}
