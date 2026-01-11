'use client';

import { type Recommendation, type SummaryTone } from '../lib/summary';

interface RecommendationsCardProps {
  recommendations: Recommendation[];
  tone: SummaryTone;
}

const PRIORITY_STYLES = {
  high: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    icon: '🔴',
  },
  medium: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    icon: '🟡',
  },
  low: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    icon: '🟢',
  },
};

const TONE_COLORS = {
  upbeat: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  calm: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  protective: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
};

export default function RecommendationsCard({ recommendations, tone }: RecommendationsCardProps) {
  if (recommendations.length === 0) return null;

  return (
    <div
      className={`rounded-xl border overflow-hidden ${TONE_COLORS[tone]}`}
      data-testid="recommendations-card"
    >
      <div className="px-4 py-3 border-b border-inherit">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2" data-testid="recommendations-title">
          <span>💡</span>
          <span>Recommendations for Tomorrow</span>
          <span className="ml-auto text-xs font-normal text-zinc-500 dark:text-zinc-400" data-testid="recommendations-count">
            {recommendations.length} tip{recommendations.length !== 1 ? 's' : ''}
          </span>
        </h3>
      </div>

      <div className="p-4 space-y-3">
        {recommendations.map((rec, index) => {
          const style = PRIORITY_STYLES[rec.priority];
          return (
            <div
              key={index}
              className={`rounded-lg border p-3 ${style.bg} ${style.border}`}
              data-testid="recommendation"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg" data-testid="recommendation-priority-icon">
                  {style.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100" data-testid="recommendation-title">
                      {rec.title}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${style.badge}`} data-testid="recommendation-priority">
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400" data-testid="recommendation-description">
                    {rec.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
