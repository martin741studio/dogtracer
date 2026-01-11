'use client';

import { useState, useEffect } from 'react';
import { generateDailySummary, type DailySummary } from '../lib/summary';
import { getMomentsByDate, getMomentById, type Moment } from '../lib/moments';
import OverviewCard from './OverviewCard';
import TimelineHighlightsCard from './TimelineHighlightsCard';
import SocialMapCard from './SocialMapCard';
import BehaviorInsightsCard from './BehaviorInsightsCard';
import RecommendationsCard from './RecommendationsCard';
import MomentDetailModal from './MomentDetailModal';

interface DailySummaryModalProps {
  date: Date;
  onClose: () => void;
}

export default function DailySummaryModal({ date, onClose }: DailySummaryModalProps) {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMoments, setHasMoments] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const moments = getMomentsByDate(date);
    setHasMoments(moments.length > 0);
    
    if (moments.length > 0) {
      const generated = generateDailySummary(date);
      setSummary(generated);
    }
    setIsLoading(false);
  }, [date]);

  const handleMomentClick = (moment: Moment) => {
    setSelectedMoment(moment);
  };

  const handleCloseMomentDetail = () => {
    setSelectedMoment(null);
  };

  const formatDate = (d: Date): string => {
    return d.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50" data-testid="daily-summary-modal">
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-amber-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white" data-testid="summary-modal-title">
                  📋 Daily Summary
                </h2>
                <p className="text-amber-100 text-sm" data-testid="summary-modal-date">
                  {formatDate(date)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/30"
                data-testid="close-summary-modal"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6" data-testid="summary-modal-content">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent" />
              </div>
            ) : !hasMoments ? (
              <div className="text-center py-12" data-testid="no-moments-message">
                <div className="text-4xl mb-3">📷</div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  No moments to summarize
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Capture some moments first, then generate your summary!
                </p>
              </div>
            ) : summary ? (
              <div className="space-y-4">
                {summary.dogName && (
                  <div className="text-center mb-4">
                    <span className="text-2xl">🐕</span>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100" data-testid="summary-dog-name">
                      {summary.dogName}&apos;s Day
                    </h3>
                  </div>
                )}

                <OverviewCard
                  overview={summary.overview}
                  tone={summary.tone}
                  dogName={summary.dogName}
                />

                {summary.timelineHighlights.length > 0 && (
                  <TimelineHighlightsCard
                    highlights={summary.timelineHighlights}
                    tone={summary.tone}
                    onMomentClick={handleMomentClick}
                  />
                )}

                {summary.socialMap.length > 0 && (
                  <SocialMapCard
                    socialMap={summary.socialMap}
                    tone={summary.tone}
                    onMomentClick={handleMomentClick}
                  />
                )}

                {summary.behaviorInsights.length > 0 && (
                  <BehaviorInsightsCard
                    insights={summary.behaviorInsights}
                    tone={summary.tone}
                    onMomentClick={handleMomentClick}
                  />
                )}

                {summary.recommendations.length > 0 && (
                  <RecommendationsCard
                    recommendations={summary.recommendations}
                    tone={summary.tone}
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {selectedMoment && (
        <MomentDetailModal moment={selectedMoment} onClose={handleCloseMomentDetail} />
      )}
    </div>
  );
}
