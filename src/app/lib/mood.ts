import { type MomentMood, MOMENT_MOODS } from './moments';

export interface MoodDisplay {
  emoji: string;
  label: string;
  color: string;
}

export const MOOD_DISPLAY: Record<MomentMood, MoodDisplay> = {
  calm: { emoji: '😌', label: 'Calm', color: 'text-blue-600 bg-blue-100' },
  excited: { emoji: '🤩', label: 'Excited', color: 'text-yellow-600 bg-yellow-100' },
  alert: { emoji: '👀', label: 'Alert', color: 'text-orange-600 bg-orange-100' },
  anxious: { emoji: '😰', label: 'Anxious', color: 'text-red-600 bg-red-100' },
  tired: { emoji: '😴', label: 'Tired', color: 'text-purple-600 bg-purple-100' },
  playful: { emoji: '🎾', label: 'Playful', color: 'text-green-600 bg-green-100' },
};

export function getMoodDisplay(mood: MomentMood): MoodDisplay {
  return MOOD_DISPLAY[mood];
}

export function getMoodOptions(): { mood: MomentMood; display: MoodDisplay }[] {
  return MOMENT_MOODS.map((mood) => ({
    mood,
    display: MOOD_DISPLAY[mood],
  }));
}
