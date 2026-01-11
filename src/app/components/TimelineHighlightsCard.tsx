'use client';

import type { TimelineHighlight, SummaryTone } from '../lib/summary';
import type { SessionType } from '../lib/sessions';
import { getMomentById, type Moment } from '../lib/moments';

interface TimelineHighlightsCardProps {
  highlights: TimelineHighlight[];
  tone: SummaryTone;
  onMomentClick?: (moment: Moment) => void;
}

const SESSION_TYPE_ICONS: Record<SessionType, string> = {
  walk: '🚶',
  play: '🎾',
  training: '🧠',
  rest: '💤',
  social: '🐾',
};

const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  walk: 'Walk',
  play: 'Play',
  training: 'Training',
  rest: 'Rest',
  social: 'Social',
};

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

interface HighlightItemProps {
  highlight: TimelineHighlight;
  tone: SummaryTone;
  onMomentClick?: (moment: Moment) => void;
}

function HighlightItem({ highlight, tone, onMomentClick }: HighlightItemProps) {
  const keyMoments = highlight.keyPhotoIds
    .map((id) => getMomentById(id))
    .filter((m): m is Moment => m !== undefined);

  return (
    <div
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      data-testid="timeline-highlight"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">{SESSION_TYPE_ICONS[highlight.sessionType]}</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {SESSION_TYPE_LABELS[highlight.sessionType]}
          </span>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400" data-testid="highlight-time-range">
          {highlight.timeRange}
        </div>
      </div>

      {highlight.placeLabel && (
        <div className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1 border-b border-zinc-100 dark:border-zinc-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span data-testid="highlight-place-label">{highlight.placeLabel}</span>
        </div>
      )}

      {keyMoments.length > 0 && (
        <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className={`grid gap-1 ${keyMoments.length === 1 ? 'grid-cols-1' : keyMoments.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {keyMoments.map((moment) => (
              <button
                key={moment.id}
                onClick={() => onMomentClick?.(moment)}
                className="aspect-square rounded-lg overflow-hidden focus:ring-2 focus:ring-amber-500"
                data-testid="highlight-photo"
              >
                <img
                  src={moment.photoDataUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-3">
        <p className="text-sm text-zinc-700 dark:text-zinc-300" data-testid="highlight-description">
          {highlight.description}
        </p>
      </div>

      {highlight.interactions.length > 0 && (
        <div className="px-4 pb-3" data-testid="highlight-interactions">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Interactions:
          </div>
          <div className="flex flex-wrap gap-1">
            {highlight.interactions.map((name) => (
              <span
                key={name}
                className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full"
                data-testid="interaction-name"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {highlight.tags.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1" data-testid="highlight-tags">
          {highlight.tags.map((tag) => (
            <span
              key={tag.label}
              className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full"
              data-testid={`tag-${tag.label}`}
            >
              {tag.emoji} {tag.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TimelineHighlightsCard({
  highlights,
  tone,
  onMomentClick,
}: TimelineHighlightsCardProps) {
  if (highlights.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border p-4 ${getToneHeaderColor(tone)}`}
      data-testid="timeline-highlights-card"
    >
      <h3 className="text-lg font-semibold text-zinc-900 mb-3" data-testid="timeline-highlights-title">
        Timeline Highlights
      </h3>

      <div className="space-y-3">
        {highlights.map((highlight) => (
          <HighlightItem
            key={highlight.sessionId}
            highlight={highlight}
            tone={tone}
            onMomentClick={onMomentClick}
          />
        ))}
      </div>
    </div>
  );
}
