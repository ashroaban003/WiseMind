import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  SkipForward,
  CheckCircle2,
  Clock,
  Coffee,
  Flame,
} from 'lucide-react';
import { Difficulty } from '../../types';
import {
  ArrowDirection,
  arrowDifficultyConfig,
  DIRECTION_CONFIG,
  calculatePoints,
} from './config';
import { generateArrowRound, ArrowRoundData } from './logic';
import { ArrowField } from './ArrowField';
import { Button } from '../../components/common/Button';
import { LevelUpModal } from '../../components/games/LevelUpModal';
import { getNextDifficulty } from '../grid-memory/logic';
import {
  playSuccessChime,
  playGentleMissChime,
  playTileChime,
  isSoundEnabled,
  setSoundEnabled,
} from '../sequence-memory/audio';
import {
  GameAllTimeStats,
  GameDailyStats,
  loadAllTimeStats,
  saveAllTimeStats,
  loadDailyStats,
  saveDailyStats,
  calculateStreakPenalty,
  formatSafeTime,
  getTodayDateKey,
} from '../../utils/gameScoreManager';

interface ArrowFinderGameProps {
  onBack: () => void;
}

const GAME_ID = 'arrow_finder';

export const ArrowFinderGame: React.FC<ArrowFinderGameProps> = ({ onBack }) => {
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [allTimeStats, setAllTimeStats] = useState<GameAllTimeStats>(() =>
    loadAllTimeStats(GAME_ID)
  );
  const [dailyStats, setDailyStats] = useState<GameDailyStats>(() =>
    loadDailyStats(GAME_ID)
  );
  const [consecutiveWins, setConsecutiveWins] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());

  // Personal Best Score Tracking for current continuous run/session
  const initialHighScoreRef = useRef<number>(allTimeStats.highestScore);
  const recordNotificationShownRef = useRef<boolean>(false);
  const [personalBestToast, setPersonalBestToast] = useState<boolean>(false);
  const personalBestTimerRef = useRef<number | null>(null);

  // Adaptive difficulty tracking
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);

  // Round state
  const [roundData, setRoundData] = useState<ArrowRoundData>(() =>
    generateArrowRound('easy', false)
  );
  const [roundKey, setRoundKey] = useState<number>(1);
  const [phase, setPhase] = useState<'playing' | 'correct'>('playing');
  const [lastFeedbackMessage, setLastFeedbackMessage] = useState<string | null>(null);

  // Timing & Score state
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);

  // Level Up Modal (6 consecutive wins)
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState<boolean>(false);
  const [hasPromptedLevelUp, setHasPromptedLevelUp] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Save all-time stats to localStorage
  useEffect(() => {
    saveAllTimeStats(GAME_ID, allTimeStats);
  }, [allTimeStats]);

  // Save daily stats to localStorage
  useEffect(() => {
    saveDailyStats(GAME_ID, dailyStats);
  }, [dailyStats]);

  // Clean up personal best toast timer on unmount
  useEffect(() => {
    return () => {
      if (personalBestTimerRef.current) clearTimeout(personalBestTimerRef.current);
    };
  }, []);

  // Scoring timer loop
  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const now = Date.now();
    setElapsedSeconds(0);

    timerRef.current = window.setInterval(() => {
      const diff = (Date.now() - now) / 1000;
      setElapsedSeconds(diff);
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, roundKey]);

  // Start new round
  const startNewRound = useCallback(
    (targetDifficulty = difficulty, forceRecovery?: boolean) => {
      const isRecovery =
        forceRecovery !== undefined ? forceRecovery : consecutiveLosses >= 2;
      const nextData = generateArrowRound(targetDifficulty, isRecovery);
      setRoundData(nextData);
      setRoundKey((k) => k + 1);
      setPhase('playing');
      setElapsedSeconds(0);
      setEarnedPoints(0);
    },
    [difficulty, consecutiveLosses]
  );

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  // Switch difficulty
  const handleChangeDifficulty = (newDiff: Difficulty) => {
    if (newDiff === difficulty) return;
    setDifficulty(newDiff);
    setRoundNumber(1);
    setConsecutiveLosses(0);
    setLastFeedbackMessage(null);
    startNewRound(newDiff, false);
  };

  // Handle Answer Selection
  const handleSelectDirection = (selectedDir: ArrowDirection) => {
    if (phase !== 'playing') return;

    // Play chime on selection
    const dirChimeMap: Record<ArrowDirection, number> = { up: 0, right: 1, down: 2, left: 3 };
    playTileChime(dirChimeMap[selectedDir]);

    if (selectedDir === roundData.winningDirection) {
      // CORRECT ANSWER
      playSuccessChime();

      const points = calculatePoints(difficulty, elapsedSeconds);
      setEarnedPoints(points);
      setPhase('correct');
      setConsecutiveLosses(0);
      setLastFeedbackMessage(null);

      const nextScore = sessionScore + points;
      setSessionScore(nextScore);

      const nextWins = consecutiveWins + 1;
      setConsecutiveWins(nextWins);

      // Update All-time stats & check personal best
      setAllTimeStats((prev) => {
        const nextHigh = Math.max(prev.highestScore, nextScore);
        const nextStreak = Math.max(prev.bestStreak, nextWins);

        if (
          !recordNotificationShownRef.current &&
          nextScore > initialHighScoreRef.current &&
          (initialHighScoreRef.current > 0 || nextScore > 0)
        ) {
          recordNotificationShownRef.current = true;
          setPersonalBestToast(true);
          if (personalBestTimerRef.current) clearTimeout(personalBestTimerRef.current);
          personalBestTimerRef.current = window.setTimeout(() => {
            setPersonalBestToast(false);
          }, 2500);
        }

        return {
          highestScore: nextHigh,
          bestStreak: nextStreak,
        };
      });

      // Update Daily stats
      setDailyStats((prev) => {
        const today = getTodayDateKey();
        const isSameDay = prev.lastActivityDate === today;
        const prevPlayedToday = isSameDay ? prev.gamesPlayedToday : 0;
        const prevStreakToday = isSameDay ? prev.bestPerfectStreakToday : 0;

        return {
          gamesPlayedToday: prevPlayedToday + 1,
          bestPerfectStreakToday: Math.max(prevStreakToday, nextWins),
          lastActivityDate: today,
        };
      });

      if (nextWins === 6 && !hasPromptedLevelUp && difficulty !== 'hard') {
        setTimeout(() => {
          setIsLevelUpModalOpen(true);
          setHasPromptedLevelUp(true);
        }, 600);
      }
    } else {
      // INCORRECT ANSWER
      playGentleMissChime();

      // Streak-loss penalty
      const lostStreak = consecutiveWins;
      const penalty = calculateStreakPenalty(lostStreak);
      setConsecutiveWins(0);

      if (penalty > 0) {
        setSessionScore((prev) => Math.max(0, prev - penalty));
      }

      const nextLosses = consecutiveLosses + 1;
      setConsecutiveLosses(nextLosses);

      setDailyStats((prev) => {
        const today = getTodayDateKey();
        const isSameDay = prev.lastActivityDate === today;
        const prevPlayedToday = isSameDay ? prev.gamesPlayedToday : 0;
        const prevStreakToday = isSameDay ? prev.bestPerfectStreakToday : 0;

        return {
          gamesPlayedToday: prevPlayedToday + 1,
          bestPerfectStreakToday: prevStreakToday,
          lastActivityDate: today,
        };
      });

      const chosenConfig = DIRECTION_CONFIG.find((d) => d.dir === selectedDir);
      const penaltyNotice = penalty > 0 ? ` Streak reset (-${penalty} pts).` : '';
      setLastFeedbackMessage(
        `Not quite ${chosenConfig?.label} this time.${penaltyNotice} Take another breath and try this new group!`
      );
      setTimeout(() => setLastFeedbackMessage(null), 3000);

      startNewRound(difficulty, nextLosses >= 2);
    }
  };

  // Keyboard controls: ArrowUp, ArrowDown, ArrowLeft, ArrowRight
  const handleSelectDirectionRef = useRef(handleSelectDirection);
  useEffect(() => {
    handleSelectDirectionRef.current = handleSelectDirection;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'playing') return;

      let dir: ArrowDirection | null = null;
      if (e.key === 'ArrowUp') {
        dir = 'up';
      } else if (e.key === 'ArrowDown') {
        dir = 'down';
      } else if (e.key === 'ArrowLeft') {
        dir = 'left';
      } else if (e.key === 'ArrowRight') {
        dir = 'right';
      }

      if (dir) {
        e.preventDefault();
        handleSelectDirectionRef.current(dir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  // Skip Round
  const handleSkip = () => {
    if (phase !== 'playing') return;

    // Streak-loss penalty
    const lostStreak = consecutiveWins;
    const penalty = calculateStreakPenalty(lostStreak);
    setConsecutiveWins(0);

    if (penalty > 0) {
      setSessionScore((prev) => Math.max(0, prev - penalty));
    }

    const nextLosses = consecutiveLosses + 1;
    setConsecutiveLosses(nextLosses);

    setDailyStats((prev) => {
      const today = getTodayDateKey();
      const isSameDay = prev.lastActivityDate === today;
      const prevPlayedToday = isSameDay ? prev.gamesPlayedToday : 0;
      const prevStreakToday = isSameDay ? prev.bestPerfectStreakToday : 0;

      return {
        gamesPlayedToday: prevPlayedToday + 1,
        bestPerfectStreakToday: prevStreakToday,
        lastActivityDate: today,
      };
    });

    const penaltyNotice = penalty > 0 ? ` (-${penalty} pts)` : '';
    setLastFeedbackMessage(`Round skipped${penaltyNotice}. Here is a fresh group!`);
    setTimeout(() => setLastFeedbackMessage(null), 2500);

    startNewRound(difficulty, nextLosses >= 2);
  };

  const handleNextRound = () => {
    setRoundNumber((r) => r + 1);
    setLastFeedbackMessage(null);
    startNewRound();
  };

  const handleAcceptLevelUp = () => {
    const nextDiff = getNextDifficulty(difficulty);
    if (nextDiff) {
      handleChangeDifficulty(nextDiff);
    }
    setIsLevelUpModalOpen(false);
  };

  // Timer Calculations: Safely using diffConfig.timerSeconds and formatSafeTime
  const diffConfig = arrowDifficultyConfig[difficulty] || arrowDifficultyConfig.easy;
  const configuredDuration = diffConfig.timerSeconds || 60;
  const safeElapsed = Number.isFinite(elapsedSeconds) && elapsedSeconds >= 0 ? elapsedSeconds : 0;
  const timeRemaining = Math.max(0, configuredDuration - safeElapsed);
  const timePercent = Math.max(0, Math.min(100, (timeRemaining / configuredDuration) * 100));
  const isTimeExpired = timeRemaining <= 0;
  const currentTierPoints = calculatePoints(difficulty, safeElapsed);

  const winningDirConfig = DIRECTION_CONFIG.find(
    (d) => d.dir === roundData.winningDirection
  );

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 sm:py-4 flex flex-col justify-between min-h-[calc(100vh-4.5rem)]">
      {/* 1. COMPACT HEADER */}
      <div className="space-y-2">
        {/* Top compact row: ← Games | Score 120 | Round 3 | Easy | 🔥 1 | [Volume] */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 py-1.5 border-b border-[#E5D7BF]">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs sm:text-base font-semibold text-[#5E3F27] hover:bg-[#EFE4D0] border border-[#DECDB3] transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Games</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
            <div className="relative">
              <span
                className={`text-xs sm:text-sm font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all duration-300 ${
                  personalBestToast
                    ? 'bg-[#FFECC7] text-[#914614] border-2 border-[#ECA742] shadow-sm ring-2 ring-[#F5C7A2]/60 animate-pulse'
                    : 'bg-[#FAF3E6] text-[#352110] border border-[#E2D2BC]'
                }`}
                title="Current session score"
              >
                Score {sessionScore}
              </span>

              {personalBestToast && (
                <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 sm:-bottom-7 z-20 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#FFF3D6] border border-[#EAB360] text-[#7A400C] text-[11px] sm:text-xs font-bold shadow-md animate-in fade-in zoom-in-95 duration-200 flex items-center gap-1 pointer-events-none">
                  <Sparkles className="w-3 h-3 text-[#D9822B] shrink-0" />
                  <span>New Personal Best! 🎉</span>
                </span>
              )}
            </div>

            <span className="text-xs sm:text-sm font-bold text-[#352110] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#FAF3E6] border border-[#E2D2BC]">
              Round {roundNumber}
            </span>

            <span className="text-[11px] sm:text-xs font-semibold text-[#6B4E36] bg-[#EFE3CE] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-[#DECDB3] capitalize">
              {difficulty}
            </span>

            <div
              className={`inline-flex items-center gap-0.5 sm:gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs sm:text-sm font-bold border ${
                consecutiveWins > 0
                  ? 'bg-[#FFEBD6] text-[#A24D1B] border-[#F5C7A2]'
                  : 'bg-[#F2E8D8] text-[#7A5B3E] border-[#DECDB3]'
              }`}
              title={`${consecutiveWins} consecutive wins`}
            >
              <Flame
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                  consecutiveWins > 0 ? 'fill-current text-[#D9531E]' : 'text-[#9C7A58]'
                }`}
              />
              <span>{consecutiveWins}</span>
            </div>

            <button
              onClick={handleToggleSound}
              aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
              className="p-1 sm:p-1.5 rounded-lg bg-[#F0E6D2] hover:bg-[#E6D8BE] text-[#4A331E] border border-[#D5C2A3] transition-colors cursor-pointer"
              title={soundOn ? 'Sound On' : 'Sound Off'}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>

        {/* Temporary Feedback Notification */}
        {lastFeedbackMessage && phase === 'playing' && (
          <div className="py-1 px-3 rounded-xl bg-[#FFF8EB] border border-[#E2BE8A] text-[#54361C] text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 text-[#C98236]" />
            <span>{lastFeedbackMessage}</span>
          </div>
        )}

        {/* Directly Below Header: Compact Instructions / Status */}
        <div className="text-center py-1">
          {phase === 'playing' ? (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#2E1A0C]">
                Which arrow appears the most?
              </h2>

              {/* Compact Time / Score Bar */}
              <div className="max-w-xs mx-auto space-y-1">
                <div className="flex items-center justify-between text-xs text-[#735235] font-medium px-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#8B5829]" />
                    {isTimeExpired ? (
                      <span className="text-[#8B5829] font-semibold flex items-center gap-0.5">
                        <Coffee className="w-3.5 h-3.5" /> Relaxed
                      </span>
                    ) : (
                      formatSafeTime(timeRemaining)
                    )}
                  </span>
                  <span className="font-semibold text-[#2E6B20]">
                    +{currentTierPoints} pts
                  </span>
                </div>

                <div className="w-full h-1.5 bg-[#E8DCBF] rounded-full overflow-hidden border border-[#D5C39F]">
                  <div
                    className="h-full bg-[#5D9642] transition-all duration-100 ease-linear rounded-full"
                    style={{ width: `${timePercent}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#F1F9F0] border border-[#A8DBA2] py-2 px-3 rounded-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#2E7D22]" />
                <h2 className="font-serif-title text-lg sm:text-xl font-bold text-[#24631D]">
                  Spot on! +{earnedPoints} pts
                </h2>
                <span className="text-xs sm:text-sm font-semibold text-[#3E6B38]">
                  {winningDirConfig?.symbol} {winningDirConfig?.label} was most frequent ({roundData.winningCount} arrows)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. COMPACT ARROW PLAYFIELD */}
      <div className="my-auto py-1 sm:py-2">
        <ArrowField arrows={roundData.arrows} roundKey={roundKey} />
      </div>

      {/* 3. CONTROLS PLACEMENT (Directly under field, no scrolling) */}
      <div className="space-y-3 pt-1">
        {phase === 'playing' ? (
          <div className="space-y-2">
            {/* 4 Compact Direction Answer Buttons */}
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5 max-w-md mx-auto">
              {DIRECTION_CONFIG.map((d) => (
                <button
                  key={d.dir}
                  id={`answer-btn-${d.dir}`}
                  onClick={() => handleSelectDirection(d.dir)}
                  title={`Select ${d.label} (Arrow${d.dir.charAt(0).toUpperCase() + d.dir.slice(1)} or tap)`}
                  className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gradient-to-b from-[#FFFDF9] to-[#F5EAD8] border-2 border-[#CDAF87] hover:border-[#8B5829] active:scale-95 text-[#2E1A0C] shadow-xs hover:shadow-sm transition-all cursor-pointer group min-h-[58px]"
                >
                  <span className="text-2xl sm:text-3xl font-bold transition-transform group-hover:scale-110 leading-none">
                    {d.symbol}
                  </span>
                  <span className="text-xs font-semibold text-[#5A3E26]">
                    {d.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Skip Button */}
            <div className="flex justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSkip}
                icon={<SkipForward className="w-4 h-4 text-[#8B5829]" />}
                className="border border-[#D2BE9B] text-[#543922] hover:bg-[#F2E7D5] shadow-xs text-xs font-semibold py-1 px-3"
              >
                Skip
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              variant="wood"
              size="md"
              onClick={handleNextRound}
              icon={<Sparkles className="w-4 h-4 text-[#FFE09A]" />}
              className="px-6 shadow-md min-h-[46px] text-sm sm:text-base font-bold"
            >
              Next Round
            </Button>
          </div>
        )}

        {/* Compact Difficulty Selector (Inline buttons, no scrolling) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-1">
          <span className="text-[11px] font-semibold text-[#7E5E41] uppercase tracking-wider mr-1">
            Difficulty:
          </span>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => handleChangeDifficulty(d)}
              className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                difficulty === d
                  ? 'bg-[#8B5829] text-white shadow-xs'
                  : 'bg-[#EFE3CE] hover:bg-[#E5D5BD] text-[#6B4B32] border border-[#DECDB3]'
              }`}
            >
              {d === 'easy' ? 'Easy (7–9)' : d === 'medium' ? 'Medium (11–15)' : 'Hard (17–21)'}
            </button>
          ))}
        </div>

        {/* 4. DAILY / SESSION STATS FOOTER */}
        <div className="pt-2.5 pb-1 border-t border-[#E5D7BF] flex items-center justify-around gap-4 text-center text-[#6B4E36] text-xs sm:text-sm">
          <div>
            <span className="font-bold text-[#321F10] text-base sm:text-lg mr-1.5">
              {dailyStats.gamesPlayedToday}
            </span>
            <span>Games Played Today</span>
          </div>
          <div className="h-4 w-px bg-[#DECDB3]" />
          <div>
            <span className="font-bold text-[#321F10] text-base sm:text-lg mr-1.5">
              {allTimeStats.highestScore}
            </span>
            <span>Best Score</span>
          </div>
          <div className="h-4 w-px bg-[#DECDB3]" />
          <div>
            <span className="font-bold text-[#321F10] text-base sm:text-lg mr-1.5">
              {dailyStats.bestPerfectStreakToday}
            </span>
            <span>Best Streak</span>
          </div>
        </div>
      </div>

      {/* Level Up Modal (6 consecutive wins) */}
      <LevelUpModal
        isOpen={isLevelUpModalOpen}
        onClose={() => setIsLevelUpModalOpen(false)}
        currentDifficulty={difficulty}
        consecutiveWins={consecutiveWins}
        onAcceptLevelUp={handleAcceptLevelUp}
        onStayAtCurrent={() => setIsLevelUpModalOpen(false)}
      />
    </div>
  );
};

