import { Difficulty } from '../../types';

export type ArrowDirection = 'up' | 'down' | 'left' | 'right';

export interface ArrowDifficultyConfig {
  minArrows: number;
  maxArrows: number;
  patterns: Record<number, number[]>;
  recoveryPatterns: Record<number, number[]>;
  timerSeconds: number;
  maxPoints: number;
  label: string;
  sublabel: string;
  description: string;
}

export const arrowDifficultyConfig: Record<Difficulty, ArrowDifficultyConfig> = {
  easy: {
    minArrows: 7,
    maxArrows: 9,
    patterns: {
      7: [3, 2, 1, 1],
      8: [3, 2, 2, 1],
      9: [4, 2, 2, 1],
    },
    recoveryPatterns: {
      7: [4, 1, 1, 1],
      8: [4, 2, 1, 1],
      9: [5, 2, 1, 1],
    },
    timerSeconds: 60,
    maxPoints: 100,
    label: 'Easy',
    sublabel: '7–9 arrows',
    description: '7 to 9 scattered arrows with a 60s timer',
  },
  medium: {
    minArrows: 11,
    maxArrows: 15,
    patterns: {
      11: [4, 3, 2, 2],
      12: [4, 3, 3, 2],
      13: [4, 3, 3, 3],
      14: [5, 3, 3, 3],
      15: [5, 4, 3, 3],
    },
    recoveryPatterns: {
      11: [5, 2, 2, 2],
      12: [5, 3, 2, 2],
      13: [5, 3, 3, 2],
      14: [6, 3, 3, 2],
      15: [6, 4, 3, 2],
    },
    timerSeconds: 90,
    maxPoints: 150,
    label: 'Medium',
    sublabel: '11–15 arrows',
    description: '11 to 15 scattered arrows with a 90s timer',
  },
  hard: {
    minArrows: 17,
    maxArrows: 21,
    patterns: {
      17: [5, 4, 4, 4],
      18: [6, 5, 4, 3],
      19: [6, 5, 4, 4],
      20: [6, 5, 5, 4],
      21: [6, 5, 5, 5],
    },
    recoveryPatterns: {
      17: [6, 4, 4, 3],
      18: [7, 4, 4, 3],
      19: [7, 5, 4, 3],
      20: [7, 5, 4, 4],
      21: [7, 5, 5, 4],
    },
    timerSeconds: 120,
    maxPoints: 200,
    label: 'Hard',
    sublabel: '17–21 arrows',
    description: '17 to 21 scattered arrows with a 120s timer',
  },
};

export const DIRECTION_CONFIG: {
  dir: ArrowDirection;
  symbol: string;
  label: string;
}[] = [
  { dir: 'up', symbol: '↑', label: 'Up' },
  { dir: 'down', symbol: '↓', label: 'Down' },
  { dir: 'left', symbol: '←', label: 'Left' },
  { dir: 'right', symbol: '→', label: 'Right' },
];

export const MAX_POINTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 100,
  medium: 150,
  hard: 200,
};

/**
 * Scoring percentage tiers based on elapsed seconds relative to difficulty timer:
 * - First 1/6 (e.g. 0-20s on 120s, 0-15s on 90s, 0-10s on 60s)  -> 100%
 * - Next 1/6  (e.g. 21-40s on 120s, 16-30s on 90s, 11-20s on 60s) -> 80%
 * - Next 1/6  (e.g. 41-60s on 120s, 31-45s on 90s, 21-30s on 60s) -> 60%
 * - Up to 75% (e.g. 61-90s on 120s, 46-68s on 90s, 31-45s on 60s) -> 40%
 * - Up to 100% (e.g. 91-120s on 120s, 69-90s on 90s, 46-60s on 60s)-> 20%
 * - after timer expires -> 0 points
 */
export function getScorePercentage(
  difficulty: Difficulty,
  elapsedSeconds: number
): number {
  const timer = arrowDifficultyConfig[difficulty].timerSeconds;
  const ratio = elapsedSeconds / timer;

  if (ratio <= 1 / 6) return 1.0;
  if (ratio <= 2 / 6) return 0.8;
  if (ratio <= 3 / 6) return 0.6;
  if (ratio <= 0.75) return 0.4;
  if (ratio <= 1.0) return 0.2;
  return 0;
}

export function calculatePoints(
  difficulty: Difficulty,
  elapsedSeconds: number
): number {
  const maxPoints = MAX_POINTS_BY_DIFFICULTY[difficulty];
  const percentage = getScorePercentage(difficulty, elapsedSeconds);
  return Math.round(maxPoints * percentage);
}

export function getDifficultyTierMarkers(difficulty: Difficulty): {
  label: string;
  pct: number;
}[] {
  const timer = arrowDifficultyConfig[difficulty].timerSeconds;
  const t1 = Math.round(timer * (1 / 6));
  const t2 = Math.round(timer * (2 / 6));
  const t3 = Math.round(timer * (3 / 6));
  const t4 = Math.round(timer * 0.75);
  const t5 = timer;

  return [
    { label: `${t1}s (100%)`, pct: 100 },
    { label: `${t2}s (80%)`, pct: 80 },
    { label: `${t3}s (60%)`, pct: 60 },
    { label: `${t4}s (40%)`, pct: 40 },
    { label: `${t5}s (20%)`, pct: 20 },
  ];
}
