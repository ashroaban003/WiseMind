import { Difficulty } from '../../types';

export interface LockerDifficultyConfig {
  minDigits: number;
  maxDigits: number;
  progression: number[]; // e.g. [3, 3, 4, 4]
  maxPoints: number;
  label: string;
  sublabel: string;
  description: string;
}

export const lockerDifficultyConfig: Record<Difficulty, LockerDifficultyConfig> = {
  easy: {
    minDigits: 3,
    maxDigits: 4,
    progression: [3, 3, 4, 4],
    maxPoints: 100,
    label: 'Easy',
    sublabel: '3–4 digits',
    description: 'Gentle codes of 3 to 4 numbers, shown one by one',
  },
  medium: {
    minDigits: 5,
    maxDigits: 6,
    progression: [5, 5, 6, 6],
    maxPoints: 150,
    label: 'Medium',
    sublabel: '5–6 digits',
    description: 'Steady combinations of 5 to 6 numbers',
  },
  hard: {
    minDigits: 7,
    maxDigits: 9,
    progression: [7, 7, 8, 8, 9],
    maxPoints: 200,
    label: 'Hard',
    sublabel: '7–9 digits',
    description: 'Longer safe combinations of 7 to 9 numbers for keen focus',
  },
};

export const DIGIT_DISPLAY_DURATION_MS = 1000;
export const DIGIT_GAP_DURATION_MS = 300;
