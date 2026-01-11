'use client';

import { useState, useEffect } from 'react';
import { type Entity, type DogEntity, type HumanEntity } from '../lib/entities';
import { getMomentById, type Moment } from '../lib/moments';
import { getEntityEncounterStats, formatLastSeen, type EntityEncounterStats } from '../lib/encounters';
import MomentDetailModal from '../components/MomentDetailModal';

type FilterType = 'all' | 'dogs' | 'humans';

function getRelationshipLabel(entity: Entity): string {
  if (entity.type === 'dog') {
    const dog = entity as DogEntity;
    if (dog.metadata.isPrimary) return 'My dog';
    switch (dog.metadata.relationship) {
      case 'friend':
        return '🤝 Friend';
      case 'conflict':
        return '⚠️ Conflict';
      case 'neutral':
        return 'Neutral';
      default:
        return 'Unknown';
    }
  } else {
    const human = entity as HumanEntity;
    switch (human.metadata.relationship) {
      case 'owner':
        return '💛 Owner';
      case 'friend':
        return '🤝 Friend';
      case 'neighbor':
        return '🏠 Neighbor';
      case 'vet':
        return '🏥 Vet';
      case 'trainer':
        return '🎓 Trainer';
      case 'stranger':
        return 'Stranger';
      default:
        return 'Unknown';
    }
  }
}

function getRelationshipColor(entity: Entity): string {
  if (entity.type === 'dog') {
    const dog = entity as DogEntity;
    if (dog.metadata.isPrimary) return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
    switch (dog.metadata.relationship) {
      case 'friend':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'conflict':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400';
    }
  } else {
    const human = entity as HumanEntity;
    switch (human.metadata.relationship) {
      case 'owner':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
      case 'friend':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'vet':
      case 'trainer':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      case 'neighbor':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400';
    }
  }
}

interface EntityCardProps {
  stats: EntityEncounterStats;
  onTap: () => void;
}

function EntityCard({ stats, onTap }: EntityCardProps) {
  const { entity, encounterCount, lastSeenDate } = stats;
  const icon = entity.type === 'dog' ? '🐕' : '👤';
  
  return (
    <button
      onClick={onTap}
      className="w-full text-left bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-amber-300 dark:hover:border-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
      data-testid="encounter-entity-card"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className="font-medium text-zinc-900 dark:text-zinc-100 truncate"
              data-testid="encounter-entity-name"
            >
              {entity.name}
            </h4>
            <span
              className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${getRelationshipColor(entity)}`}
              data-testid="encounter-entity-relationship"
            >
              {getRelationshipLabel(entity)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-zinc-500 dark:text-zinc-400" data-testid="encounter-count">
              {encounterCount} moment{encounterCount !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500" data-testid="last-seen">
              Last seen: {formatLastSeen(lastSeenDate)}
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
  stats: EntityEncounterStats;
  onClose: () => void;
  onMomentClick: (moment: Moment) => void;
}

function EntityMomentsModal({ stats, onClose, onMomentClick }: EntityMomentsModalProps) {
  const { entity, momentIds, encounterCount } = stats;
  const moments = momentIds
    .map((id) => getMomentById(id))
    .filter((m): m is Moment => m !== undefined);
  const icon = entity.type === 'dog' ? '🐕' : '👤';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      data-testid="encounter-moments-modal"
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {entity.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            data-testid="close-encounter-moments"
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
                  data-testid="encounter-moment-thumbnail"
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
            {encounterCount} moment{encounterCount !== 1 ? 's' : ''} with {entity.name}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Encounters() {
  const [allStats, setAllStats] = useState<EntityEncounterStats[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedStats, setSelectedStats] = useState<EntityEncounterStats | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);

  useEffect(() => {
    setAllStats(getEntityEncounterStats());
  }, []);

  const refreshStats = () => {
    setAllStats(getEntityEncounterStats());
  };

  const dogs = allStats.filter((s) => s.entity.type === 'dog');
  const humans = allStats.filter((s) => s.entity.type === 'human');

  const filteredStats =
    filter === 'dogs' ? dogs : filter === 'humans' ? humans : allStats;

  const handleMomentClick = (moment: Moment) => {
    setSelectedMoment(moment);
  };

  const handleMomentClose = () => {
    setSelectedMoment(null);
    refreshStats();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50" data-testid="encounters-title">
          Encounters
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          All dogs and people your dog has met
        </p>
      </div>

      <div className="p-4">
        <div
          className="flex gap-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg p-0.5 mb-4"
          data-testid="encounters-filter"
        >
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
            data-testid="filter-all"
          >
            All ({allStats.length})
          </button>
          <button
            onClick={() => setFilter('dogs')}
            className={`flex-1 px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              filter === 'dogs'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
            data-testid="filter-dogs"
          >
            🐕 Dogs ({dogs.length})
          </button>
          <button
            onClick={() => setFilter('humans')}
            className={`flex-1 px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              filter === 'humans'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
            data-testid="filter-humans"
          >
            👤 People ({humans.length})
          </button>
        </div>

        {filteredStats.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-testid="empty-state"
          >
            <div className="text-6xl mb-4">🐕</div>
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              No encounters yet
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
              {filter === 'dogs'
                ? 'Dogs your dog has met will appear here once you capture and name them in photos.'
                : filter === 'humans'
                ? 'People your dog has met will appear here once you capture and name them in photos.'
                : 'Dogs and people your dog has met will appear here once you capture and name them in photos.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3" data-testid="encounters-list">
            {filteredStats.map((stats) => (
              <EntityCard
                key={stats.entity.id}
                stats={stats}
                onTap={() => setSelectedStats(stats)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedStats && (
        <EntityMomentsModal
          stats={selectedStats}
          onClose={() => setSelectedStats(null)}
          onMomentClick={handleMomentClick}
        />
      )}

      {selectedMoment && (
        <MomentDetailModal
          moment={selectedMoment}
          onClose={handleMomentClose}
        />
      )}
    </div>
  );
}
