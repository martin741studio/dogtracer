'use client';

import { type Session, type BehaviorFlag } from '../lib/sessions';
import { getMomentById, type Moment } from '../lib/moments';

interface SessionCardProps {
  session: Session;
  onMomentClick: (moment: Moment) => void;
}

const SESSION_TYPE_ICONS: Record<string, string> = {
  walk: '🚶',
  play: '🎾',
  training: '🧠',
  rest: '💤',
  social: '🐾',
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  walk: 'Walk',
  play: 'Play',
  training: 'Training',
  rest: 'Rest',
  social: 'Social',
};

const BEHAVIOR_FLAG_ICONS: Record<BehaviorFlag, string> = {
  win: '✅',
  trigger: '⚠️',
  social: '🐾',
  training: '🧠',
  food: '🥣',
  rest: '💤',
};

function formatTimeRange(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export default function SessionCard({ session, onMomentClick }: SessionCardProps) {
  const keyMoments = session.keyPhotoIds
    .map((id) => getMomentById(id))
    .filter((m): m is Moment => m !== undefined);

  return (
    <div
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      data-testid="session-card"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">{SESSION_TYPE_ICONS[session.type]}</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {SESSION_TYPE_LABELS[session.type]}
          </span>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {formatTimeRange(session.startTime, session.endTime)}
        </div>
      </div>

      {session.placeLabel && (
        <div className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span data-testid="session-place-label">{session.placeLabel}</span>
        </div>
      )}

      {keyMoments.length > 0 && (
        <div className="p-2">
          <div className="grid grid-cols-3 gap-1">
            {keyMoments.map((moment) => (
              <button
                key={moment.id}
                onClick={() => onMomentClick(moment)}
                className="aspect-square rounded-lg overflow-hidden focus:ring-2 focus:ring-amber-500"
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

      <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {session.momentIds.length} moment{session.momentIds.length !== 1 ? 's' : ''}
        </div>
        {session.behaviorFlags.length > 0 && (
          <div className="flex gap-1" data-testid="session-behavior-flags">
            {session.behaviorFlags.map((flag) => (
              <span key={flag} title={flag} className="text-sm">
                {BEHAVIOR_FLAG_ICONS[flag]}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
