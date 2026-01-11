'use client';

import { useState, useEffect } from 'react';
import { getSettings, setAutoGenerateEnabled, setAutoGenerateTime } from '../lib/settings';

export default function AutoGenerateSettings() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('21:00');

  useEffect(() => {
    const settings = getSettings();
    setEnabled(settings.autoGenerateEnabled);
    setTime(settings.autoGenerateTime);
  }, []);

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    setAutoGenerateEnabled(newValue);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    setAutoGenerateTime(newTime);
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-lg" data-testid="auto-generate-settings">
      <h3 className="mb-3 text-sm font-medium text-gray-700">Auto-Generate Summary</h3>
      
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm text-gray-600" htmlFor="auto-generate-toggle">
          Enable daily auto-generate
        </label>
        <button
          id="auto-generate-toggle"
          onClick={handleToggle}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            enabled ? 'bg-amber-500' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={enabled}
          data-testid="auto-generate-toggle"
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="flex items-center justify-between" data-testid="auto-generate-time-section">
          <label className="text-sm text-gray-600" htmlFor="auto-generate-time">
            Generate at:
          </label>
          <input
            type="time"
            id="auto-generate-time"
            value={time}
            onChange={handleTimeChange}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            data-testid="auto-generate-time-input"
          />
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500">
        {enabled 
          ? `Summary will be generated daily at ${time}`
          : 'Turn on to automatically generate a summary each day'}
      </p>
    </div>
  );
}
