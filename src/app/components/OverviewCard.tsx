'use client';

import type { OverviewSection, SummaryTone } from '../lib/summary';
import type { MomentMood } from '../lib/moments';
import { MOOD_DISPLAY } from '../lib/mood';

interface OverviewCardProps {
  overview: OverviewSection;
  tone: SummaryTone;
  dogName: string;
}

function getToneColor(tone: SummaryTone): string {
  switch (tone) {
    case 'upbeat':
      return 'bg-amber-50 border-amber-200';
    case 'calm':
      return 'bg-blue-50 border-blue-200';
    case 'protective':
      return 'bg-purple-50 border-purple-200';
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function OverviewCard({ overview, tone, dogName }: OverviewCardProps) {
  const {
    totalMoments,
    sessionCounts,
    activeMinutes,
    restMinutes,
    topMood,
    topMoodCount,
    moodShifts,
  } = overview;

  const totalSessions = Object.values(sessionCounts).reduce((a, b) => a + b, 0);

  return (
    <div
      className={`rounded-xl border p-4 ${getToneColor(tone)}`}
      data-testid="overview-card"
    >
      <h3 className="text-lg font-semibold text-zinc-900 mb-3" data-testid="overview-title">
        {dogName}&apos;s Day at a Glance
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 shadow-sm" data-testid="total-moments">
          <div className="text-2xl font-bold text-amber-600">{totalMoments}</div>
          <div className="text-xs text-zinc-500">
            moment{totalMoments !== 1 ? 's' : ''} captured
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm" data-testid="total-sessions">
          <div className="text-2xl font-bold text-amber-600">{totalSessions}</div>
          <div className="text-xs text-zinc-500">
            session{totalSessions !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm" data-testid="active-time">
          <div className="text-2xl font-bold text-green-600">{formatDuration(activeMinutes)}</div>
          <div className="text-xs text-zinc-500">active time</div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm" data-testid="rest-time">
          <div className="text-2xl font-bold text-blue-600">{formatDuration(restMinutes)}</div>
          <div className="text-xs text-zinc-500">rest time</div>
        </div>
      </div>

      <div className="space-y-3">
        {sessionCounts.walk > 0 || sessionCounts.play > 0 || sessionCounts.training > 0 ? (
          <div className="bg-white rounded-lg p-3 shadow-sm" data-testid="session-breakdown">
            <div className="text-sm font-medium text-zinc-700 mb-2">Session Breakdown</div>
            <div className="flex flex-wrap gap-2">
              {sessionCounts.walk > 0 && (
                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                  🚶 {sessionCounts.walk} walk{sessionCounts.walk !== 1 ? 's' : ''}
                </span>
              )}
              {sessionCounts.play > 0 && (
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                  🎾 {sessionCounts.play} play
                </span>
              )}
              {sessionCounts.training > 0 && (
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  🧠 {sessionCounts.training} training
                </span>
              )}
              {sessionCounts.rest > 0 && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  💤 {sessionCounts.rest} rest
                </span>
              )}
              {sessionCounts.social > 0 && (
                <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full">
                  🐾 {sessionCounts.social} social
                </span>
              )}
            </div>
          </div>
        ) : null}

        {topMood && (
          <div className="bg-white rounded-lg p-3 shadow-sm" data-testid="top-mood">
            <div className="text-sm font-medium text-zinc-700 mb-2">Top Mood</div>
            <div className="flex items-center gap-2">
              <span className={`text-sm px-2 py-1 rounded-full ${MOOD_DISPLAY[topMood].color}`}>
                {MOOD_DISPLAY[topMood].emoji} {MOOD_DISPLAY[topMood].label}
              </span>
              <span className="text-xs text-zinc-500">
                ({topMoodCount} moment{topMoodCount !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        )}

        {moodShifts.length > 0 && (
          <div className="bg-white rounded-lg p-3 shadow-sm" data-testid="mood-shifts">
            <div className="text-sm font-medium text-zinc-700 mb-2">
              Mood Shifts ({moodShifts.length})
            </div>
            <div className="space-y-1">
              {moodShifts.slice(0, 3).map((shift, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs text-zinc-600">
                  <span className="text-zinc-400">{shift.time}:</span>
                  <span>{MOOD_DISPLAY[shift.from].emoji}</span>
                  <span className="text-zinc-400">→</span>
                  <span>{MOOD_DISPLAY[shift.to].emoji}</span>
                </div>
              ))}
              {moodShifts.length > 3 && (
                <div className="text-xs text-zinc-400">
                  +{moodShifts.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
