import { Difficulty } from '../../types';
import { sequenceDifficultyConfig } from './config';

/**
 * Generates a random sequence of tile indexes.
 * A block can appear again later, but never twice consecutively (avoids 2 -> 2).
 */
export function generateSequence(totalTiles: number, length: number): number[] {
  if (totalTiles < 2 || length <= 0) return [];

  const sequence: number[] = [];
  let lastIndex = -1;

  for (let i = 0; i < length; i++) {
    let nextIndex = Math.floor(Math.random() * totalTiles);
    // Ensure no consecutive duplicates
    while (nextIndex === lastIndex && totalTiles > 1) {
      nextIndex = Math.floor(Math.random() * totalTiles);
    }
    sequence.push(nextIndex);
    lastIndex = nextIndex;
  }

  return sequence;
}

/**
 * Checks if the clicked tile index matches the expected sequence at the current step
 */
export function validateStep(
  sequence: number[],
  stepIndex: number,
  clickedTileIndex: number
): boolean {
  if (stepIndex < 0 || stepIndex >= sequence.length) return false;
  return sequence[stepIndex] === clickedTileIndex;
}

/**
 * Returns the initial sequence length for a given difficulty
 */
export function getInitialSequenceLength(difficulty: Difficulty): number {
  return sequenceDifficultyConfig[difficulty].baseLength;
}

/**
 * Calculates next sequence length based on round outcome and adaptive difficulty rules:
 * - If user failed:
 *   - If the user fails 2 rounds consecutively, reduce sequence length by one step to avoid frustration.
 *   - Respects config.minLength (never drops below the difficulty floor).
 * - If user won:
 *   - Every 2 consecutive wins, gently increase length by 1 up to config.maxLength.
 *   - In Easy mode, capped strictly at 5 flips (maxLength = 5).
 */
export function getNextAdaptiveSequenceLength(
  difficulty: Difficulty,
  currentLength: number,
  consecutiveLosses: number,
  consecutiveWins: number
): { nextLength: number; didReduce: boolean } {
  const config = sequenceDifficultyConfig[difficulty];

  // If user failed 2 rounds consecutively (e.g. at 2, 4, 6 losses)
  if (consecutiveLosses >= 2 && consecutiveLosses % 2 === 0) {
    const reduced = Math.max(config.minLength, currentLength - 1);
    return {
      nextLength: reduced,
      didReduce: reduced < currentLength,
    };
  }

  // Gentle progression on consecutive wins (e.g. at 2, 4, 6 wins)
  if (consecutiveWins > 0 && consecutiveWins % 2 === 0) {
    const increased = Math.min(config.maxLength, currentLength + 1);
    return {
      nextLength: increased,
      didReduce: false,
    };
  }

  // Otherwise keep current length, bounded by difficulty limits
  const bounded = Math.min(config.maxLength, Math.max(config.minLength, currentLength));
  return {
    nextLength: bounded,
    didReduce: false,
  };
}

/**
 * Legacy helper for initial calculation
 */
export function getSequenceLength(difficulty: Difficulty, roundNumber: number): number {
  const config = sequenceDifficultyConfig[difficulty];
  const bonus = Math.floor((roundNumber - 1) / 3);
  return Math.min(config.maxLength, config.baseLength + bonus);
}

