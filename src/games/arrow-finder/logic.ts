import { Difficulty } from '../../types';
import {
  ArrowDirection,
  arrowDifficultyConfig,
  DIRECTION_CONFIG,
} from './config';

export interface PlacedArrow {
  id: string;
  direction: ArrowDirection;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
}

export interface ArrowRoundData {
  arrows: PlacedArrow[];
  winningDirection: ArrowDirection;
  winningCount: number;
  counts: Record<ArrowDirection, number>;
  totalArrows: number;
  isRecovery: boolean;
}

/**
 * Fisher-Yates shuffle helper
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates an Arrow Finder round matching the difficulty arrow count ranges,
 * balanced count patterns, and collision-free scattered placement.
 */
export function generateArrowRound(
  difficulty: Difficulty,
  isRecovery: boolean = false
): ArrowRoundData {
  const config = arrowDifficultyConfig[difficulty];

  // 1. Choose a random arrow count in the difficulty range:
  // Easy: 7–9, Medium: 15–19, Hard: 26–30
  const possibleCounts: number[] = [];
  for (let c = config.minArrows; c <= config.maxArrows; c++) {
    possibleCounts.push(c);
  }
  const totalArrows =
    possibleCounts[Math.floor(Math.random() * possibleCounts.length)];

  // 2. Select pattern for this exact arrow count
  let pattern: number[];
  if (isRecovery && config.recoveryPatterns[totalArrows]) {
    pattern = [...config.recoveryPatterns[totalArrows]];
  } else if (config.patterns[totalArrows]) {
    pattern = [...config.patterns[totalArrows]];
  } else {
    // Fallback if needed
    const allCounts = Object.keys(config.patterns).map(Number);
    const fallbackCount = allCounts[0];
    pattern = [...config.patterns[fallbackCount]];
  }

  // Ensure pattern[0] is the strictly winning direction
  pattern.sort((a, b) => b - a);

  // 3. Randomly assign the counts to ↑ ↓ ← →
  const allDirections = DIRECTION_CONFIG.map((d) => d.dir);
  const shuffledDirs = shuffleArray(allDirections);
  const winningDirection = shuffledDirs[0];
  const remainingDirs = shuffledDirs.slice(1);

  const counts: Record<ArrowDirection, number> = {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
  };

  counts[winningDirection] = pattern[0];
  counts[remainingDirs[0]] = pattern[1];
  counts[remainingDirs[1]] = pattern[2];
  counts[remainingDirs[2]] = pattern[3];

  // 4. Expand into individual arrow items
  const arrowItems: { id: string; direction: ArrowDirection }[] = [];
  let itemCounter = 0;

  allDirections.forEach((dir) => {
    const count = counts[dir];
    for (let i = 0; i < count; i++) {
      arrowItems.push({
        id: `arrow-${itemCounter++}-${dir}`,
        direction: dir,
      });
    }
  });

  // 5. Shuffle the arrows
  const shuffledArrows = shuffleArray(arrowItems);

  // 6. Place arrows randomly across the play area without overlapping
  const minX = 8;
  const maxX = 92;
  const minY = 9;
  const maxY = 91;

  // Base minimum distance in percentage coordinates scaled to total arrows
  let baseMinDistance = 16;
  if (totalArrows >= 17) {
    baseMinDistance = 10.5;
  } else if (totalArrows >= 11) {
    baseMinDistance = 13;
  }

  const placedArrows: PlacedArrow[] = [];

  shuffledArrows.forEach((item) => {
    let bestX = 50;
    let bestY = 50;
    let placed = false;
    let currentMinDist = baseMinDistance;

    // Sampling loop with distance relaxation if needed
    for (let attemptRound = 0; attemptRound < 10 && !placed; attemptRound++) {
      const candidateCount = 6;
      let bestCandidateScore = -1;

      for (let c = 0; c < candidateCount; c++) {
        const cx = minX + Math.random() * (maxX - minX);
        const cy = minY + Math.random() * (maxY - minY);

        let collides = false;
        let minNeighborDist = 9999;
        let nearestDir: ArrowDirection | null = null;

        for (const existing of placedArrows) {
          const dx = (cx - existing.xPercent) * 1.15;
          const dy = cy - existing.yPercent;
          const dist = Math.hypot(dx, dy);

          if (dist < currentMinDist) {
            collides = true;
            break;
          }

          if (dist < minNeighborDist) {
            minNeighborDist = dist;
            nearestDir = existing.direction;
          }
        }

        if (!collides) {
          let score = minNeighborDist;
          if (nearestDir === item.direction) {
            score *= 0.7; // slight penalty for placing identical direction adjacent
          }

          if (score > bestCandidateScore) {
            bestCandidateScore = score;
            bestX = cx;
            bestY = cy;
            placed = true;
          }
        }
      }

      if (!placed) {
        currentMinDist *= 0.92;
      }
    }

    // Safety fallback
    if (!placed) {
      bestX = minX + Math.random() * (maxX - minX);
      bestY = minY + Math.random() * (maxY - minY);
    }

    placedArrows.push({
      id: item.id,
      direction: item.direction,
      xPercent: Number(bestX.toFixed(2)),
      yPercent: Number(bestY.toFixed(2)),
    });
  });

  return {
    arrows: placedArrows,
    winningDirection,
    winningCount: counts[winningDirection],
    counts,
    totalArrows,
    isRecovery,
  };
}
