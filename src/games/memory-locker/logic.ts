import { Difficulty } from '../../types';
import { lockerDifficultyConfig } from './config';

/**
 * Generate random digits from 0–9.
 * Avoids identical consecutive digits like (5, 5).
 * Repeated digits later are allowed, e.g. (5, 2, 5).
 */
export function generateLockerCode(length: number): number[] {
  const code: number[] = [];
  for (let i = 0; i < length; i++) {
    let digit: number;
    do {
      digit = Math.floor(Math.random() * 10);
    } while (i > 0 && digit === code[i - 1]);
    code.push(digit);
  }
  return code;
}

/**
 * Computes the target password length following gradual progression
 * and adaptive easing on consecutive losses.
 */
export function calculateLockerLength(
  difficulty: Difficulty,
  roundNumber: number, // 0-indexed count of rounds played in this session
  consecutiveLosses: number
): number {
  const config = lockerDifficultyConfig[difficulty];
  const { progression, minDigits, maxDigits } = config;

  // Gradual progression within difficulty
  // If roundNumber exceeds progression length, maintain the highest tier
  let baseLength: number;
  if (roundNumber < progression.length) {
    baseLength = progression[roundNumber];
  } else {
    baseLength = progression[progression.length - 1];
  }

  // Adaptive easing: after 2 consecutive losses, reduce current length by 1
  if (consecutiveLosses >= 2) {
    baseLength = Math.max(minDigits, baseLength - 1);
  }

  return Math.min(maxDigits, Math.max(minDigits, baseLength));
}
