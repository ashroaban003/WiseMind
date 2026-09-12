/**
 * Shared Score & Daily/All-Time Persistence Manager
 * Ensures separation of daily resets vs. all-time records across all games.
 */

export interface GameAllTimeStats {
  highestScore: number;
  bestStreak: number;
}

export interface GameDailyStats {
  gamesPlayedToday: number;
  bestPerfectStreakToday: number;
  lastActivityDate: string;
}

/**
 * Shared interaction timing for tile clicks & reveals
 * Ensures player clearly sees and registers what they pressed before continuation
 */
export const TILE_SELECTION_HOLD_MS = 500;

/**
 * Moderate streak-loss penalty: pointsPerStreak * previousStreak
 * Keeps total score >= 0
 */
export const POINTS_PER_LOST_STREAK = 5;

export function calculateStreakPenalty(previousStreak: number): number {
  if (!Number.isFinite(previousStreak) || previousStreak <= 0) return 0;
  return Math.round(POINTS_PER_LOST_STREAK * previousStreak);
}

/**
 * Safely format seconds into m:ss, preventing any NaN:NaN output
 */
export function formatSafeTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Helper to get local date string YYYY-MM-DD
 */
export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Load all-time stats that NEVER reset daily
 */
export function loadAllTimeStats(gameId: string): GameAllTimeStats {
  const key = `daily_mind_${gameId}_alltime`;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        highestScore: Math.max(0, Number(parsed.highestScore) || 0),
        bestStreak: Math.max(0, Number(parsed.bestStreak) || 0),
      };
    }

    // Fallback migration from older composite keys
    const legacyKey = `daily_mind_${gameId}_stats`;
    const legacySaved = localStorage.getItem(legacyKey);
    if (legacySaved) {
      const parsed = JSON.parse(legacySaved);
      const score = Math.max(0, Number(parsed.totalScore) || 0);
      const highest = Math.max(score, Number(parsed.highestScore) || 0);
      const streak = Math.max(0, Number(parsed.longestStreak || parsed.bestStreak) || 0);
      return {
        highestScore: highest,
        bestStreak: streak,
      };
    }
  } catch {
    // fallback
  }

  return {
    highestScore: 0,
    bestStreak: 0,
  };
}

/**
 * Save all-time stats that survive restarts
 */
export function saveAllTimeStats(gameId: string, stats: GameAllTimeStats): void {
  const key = `daily_mind_${gameId}_alltime`;
  try {
    localStorage.setItem(key, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

/**
 * Load daily stats that automatically reset when calendar date changes
 */
export function loadDailyStats(gameId: string): GameDailyStats {
  const key = `daily_mind_${gameId}_daily`;
  const today = getTodayDateKey();

  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.lastActivityDate === today) {
        return {
          gamesPlayedToday: Math.max(0, Number(parsed.gamesPlayedToday) || 0),
          bestPerfectStreakToday: Math.max(0, Number(parsed.bestPerfectStreakToday) || 0),
          lastActivityDate: today,
        };
      }
    }

    // Fallback check legacy key
    const legacyKey = `daily_mind_${gameId}_stats`;
    const legacySaved = localStorage.getItem(legacyKey);
    if (legacySaved) {
      const parsed = JSON.parse(legacySaved);
      if (parsed.lastActivityDate === today) {
        return {
          gamesPlayedToday: Math.max(0, Number(parsed.gamesPlayedToday || parsed.gamesPlayed) || 0),
          bestPerfectStreakToday: Math.max(
            0,
            Number(parsed.bestPerfectStreakToday || parsed.longestStreak) || 0
          ),
          lastActivityDate: today,
        };
      }
    }
  } catch {
    // fallback
  }

  return {
    gamesPlayedToday: 0,
    bestPerfectStreakToday: 0,
    lastActivityDate: today,
  };
}

/**
 * Save daily stats
 */
export function saveDailyStats(gameId: string, stats: GameDailyStats): void {
  const key = `daily_mind_${gameId}_daily`;
  try {
    localStorage.setItem(key, JSON.stringify(stats));
  } catch {
    // ignore
  }
}
