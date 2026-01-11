'use client';

import { useState, useEffect } from 'react';
import { getMomentsByDate, getMomentById, type Moment } from '../lib/moments';
import { rebuildSessionsForDate, getSessionsByDate, type Session } from '../lib/sessions';
import { generateDailySummary, type OverviewSection, type SummaryTone } from '../lib/summary';
import MomentCard from '../components/MomentCard';
import MomentDetailModal from '../components/MomentDetailModal';
import SessionCard from '../components/SessionCard';
import OverviewCard from '../components/OverviewCard';

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = date.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function Timeline() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [moments, setMoments] = useState<Moment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'sessions' | 'moments'>('sessions');
  const [overview, setOverview] = useState<OverviewSection | null>(null);
  const [summaryTone, setSummaryTone] = useState<SummaryTone>('upbeat');
  const [dogName, setDogName] = useState<string>('Your Dog');

  useEffect(() => {
    setIsLoading(true);
    const dayMoments = getMomentsByDate(selectedDate);
    setMoments(dayMoments);
    
    if (dayMoments.length > 0) {
      const daySessions = rebuildSessionsForDate(selectedDate);
      setSessions(daySessions);
      
      const summary = generateDailySummary(selectedDate);
      setOverview(summary.overview);
      setSummaryTone(summary.tone);
      setDogName(summary.dogName);
    } else {
      setSessions([]);
      setOverview(null);
    }
    setIsLoading(false);
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T12:00:00');
    setSelectedDate(newDate);
  };

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleMomentClick = (moment: Moment) => {
    setSelectedMoment(moment);
  };

  const handleCloseDetail = () => {
    setSelectedMoment(null);
    const dayMoments = getMomentsByDate(selectedDate);
    setMoments(dayMoments);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousDay}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            data-testid="prev-day-button"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex flex-col items-center">
            <button
              onClick={goToToday}
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 hover:text-amber-600"
              data-testid="date-display"
            >
              {formatDisplayDate(selectedDate)}
            </button>
            <input
              type="date"
              value={formatDateForInput(selectedDate)}
              onChange={handleDateChange}
              className="text-xs text-zinc-500 dark:text-zinc-400 bg-transparent border-none cursor-pointer text-center"
              data-testid="date-picker"
            />
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            data-testid="next-day-button"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent" />
          </div>
        ) : moments.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-state">
            <div className="text-4xl mb-3">📷</div>
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              No moments yet
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Capture your first moment from the Home tab
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {overview && (
              <OverviewCard overview={overview} tone={summaryTone} dogName={dogName} />
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500 dark:text-zinc-400" data-testid="moment-count">
                {moments.length} moment{moments.length !== 1 ? 's' : ''} in {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('sessions')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    viewMode === 'sessions'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                  data-testid="view-sessions-button"
                >
                  Sessions
                </button>
                <button
                  onClick={() => setViewMode('moments')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    viewMode === 'moments'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                  data-testid="view-moments-button"
                >
                  Moments
                </button>
              </div>
            </div>

            {viewMode === 'sessions' ? (
              <div className="grid grid-cols-1 gap-4" data-testid="sessions-view">
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onMomentClick={handleMomentClick}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4" data-testid="moments-view">
                {moments.map((moment) => (
                  <MomentCard
                    key={moment.id}
                    moment={moment}
                    onClick={() => handleMomentClick(moment)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedMoment && (
        <MomentDetailModal moment={selectedMoment} onClose={handleCloseDetail} />
      )}
    </div>
  );
}
