'use client';

import { useState } from 'react';
import type { BehaviorInsight, SummaryTone } from '../lib/summary';
import { getMomentById, type Moment } from '../lib/moments';

interface BehaviorInsightsCardProps {
  insights: BehaviorInsight[];
  tone: SummaryTone;
  onMomentClick?: (moment: Moment) => void;
}

const INSIGHT_TYPE_CONFIG: Record<BehaviorInsight['type'], { emoji: string; label: string; bgColor: string; borderColor: string; textColor: string }> = {
  pattern: {
    emoji: '📊',
    label: 'Pattern',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-800',
  },
  trigger: {
    emoji: '⚠️',
    label: 'Trigger',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    textColor: 'text-red-800',
  },
  win: {
    emoji: '✅',
    label: 'Win',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    textColor: 'text-green-800',
  },
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

interface InsightItemProps {
  insight: BehaviorInsight;
  onMomentClick?: (moment: Moment) => void;
}

function InsightItem({ insight, onMomentClick }: InsightItemProps) {
  const [showMoments, setShowMoments] = useState(false);
  const config = INSIGHT_TYPE_CONFIG[insight.type];
  
  const evidenceMoments = insight.momentIds
    .map((id) => getMomentById(id))
    .filter((m): m is Moment => m !== undefined);

  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden`}
      data-testid="behavior-insight"
    >
      <div className={`flex items-center justify-between px-4 py-3 ${config.bgColor} border-b ${config.borderColor}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl" data-testid="insight-emoji">{config.emoji}</span>
          <span className={`font-medium ${config.textColor}`} data-testid="insight-type-label">
            {config.label}
          </span>
        </div>
        {evidenceMoments.length > 0 && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`} data-testid="insight-evidence-count">
            {evidenceMoments.length} moment{evidenceMoments.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="px-4 py-3">
        <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1" data-testid="insight-title">
          {insight.title}
        </h4>
        <p className="text-sm text-zinc-600 dark:text-zinc-400" data-testid="insight-description">
          {insight.description}
        </p>
      </div>

      {evidenceMoments.length > 0 && (
        <div className="px-4 pb-3">
          <button
            onClick={() => setShowMoments(!showMoments)}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            data-testid="toggle-evidence-moments"
          >
            {showMoments ? 'Hide' : 'View'} evidence moments
            <svg
              className={`w-3 h-3 transition-transform ${showMoments ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMoments && (
            <div className="mt-2 grid grid-cols-4 gap-1" data-testid="evidence-moments-grid">
              {evidenceMoments.slice(0, 4).map((moment) => (
                <button
                  key={moment.id}
                  onClick={() => onMomentClick?.(moment)}
                  className="aspect-square rounded-lg overflow-hidden focus:ring-2 focus:ring-amber-500"
                  data-testid="evidence-moment-thumbnail"
                >
                  <img
                    src={moment.photoDataUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {evidenceMoments.length > 4 && (
                <div className="aspect-square rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                  +{evidenceMoments.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BehaviorInsightsCard({
  insights,
  tone,
  onMomentClick,
}: BehaviorInsightsCardProps) {
  if (insights.length === 0) {
    return null;
  }

  const wins = insights.filter((i) => i.type === 'win');
  const triggers = insights.filter((i) => i.type === 'trigger');
  const patterns = insights.filter((i) => i.type === 'pattern');

  return (
    <div
      className={`rounded-xl border p-4 ${getToneHeaderColor(tone)}`}
      data-testid="behavior-insights-card"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-zinc-900" data-testid="behavior-insights-title">
          Behavior Insights
        </h3>
        <div className="flex gap-2" data-testid="insight-counts">
          {wins.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700" data-testid="wins-count">
              ✅ {wins.length} win{wins.length !== 1 ? 's' : ''}
            </span>
          )}
          {triggers.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700" data-testid="triggers-count">
              ⚠️ {triggers.length} trigger{triggers.length !== 1 ? 's' : ''}
            </span>
          )}
          {patterns.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700" data-testid="patterns-count">
              📊 {patterns.length} pattern{patterns.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <InsightItem
            key={`${insight.type}-${index}`}
            insight={insight}
            onMomentClick={onMomentClick}
          />
        ))}
      </div>
    </div>
  );
}
