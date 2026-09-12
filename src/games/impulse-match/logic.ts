import { Difficulty } from '../../types';
import {
  NostalgicObject,
  NOSTALGIC_OBJECTS,
  impulseDifficultyConfig,
  PROMPTS_PER_ROUND,
} from './config';

export type Side = 0 | 1; // 0 = Left, 1 = Right

export interface PromptItem {
  promptIndex: number;
  object: NostalgicObject;
  targetSide: Side; // 0 for Left, 1 for Right
}

export interface ImpulseRoundData {
  leftObjects: NostalgicObject[];
  rightObjects: NostalgicObject[];
  prompts: PromptItem[];
  sideSequence: Side[];
}

export interface PromptResult {
  promptIndex: number;
  object: NostalgicObject;
  targetSide: Side;
  userChoice: Side | null; // null if missed/timeout
  isCorrect: boolean;
  isMissed: boolean;
  responseTimeMs: number;
  pointsEarned: number;
}

export interface ImpulseRoundSummary {
  correctCount: number;
  wrongCount: number;
  missedCount: number;
  totalPrompts: number;
  accuracy: number;
  pointsEarned: number;
  isPerfect: boolean;
}

/**
 * Generate a 12-item side sequence (0 = Left, 1 = Right)
 * Rules:
 * - Exactly 12 values
 * - Randomized every round
 * - Keep Left/Right reasonably balanced (e.g. 6 and 6, or 5 and 7)
 * - Never allow more than 3 identical side values consecutively
 */
export function generateSideSequence(): Side[] {
  const maxAttempts = 200;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate balanced pool: 6 Lefts and 6 Rights (or 5 & 7)
    // Most balanced is 6 and 6, occasionally 5 & 7 for slight variation
    const leftCount = Math.random() < 0.25 ? (Math.random() < 0.5 ? 5 : 7) : 6;
    const rightCount = PROMPTS_PER_ROUND - leftCount;

    const pool: Side[] = [
      ...Array(leftCount).fill(0 as Side),
      ...Array(rightCount).fill(1 as Side),
    ];

    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Validate: Never more than 3 identical values consecutively
    let valid = true;
    let consecutiveCount = 1;
    for (let i = 1; i < pool.length; i++) {
      if (pool[i] === pool[i - 1]) {
        consecutiveCount++;
        if (consecutiveCount > 3) {
          valid = false;
          break;
        }
      } else {
        consecutiveCount = 1;
      }
    }

    if (valid) {
      return pool;
    }
  }

  // Deterministic fallback satisfying all constraints
  return [0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0];
}

/**
 * Select distinct objects for Left and Right based on difficulty.
 * Avoids picking visually similar objects in the same round (conflict groups).
 */
export function selectRoundObjects(difficulty: Difficulty): {
  leftObjects: NostalgicObject[];
  rightObjects: NostalgicObject[];
} {
  const config = impulseDifficultyConfig[difficulty];
  const totalNeeded = config.objectsPerSide * 2;

  // Shuffle master object list
  const shuffled = [...NOSTALGIC_OBJECTS].sort(() => Math.random() - 0.5);

  const selected: NostalgicObject[] = [];
  const usedConflictGroups = new Set<string>();

  for (const obj of shuffled) {
    if (selected.length >= totalNeeded) break;

    if (obj.conflictGroup) {
      if (usedConflictGroups.has(obj.conflictGroup)) {
        continue; // Skip conflicting item
      }
      usedConflictGroups.add(obj.conflictGroup);
    }

    selected.push(obj);
  }

  // Fallback in rare case conflict rules left us with fewer than needed
  if (selected.length < totalNeeded) {
    for (const obj of shuffled) {
      if (selected.length >= totalNeeded) break;
      if (!selected.some((s) => s.id === obj.id)) {
        selected.push(obj);
      }
    }
  }

  // Split between Left and Right
  const leftObjects = selected.slice(0, config.objectsPerSide);
  const rightObjects = selected.slice(config.objectsPerSide, totalNeeded);

  return { leftObjects, rightObjects };
}

/**
 * Generate full 12-prompt sequence before gameplay starts.
 * Ensures:
 * - for each side in sideSequence, pick an object assigned to that side
 * - the exact same object does not appear more than 3 times consecutively
 */
export function generateImpulseRound(difficulty: Difficulty): ImpulseRoundData {
  const sideSequence = generateSideSequence();
  const { leftObjects, rightObjects } = selectRoundObjects(difficulty);

  const prompts: PromptItem[] = [];

  for (let i = 0; i < sideSequence.length; i++) {
    const targetSide = sideSequence[i];
    const availableObjects = targetSide === 0 ? leftObjects : rightObjects;

    let chosenObject: NostalgicObject;

    if (availableObjects.length === 1) {
      chosenObject = availableObjects[0];
    } else {
      // Pick randomly, but avoid repeating same object > 3 times in a row
      const candidateList = [...availableObjects].sort(() => Math.random() - 0.5);

      // Check last 3 chosen objects
      const recentSameCount = (candidate: NostalgicObject) => {
        let count = 0;
        for (let k = prompts.length - 1; k >= 0; k--) {
          if (prompts[k].object.id === candidate.id) {
            count++;
          } else {
            break;
          }
        }
        return count;
      };

      // Filter out any candidate that already appeared 3 times in a row
      const validCandidates = candidateList.filter((c) => recentSameCount(c) < 3);

      if (validCandidates.length > 0) {
        chosenObject = validCandidates[0];
      } else {
        chosenObject = candidateList[0];
      }
    }

    prompts.push({
      promptIndex: i,
      object: chosenObject,
      targetSide,
    });
  }

  return {
    leftObjects,
    rightObjects,
    prompts,
    sideSequence,
  };
}

/**
 * Preload all object images required for a round
 * Decodes into GPU/browser cache before gameplay starts to eliminate switching delay
 */
export function preloadRoundImages(objects: NostalgicObject[]): Promise<void> {
  if (typeof window === 'undefined' || !objects.length) {
    return Promise.resolve();
  }

  const promises = objects.map((obj) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.src = obj.image;

      if (typeof img.decode === 'function') {
        img
          .decode()
          .then(() => resolve())
          .catch(() => {
            // Fallback if decode rejects
            if (img.complete) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          });
      } else if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    });
  });

  return Promise.all(promises).then(() => undefined);
}

/**
 * Calculate round results and totals
 */
export function calculateImpulseSummary(
  results: PromptResult[],
  difficulty: Difficulty
): ImpulseRoundSummary {
  const totalPrompts = PROMPTS_PER_ROUND;
  let correctCount = 0;
  let wrongCount = 0;
  let missedCount = 0;
  let totalPoints = 0;

  for (const r of results) {
    if (r.isCorrect) {
      correctCount++;
      totalPoints += r.pointsEarned;
    } else if (r.isMissed) {
      missedCount++;
    } else {
      wrongCount++;
    }
  }

  const isPerfect = correctCount === totalPrompts;
  if (isPerfect) {
    // Perfect round bonus
    totalPoints += 50;
  }

  const accuracy = Math.round((correctCount / totalPrompts) * 100);

  return {
    correctCount,
    wrongCount,
    missedCount,
    totalPrompts,
    accuracy,
    pointsEarned: totalPoints,
    isPerfect,
  };
}
