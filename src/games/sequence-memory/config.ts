import { Difficulty } from '../../types';

export interface SequenceDifficultyConfig {
  gridSize: number; // 3 for 3x3, 4 for 4x4
  baseLength: number; // default sequence length
  minLength: number; // lowest adaptive floor
  maxLength: number; // highest sequence cap
  playbackSpeedMs: number; // how long block stays light (ms)
  gapMs: number; // gap between blocks (ms)
  label: string;
  description: string;
}

export const sequenceDifficultyConfig: Record<Difficulty, SequenceDifficultyConfig> = {
  easy: {
    gridSize: 3,
    baseLength: 3,
    minLength: 2,
    maxLength: 5, // Strict cap at 5 flips for Easy mode even with long winning streaks
    playbackSpeedMs: 750,
    gapMs: 300,
    label: 'Easy',
    description: '3×3 grid with 2 to 5 blocks to follow',
  },
  medium: {
    gridSize: 3,
    baseLength: 5,
    minLength: 5,
    maxLength: 8,
    playbackSpeedMs: 650,
    gapMs: 250,
    label: 'Medium',
    description: '3×3 grid with 5 to 8 blocks to follow',
  },
  hard: {
    gridSize: 4,
    baseLength: 7,
    minLength: 4,
    maxLength: 9,
    playbackSpeedMs: 580,
    gapMs: 220,
    label: 'Hard',
    description: '4×4 grid with 4 to 9 blocks to follow',
  },
};

