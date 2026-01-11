import { type Moment, getMomentsByDate, type MomentMood } from './moments';
import { type Session, getSessionsByDate, type SessionType, type BehaviorFlag } from './sessions';
import { type Entity, getEntityById, getDogs, getHumans } from './entities';
import { type DogProfile, getProfile, type Temperament } from './profile';
import { MOOD_DISPLAY, type MoodDisplay } from './mood';

export type SummaryTone = 'upbeat' | 'calm' | 'protective';

export interface OverviewSection {
  totalMoments: number;
  sessionCounts: Record<SessionType, number>;
  activeMinutes: number;
  restMinutes: number;
  topMood: MomentMood | null;
  topMoodCount: number;
  moodShifts: { from: MomentMood; to: MomentMood; time: string }[];
}

export interface TimelineHighlight {
  sessionId: string;
  sessionType: SessionType;
  timeRange: string;
  placeLabel: string | null;
  keyPhotoIds: string[];
  description: string;
  interactions: string[];
  tags: { emoji: string; label: string }[];
}

export interface SocialMapEntry {
  entityId: string;
  name: string;
  type: 'dog' | 'human';
  encounterCount: number;
  outcome: string;
  momentIds: string[];
}

export interface BehaviorInsight {
  type: 'pattern' | 'trigger' | 'win';
  title: string;
  description: string;
  momentIds: string[];
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DailySummary {
  date: string;
  dogName: string;
  tone: SummaryTone;
  overview: OverviewSection;
  timelineHighlights: TimelineHighlight[];
  socialMap: SocialMapEntry[];
  behaviorInsights: BehaviorInsight[];
  recommendations: Recommendation[];
  generatedAt: string;
}

function inferToneFromTemperament(temperament: Temperament[]): SummaryTone {
  const hasAnxious = temperament.includes('anxious');
  const hasReactive = temperament.includes('reactive');
  const hasProtective = temperament.includes('protective');
  const hasSocial = temperament.includes('social');
  const hasCurious = temperament.includes('curious');
  const hasHighEnergy = temperament.includes('high-energy');

  if (hasAnxious || hasReactive) {
    return 'calm';
  }
  if (hasProtective) {
    return 'protective';
  }
  if (hasSocial || hasCurious || hasHighEnergy) {
    return 'upbeat';
  }
  return 'upbeat';
}

function getSessionDurationMinutes(session: Session): number {
  const start = new Date(session.startTime).getTime();
  const end = new Date(session.endTime).getTime();
  return Math.max(1, Math.round((end - start) / 60000));
}

function calculateOverview(moments: Moment[], sessions: Session[]): OverviewSection {
  const sessionCounts: Record<SessionType, number> = {
    walk: 0,
    play: 0,
    training: 0,
    rest: 0,
    social: 0,
  };

  let activeMinutes = 0;
  let restMinutes = 0;

  for (const session of sessions) {
    sessionCounts[session.type]++;
    const duration = getSessionDurationMinutes(session);
    if (session.type === 'rest') {
      restMinutes += duration;
    } else {
      activeMinutes += duration;
    }
  }

  const moodCounts: Record<string, number> = {};
  for (const moment of moments) {
    if (moment.mood) {
      moodCounts[moment.mood] = (moodCounts[moment.mood] || 0) + 1;
    }
  }

  let topMood: MomentMood | null = null;
  let topMoodCount = 0;
  for (const [mood, count] of Object.entries(moodCounts)) {
    if (count > topMoodCount) {
      topMood = mood as MomentMood;
      topMoodCount = count;
    }
  }

  const moodShifts: { from: MomentMood; to: MomentMood; time: string }[] = [];
  const sortedMoments = [...moments].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  for (let i = 1; i < sortedMoments.length; i++) {
    const prev = sortedMoments[i - 1];
    const curr = sortedMoments[i];
    if (prev.mood && curr.mood && prev.mood !== curr.mood) {
      moodShifts.push({
        from: prev.mood,
        to: curr.mood,
        time: new Date(curr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
  }

  return {
    totalMoments: moments.length,
    sessionCounts,
    activeMinutes,
    restMinutes,
    topMood,
    topMoodCount,
    moodShifts,
  };
}

const BEHAVIOR_FLAG_TAGS: Record<BehaviorFlag, { emoji: string; label: string }> = {
  win: { emoji: '✅', label: 'win' },
  trigger: { emoji: '⚠️', label: 'trigger' },
  social: { emoji: '🐾', label: 'social' },
  training: { emoji: '🧠', label: 'training' },
  food: { emoji: '🥣', label: 'food' },
  rest: { emoji: '💤', label: 'rest' },
};

function generateSessionDescription(
  session: Session,
  moments: Moment[],
  tone: SummaryTone,
  dogName: string
): string {
  const sessionMoments = moments.filter((m) => session.momentIds.includes(m.id));
  const momentCount = sessionMoments.length;
  const placeLabel = session.placeLabel || 'an adventure spot';

  const templates: Record<SummaryTone, Record<SessionType, string>> = {
    upbeat: {
      walk: `${dogName} had an amazing walk at ${placeLabel}! ${momentCount} exciting moment${momentCount !== 1 ? 's' : ''} captured.`,
      play: `Super fun playtime for ${dogName}! Lots of energy and joy at ${placeLabel}.`,
      training: `${dogName} worked hard on training today! Great focus and effort shown.`,
      rest: `${dogName} took a well-deserved rest at ${placeLabel}. Recharging those batteries!`,
      social: `${dogName} made some friends today! Social time at ${placeLabel} was a hit.`,
    },
    calm: {
      walk: `${dogName} had a peaceful walk at ${placeLabel}. ${momentCount} calm moment${momentCount !== 1 ? 's' : ''} captured.`,
      play: `Gentle play session for ${dogName}. A nice, controlled energy level throughout.`,
      training: `${dogName} practiced skills with patience. Every small step is progress.`,
      rest: `${dogName} found a comfortable spot at ${placeLabel} for some quiet time.`,
      social: `${dogName} had some social interactions at ${placeLabel}. Taking it at their own pace.`,
    },
    protective: {
      walk: `${dogName} surveyed the territory at ${placeLabel}. ${momentCount} moment${momentCount !== 1 ? 's' : ''} on watch.`,
      play: `${dogName} engaged in play while staying aware of surroundings at ${placeLabel}.`,
      training: `${dogName} practiced boundary awareness and control. Good guardian instincts.`,
      rest: `${dogName} kept watch from their rest spot at ${placeLabel}. Always alert.`,
      social: `${dogName} carefully assessed new friends at ${placeLabel}. Trust is earned!`,
    },
  };

  return templates[tone][session.type];
}

function formatTimeRange(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const startStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${startStr} - ${endStr}`;
}

function generateTimelineHighlights(
  sessions: Session[],
  moments: Moment[],
  tone: SummaryTone,
  dogName: string
): TimelineHighlight[] {
  return sessions.map((session) => {
    const sessionMoments = moments.filter((m) => session.momentIds.includes(m.id));
    const interactions: string[] = [];

    for (const moment of sessionMoments) {
      for (const entityId of moment.entityIds) {
        const entity = getEntityById(entityId);
        if (entity && entity.name && !interactions.includes(entity.name)) {
          interactions.push(entity.name);
        }
      }
    }

    const tags = session.behaviorFlags.map((flag) => BEHAVIOR_FLAG_TAGS[flag]);

    return {
      sessionId: session.id,
      sessionType: session.type,
      timeRange: formatTimeRange(session.startTime, session.endTime),
      placeLabel: session.placeLabel,
      keyPhotoIds: session.keyPhotoIds,
      description: generateSessionDescription(session, moments, tone, dogName),
      interactions,
      tags,
    };
  });
}

function generateSocialMap(moments: Moment[]): SocialMapEntry[] {
  const entityEncounters: Map<string, { count: number; momentIds: string[] }> = new Map();

  for (const moment of moments) {
    for (const entityId of moment.entityIds) {
      const existing = entityEncounters.get(entityId) || { count: 0, momentIds: [] };
      existing.count++;
      existing.momentIds.push(moment.id);
      entityEncounters.set(entityId, existing);
    }
  }

  const entries: SocialMapEntry[] = [];

  for (const [entityId, data] of entityEncounters) {
    const entity = getEntityById(entityId);
    if (!entity) continue;

    let outcome = 'neutral';
    if (entity.type === 'dog') {
      outcome = entity.metadata.relationship;
    } else {
      outcome = entity.metadata.relationship;
    }

    entries.push({
      entityId,
      name: entity.name || (entity.type === 'dog' ? 'Unknown Dog' : 'Unknown Person'),
      type: entity.type,
      encounterCount: data.count,
      outcome,
      momentIds: data.momentIds,
    });
  }

  return entries.sort((a, b) => b.encounterCount - a.encounterCount);
}

function generateBehaviorInsights(
  moments: Moment[],
  sessions: Session[],
  profile: DogProfile | null,
  tone: SummaryTone
): BehaviorInsight[] {
  const insights: BehaviorInsight[] = [];

  const stressMoments = moments.filter((m) => m.tags.includes('stress'));
  if (stressMoments.length > 0) {
    insights.push({
      type: 'trigger',
      title: 'Stress Moments Detected',
      description:
        tone === 'calm'
          ? `${profile?.name || 'Your dog'} showed some stress signals today. Let's work on building confidence.`
          : `Found ${stressMoments.length} moment${stressMoments.length !== 1 ? 's' : ''} with stress indicators. Worth monitoring.`,
      momentIds: stressMoments.map((m) => m.id),
    });
  }

  const trainingMoments = moments.filter((m) => m.tags.includes('training'));
  if (trainingMoments.length > 0) {
    insights.push({
      type: 'win',
      title: 'Training Progress',
      description:
        tone === 'upbeat'
          ? `Amazing! ${trainingMoments.length} training moment${trainingMoments.length !== 1 ? 's' : ''} today. Keep up the great work!`
          : `${trainingMoments.length} training moment${trainingMoments.length !== 1 ? 's' : ''} logged. Consistent practice is key.`,
      momentIds: trainingMoments.map((m) => m.id),
    });
  }

  const anxiousMoments = moments.filter((m) => m.mood === 'anxious');
  const calmMoments = moments.filter((m) => m.mood === 'calm');
  if (anxiousMoments.length > 0 && calmMoments.length > anxiousMoments.length) {
    insights.push({
      type: 'pattern',
      title: 'More Calm Than Anxious',
      description: `${profile?.name || 'Your dog'} showed more calm moments than anxious ones today. Progress!`,
      momentIds: calmMoments.map((m) => m.id),
    });
  }

  const restSessions = sessions.filter((s) => s.type === 'rest');
  const walkSessions = sessions.filter((s) => s.type === 'walk');
  if (restSessions.length > walkSessions.length * 2) {
    insights.push({
      type: 'pattern',
      title: 'Rest-Heavy Day',
      description: 'Today had more rest than activity. Consider a more active day tomorrow if energy allows.',
      momentIds: [],
    });
  }

  return insights;
}

function generateRecommendations(
  overview: OverviewSection,
  insights: BehaviorInsight[],
  profile: DogProfile | null,
  tone: SummaryTone
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const dogName = profile?.name || 'your dog';

  if (overview.sessionCounts.walk === 0) {
    recommendations.push({
      title: 'Add a Walk Tomorrow',
      description:
        tone === 'calm'
          ? `A calm, short walk could help ${dogName} decompress.`
          : `${dogName} didn't walk today! A morning walk would be great.`,
      priority: 'high',
    });
  }

  const hasStressTrigger = insights.some((i) => i.type === 'trigger');
  if (hasStressTrigger && profile?.triggers && profile.triggers.length > 0) {
    recommendations.push({
      title: 'Work on Trigger Management',
      description: `Practice "look at me" or distance management near known triggers: ${profile.triggers.slice(0, 2).join(', ')}.`,
      priority: 'high',
    });
  }

  if (overview.sessionCounts.training === 0 && profile?.goals && profile.goals.length > 0) {
    recommendations.push({
      title: 'Training Time',
      description: `Try a short training session for: ${profile.goals[0]}.`,
      priority: 'medium',
    });
  }

  if (overview.restMinutes > overview.activeMinutes * 2) {
    recommendations.push({
      title: 'Increase Activity',
      description: `${dogName} had more rest than activity today. A play session or longer walk could help.`,
      priority: 'medium',
    });
  }

  if (overview.sessionCounts.social === 0) {
    recommendations.push({
      title: 'Social Opportunity',
      description:
        tone === 'protective'
          ? `A controlled meet-up with a familiar dog could be beneficial.`
          : `Consider a playdate or park visit for some social time!`,
      priority: 'low',
    });
  }

  const hasTrainingWin = insights.some((i) => i.type === 'win' && i.title.includes('Training'));
  if (hasTrainingWin) {
    recommendations.push({
      title: 'Build on Training Success',
      description: `Great training today! Continue with short, positive sessions.`,
      priority: 'low',
    });
  }

  if (overview.topMood === 'playful') {
    recommendations.push({
      title: 'Channel That Energy',
      description: `${dogName} was playful today! Use that energy for training or enrichment activities.`,
      priority: 'low',
    });
  }

  return recommendations.slice(0, 7);
}

export function generateDailySummary(date: Date): DailySummary {
  const profile = getProfile();
  const dogName = profile?.name || 'Your Dog';
  const tone = profile ? inferToneFromTemperament(profile.temperament) : 'upbeat';

  const moments = getMomentsByDate(date);
  const sessions = getSessionsByDate(date);

  const overview = calculateOverview(moments, sessions);
  const timelineHighlights = generateTimelineHighlights(sessions, moments, tone, dogName);
  const socialMap = generateSocialMap(moments);
  const behaviorInsights = generateBehaviorInsights(moments, sessions, profile, tone);
  const recommendations = generateRecommendations(overview, behaviorInsights, profile, tone);

  return {
    date: date.toISOString().split('T')[0],
    dogName,
    tone,
    overview,
    timelineHighlights,
    socialMap,
    behaviorInsights,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

export function getToneDescription(tone: SummaryTone): string {
  switch (tone) {
    case 'upbeat':
      return 'Upbeat & Playful';
    case 'calm':
      return 'Calm & Supportive';
    case 'protective':
      return 'Focused & Aware';
  }
}

export function getToneEmoji(tone: SummaryTone): string {
  switch (tone) {
    case 'upbeat':
      return '🎉';
    case 'calm':
      return '🌿';
    case 'protective':
      return '🛡️';
  }
}
