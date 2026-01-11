'use client';

import { useState, useEffect } from 'react';
import CameraButton from "./components/CameraButton";
import DailySummaryModal from "./components/DailySummaryModal";
import { shouldAutoGenerate, markAutoGenerateRun } from "./lib/settings";
import { getMomentsByDate } from "./lib/moments";

export default function Home() {
  const [showSummary, setShowSummary] = useState(false);
  const [hasMomentsToday, setHasMomentsToday] = useState(false);

  useEffect(() => {
    // Check for moments today
    const todayMoments = getMomentsByDate(new Date());
    setHasMomentsToday(todayMoments.length > 0);

    // Check for auto-generate
    if (shouldAutoGenerate()) {
      setShowSummary(true);
      markAutoGenerateRun(new Date());
    }
  }, []);

  const handleGenerateSummary = () => {
    setShowSummary(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          🐕 DogTracer
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Document your dog&apos;s day with photos and insights
        </p>
      </div>

      <div className="mt-12">
        <CameraButton />
      </div>

      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        Tap the camera to capture a moment
      </p>

      {/* Generate Summary Button */}
      <button
        onClick={handleGenerateSummary}
        className="mt-8 flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-medium text-white shadow-lg hover:bg-amber-600 transition-colors"
        data-testid="generate-summary-button"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Generate Daily Summary
      </button>

      {hasMomentsToday && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400" data-testid="moments-today-hint">
          📸 You have moments captured today
        </p>
      )}

      {showSummary && (
        <DailySummaryModal 
          date={new Date()} 
          onClose={() => setShowSummary(false)} 
        />
      )}
    </div>
  );
}
