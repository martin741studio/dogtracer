import { type DailySummary, type SummaryTone } from './summary';
import { getMomentById } from './moments';
import { MOOD_DISPLAY } from './mood';

const SESSION_TYPE_LABELS: Record<string, string> = {
  walk: '🚶 Walk',
  play: '🎾 Play',
  training: '🎓 Training',
  rest: '💤 Rest',
  social: '👋 Social',
};

const TONE_COLORS: Record<SummaryTone, { bg: string; text: string }> = {
  upbeat: { bg: '#fef3c7', text: '#92400e' },
  calm: { bg: '#dbeafe', text: '#1e40af' },
  protective: { bg: '#f3e8ff', text: '#6b21a8' },
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function generatePdfHtml(summary: DailySummary): string {
  const { overview, timelineHighlights, socialMap, behaviorInsights, recommendations, dogName, tone, date } = summary;
  const toneColor = TONE_COLORS[tone];

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getMomentPhoto = (momentId: string): string | null => {
    const moment = getMomentById(momentId);
    return moment?.photoDataUrl || null;
  };

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${dogName}'s Daily Summary - ${date}</title>
  <style>
    @media print {
      @page { margin: 0.5in; size: letter; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      color: #1f2937;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: ${toneColor.bg};
      color: ${toneColor.text};
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      text-align: center;
    }
    .header h1 { margin: 0 0 8px 0; font-size: 28px; }
    .header p { margin: 0; opacity: 0.8; }
    .section { margin-bottom: 24px; }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    .card {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .stat-item {
      text-align: center;
      padding: 12px;
      background: white;
      border-radius: 8px;
    }
    .stat-value { font-size: 24px; font-weight: bold; color: #f59e0b; }
    .stat-label { font-size: 12px; color: #6b7280; }
    .highlight-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .highlight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .highlight-type { font-weight: 600; }
    .highlight-time { color: #6b7280; font-size: 14px; }
    .highlight-place { color: #9ca3af; font-size: 14px; }
    .highlight-desc { margin: 8px 0; }
    .highlight-photos {
      display: flex;
      gap: 8px;
      margin: 12px 0;
    }
    .highlight-photo {
      width: 100px;
      height: 75px;
      object-fit: cover;
      border-radius: 6px;
    }
    .tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .tag {
      display: inline-block;
      padding: 4px 8px;
      background: #fef3c7;
      border-radius: 4px;
      font-size: 12px;
    }
    .entity-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .entity-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .entity-icon { font-size: 24px; }
    .entity-info { flex: 1; }
    .entity-name { font-weight: 600; }
    .entity-outcome { font-size: 12px; color: #6b7280; }
    .insight-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .insight-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .insight-icon { font-size: 18px; }
    .insight-title { font-weight: 600; }
    .insight-type-pattern { color: #3b82f6; }
    .insight-type-trigger { color: #ef4444; }
    .insight-type-win { color: #10b981; }
    .recommendation {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 8px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .priority-high { color: #ef4444; }
    .priority-medium { color: #f59e0b; }
    .priority-low { color: #10b981; }
    .rec-title { font-weight: 600; }
    .rec-desc { color: #6b7280; font-size: 14px; }
    .footer {
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }
    .mood-pill {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      background: #f3f4f6;
    }
    .session-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
    .session-pill {
      display: inline-block;
      padding: 4px 8px;
      background: #fef3c7;
      border-radius: 4px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🐕 ${dogName}'s Daily Summary</h1>
    <p>${formatDate(date)}</p>
  </div>
`;

  html += `
  <div class="section">
    <div class="section-title">📊 Overview</div>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value">${overview.totalMoments}</div>
        <div class="stat-label">Moments</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${Object.values(overview.sessionCounts).reduce((a, b) => a + b, 0)}</div>
        <div class="stat-label">Sessions</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${formatDuration(overview.activeMinutes)}</div>
        <div class="stat-label">Active Time</div>
      </div>
    </div>
    <div class="card" style="margin-top: 12px;">
      <strong>Session Breakdown:</strong>
      <div class="session-pills">
        ${Object.entries(overview.sessionCounts)
          .filter(([, count]) => count > 0)
          .map(([type, count]) => `<span class="session-pill">${SESSION_TYPE_LABELS[type]} × ${count}</span>`)
          .join('')}
      </div>
      ${overview.topMood ? `
      <div style="margin-top: 12px;">
        <strong>Top Mood:</strong>
        <span class="mood-pill">${MOOD_DISPLAY[overview.topMood]?.emoji || ''} ${MOOD_DISPLAY[overview.topMood]?.label || overview.topMood} (${overview.topMoodCount}×)</span>
      </div>
      ` : ''}
    </div>
  </div>
`;

  if (timelineHighlights.length > 0) {
    html += `
  <div class="section">
    <div class="section-title">📅 Timeline Highlights</div>
    ${timelineHighlights.map(h => {
      const photos = h.keyPhotoIds.slice(0, 3).map(id => getMomentPhoto(id)).filter(Boolean);
      return `
      <div class="highlight-card">
        <div class="highlight-header">
          <span class="highlight-type">${SESSION_TYPE_LABELS[h.sessionType] || h.sessionType}</span>
          <span class="highlight-time">${h.timeRange}</span>
        </div>
        ${h.placeLabel ? `<div class="highlight-place">📍 ${h.placeLabel}</div>` : ''}
        <div class="highlight-desc">${h.description}</div>
        ${photos.length > 0 ? `
        <div class="highlight-photos">
          ${photos.map(p => `<img src="${p}" class="highlight-photo" alt="moment photo" />`).join('')}
        </div>
        ` : ''}
        ${h.interactions.length > 0 ? `<div style="color: #6b7280; font-size: 14px;">With: ${h.interactions.join(', ')}</div>` : ''}
        ${h.tags.length > 0 ? `<div class="tags">${h.tags.map(t => `<span class="tag">${t.emoji} ${t.label}</span>`).join('')}</div>` : ''}
      </div>
    `;
    }).join('')}
  </div>
`;
  }

  if (socialMap.length > 0) {
    html += `
  <div class="section">
    <div class="section-title">🗺️ Social Map</div>
    <div class="entity-grid">
      ${socialMap.map(e => `
        <div class="entity-card">
          <div class="entity-icon">${e.type === 'dog' ? '🐕' : '👤'}</div>
          <div class="entity-info">
            <div class="entity-name">${e.name}</div>
            <div class="entity-outcome">${e.outcome} · ${e.encounterCount} encounter${e.encounterCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
`;
  }

  if (behaviorInsights.length > 0) {
    html += `
  <div class="section">
    <div class="section-title">💡 Behavior Insights</div>
    ${behaviorInsights.map(i => {
      const icon = i.type === 'pattern' ? '📊' : i.type === 'trigger' ? '⚠️' : '✅';
      const typeClass = `insight-type-${i.type}`;
      return `
      <div class="insight-card">
        <div class="insight-header">
          <span class="insight-icon">${icon}</span>
          <span class="insight-title ${typeClass}">${i.title}</span>
        </div>
        <div>${i.description}</div>
      </div>
    `;
    }).join('')}
  </div>
`;
  }

  if (recommendations.length > 0) {
    html += `
  <div class="section">
    <div class="section-title">📋 Recommendations</div>
    ${recommendations.map(r => {
      const priorityIcon = r.priority === 'high' ? '🔴' : r.priority === 'medium' ? '🟡' : '🟢';
      const priorityClass = `priority-${r.priority}`;
      return `
      <div class="recommendation">
        <span class="${priorityClass}">${priorityIcon}</span>
        <div>
          <div class="rec-title">${r.title}</div>
          <div class="rec-desc">${r.description}</div>
        </div>
      </div>
    `;
    }).join('')}
  </div>
`;
  }

  html += `
  <div class="footer">
    Generated by DogTracer · ${new Date().toLocaleDateString()}
  </div>
</body>
</html>
`;

  return html;
}

export function exportSummaryAsPdf(summary: DailySummary): void {
  const html = generatePdfHtml(summary);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to export PDF');
    return;
  }
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}
