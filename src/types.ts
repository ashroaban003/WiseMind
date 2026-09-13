/**
 * Core type definitions for wiseMind
 */

export type GameCategory = 'Memory' | 'Attention' | 'Logic' | 'Visual';

export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  category: GameCategory;
  available: boolean;
  path: string;
  iconName?: string;
  estimatedMinutes?: number;
  highlightText?: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GamePhase = 'setup' | 'preview' | 'playing' | 'result';

export interface DifficultyConfig {
  size: number;
  minHighlights: number;
  maxHighlights: number;
  previewTime: number; // in milliseconds
  label: string;
  description: string;
}

export interface RoundResult {
  correctCount: number;
  totalCorrectTarget: number;
  missedCount: number;
  extraCount: number;
  accuracy: number;
  isPerfect: boolean;
  message: string;
  subMessage: string;
}

export interface SessionStats {
  gamesPlayed: number;
  consecutiveWins: number;
  longestStreak: number;
  lastDifficulty: Difficulty;
}
