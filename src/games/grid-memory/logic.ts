import { Difficulty, RoundResult } from '../../types';

/**
 * Modern Fisher-Yates shuffle algorithm
 */
export function shuffleIndexes(totalCells: number): number[] {
  const array = Array.from({ length: totalCells }, (_, i) => i);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generates non-duplicate random tile indexes to highlight
 */
export function generateHighlightedTiles(
  size: number,
  minHighlights: number,
  maxHighlights: number
): number[] {
  const totalCells = size * size;
  // Ensure we do not pick 0 or all cells
  const boundedMin = Math.max(1, minHighlights);
  const boundedMax = Math.min(totalCells - 1, maxHighlights);
  
  const count = Math.floor(Math.random() * (boundedMax - boundedMin + 1)) + boundedMin;
  const shuffled = shuffleIndexes(totalCells);
  const selected = shuffled.slice(0, count).sort((a, b) => a - b);
  
  return selected;
}

/**
 * Checks if the round was solved with 100% precision
 */
export function isPerfectRound(correct: number[], selected: number[]): boolean {
  if (correct.length !== selected.length) return false;
  const correctSet = new Set(correct);
  return selected.every((index) => correctSet.has(index));
}

/**
 * Evaluates player choices against target tiles with kind, encouraging feedback
 */
export function calculateResult(
  correctIndexes: number[],
  selectedIndexes: number[]
): RoundResult {
  const correctSet = new Set(correctIndexes);
  const selectedSet = new Set(selectedIndexes);

  let correctCount = 0;
  let extraCount = 0;

  selectedIndexes.forEach((idx) => {
    if (correctSet.has(idx)) {
      correctCount += 1;
    } else {
      extraCount += 1;
    }
  });

  const missedCount = correctIndexes.length - correctCount;
  const totalCorrectTarget = correctIndexes.length;

  // Accuracy calculation based on Jaccard/F1-style score or simple correct / total
  // Accuracy = correctly identified divided by (total correct targets + extra picks), clamped between 0 and 100
  const denominator = Math.max(1, totalCorrectTarget + extraCount);
  const accuracy = Math.round((correctCount / denominator) * 100);

  const perfect = isPerfectRound(correctIndexes, selectedIndexes);
  const messages = getEncouragementMessage(accuracy, perfect, correctCount, totalCorrectTarget);

  return {
    correctCount,
    totalCorrectTarget,
    missedCount,
    extraCount,
    accuracy,
    isPerfect: perfect,
    message: messages.title,
    subMessage: messages.subtitle,
  };
}

/**
 * Provides gentle, warm, and positive feedback messages
 */
export function getEncouragementMessage(
  accuracy: number,
  isPerfect: boolean,
  correctCount: number,
  totalCount: number
): { title: string; subtitle: string } {
  if (isPerfect) {
    return {
      title: 'Wonderful!',
      subtitle: `You remembered every single wooden tile (${correctCount} of ${totalCount})!`,
    };
  }

  if (correctCount === totalCount && accuracy < 100) {
    return {
      title: 'Great Eye!',
      subtitle: `You found all ${totalCount} target tiles! With just a couple extra touches.`,
    };
  }

  if (accuracy >= 70) {
    return {
      title: 'Almost there!',
      subtitle: `You remembered ${correctCount} of ${totalCount} tiles. Outstanding recall!`,
    };
  }

  if (accuracy >= 40) {
    return {
      title: 'Nice try!',
      subtitle: `You spotted ${correctCount} of ${totalCount} tiles. Every round keeps the mind nimble.`,
    };
  }

  return {
    title: 'Good Practice!',
    subtitle: `Every round stretches your memory muscles. Let's try another one at your own pace.`,
  };
}

/**
 * Returns the next difficulty step or null if already at max
 */
export function getNextDifficulty(current: Difficulty): Difficulty | null {
  if (current === 'easy') return 'medium';
  if (current === 'medium') return 'hard';
  return null;
}
