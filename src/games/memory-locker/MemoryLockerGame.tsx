import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Flame,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { Difficulty, SessionStats } from '../../types';
import {
  DIGIT_DISPLAY_DURATION_MS,
  DIGIT_GAP_DURATION_MS,
} from './config';
import { generateLockerCode, calculateLockerLength } from './logic';
import { LockerVault, LockerPhase } from './LockerVault';
import { Keypad } from './Keypad';
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
  getTodayDateKey,
} from '../../utils/gameScoreManager';

interface MemoryLockerGameProps {
  onBack: () => void;
}

const GAME_ID = 'memory_locker';

export const MemoryLockerGame: React.FC<MemoryLockerGameProps> = ({ onBack }) => {
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);

  const [allTimeStats, setAllTimeStats] = useState<GameAllTimeStats>(() =>
    loadAllTimeStats(GAME_ID)
  );
  const [dailyStats, setDailyStats] = useState<GameDailyStats>(() =>
    loadDailyStats(GAME_ID)
  );
  const [consecutiveWins, setConsecutiveWins] = useState<number>(0);

  // Personal Best Score Tracking for current continuous run/session
  const initialHighScoreRef = useRef<number>(allTimeStats.highestScore);
  const recordNotificationShownRef = useRef<boolean>(false);
  const [personalBestToast, setPersonalBestToast] = useState<boolean>(false);
  const personalBestTimerRef = useRef<number | null>(null);

  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Secret Code & Phase
  const [secretCode, setSecretCode] = useState<number[]>(() => {
    const len = calculateLockerLength('easy', 0, 0);
    return generateLockerCode(len);
  });

  const [phase, setPhase] = useState<LockerPhase>('ready');
  const [currentDisplayDigit, setCurrentDisplayDigit] = useState<number | null>(null);
  const [displayIndex, setDisplayIndex] = useState<number>(0);
  const [enteredDigits, setEnteredDigits] = useState<number[]>([]);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    if (personalBestTimerRef.current) clearTimeout(personalBestTimerRef.current);
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Save all-time stats to localStorage
  useEffect(() => {
    saveAllTimeStats(GAME_ID, allTimeStats);
  }, [allTimeStats]);

  // Save daily stats to localStorage
  useEffect(() => {
    saveDailyStats(GAME_ID, dailyStats);
  }, [dailyStats]);

  // Sound toggle
  const handleToggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundEnabled(nextState);
  };

  // Helper to start fresh round
  const startNewRound = useCallback(
    (targetDiff: Difficulty, nextRoundIdx: number, currLosses: number) => {
      clearAllTimers();
      const nextLen = calculateLockerLength(targetDiff, nextRoundIdx, currLosses);
      const newCode = generateLockerCode(nextLen);

      setSecretCode(newCode);
      setEnteredDigits([]);
      setCurrentDisplayDigit(null);
      setDisplayIndex(0);
      setEarnedPoints(0);
      setPhase('ready');
    },
    []
  );

  // Switch difficulty
  const handleChangeDifficulty = (newDiff: Difficulty) => {
    if (newDiff === difficulty) return;
    setDifficulty(newDiff);
    setRoundIndex(0);
    setConsecutiveLosses(0);
    setConsecutiveWins(0);
    setNotification(null);
    startNewRound(newDiff, 0, 0);
  };

  // Start sequence playback ("I'm Ready")
  const handleImReady = () => {
    clearAllTimers();
    setPhase('showing');
    setDisplayIndex(0);
    setEnteredDigits([]);
    setNotification(null);

    const stepDuration = DIGIT_DISPLAY_DURATION_MS + DIGIT_GAP_DURATION_MS;

    secretCode.forEach((digit, index) => {
      const showTimer = setTimeout(() => {
        setDisplayIndex(index);
        setCurrentDisplayDigit(digit);
        playTileChime(digit);
      }, index * stepDuration);
      timersRef.current.push(showTimer);

      const gapTimer = setTimeout(() => {
        setCurrentDisplayDigit(null);
      }, index * stepDuration + DIGIT_DISPLAY_DURATION_MS);
      timersRef.current.push(gapTimer);
    });

    const finishTimer = setTimeout(() => {
      setCurrentDisplayDigit(null);
      setPhase('input');
    }, secretCode.length * stepDuration);
    timersRef.current.push(finishTimer);
  };

  // Handle digit press on keypad
  const handleDigitPress = (digit: number) => {
    if (phase !== 'input') return;

    playTileChime(digit);

    const nextEntered = [...enteredDigits, digit];
    setEnteredDigits(nextEntered);

    const expectedDigit = secretCode[nextEntered.length - 1];

    if (digit !== expectedDigit) {
      // Wrong digit entered
      playGentleMissChime();
      setPhase('incorrect');

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

      if (nextLosses >= 2) {
        setNotification('We reduced the combination by one digit to keep it comfortable.');
      }
      return;
    }

    // Correct digit entered so far
    if (nextEntered.length === secretCode.length) {
      // Unlocked vault!
      playSuccessChime();
      setPhase('correct');
      setConsecutiveLosses(0);

      const basePts = secretCode.length * (difficulty === 'easy' ? 20 : difficulty === 'medium' ? 25 : 30);
      setEarnedPoints(basePts);

      const nextScore = sessionScore + basePts;
      setSessionScore(nextScore);

      const nextWins = consecutiveWins + 1;
      setConsecutiveWins(nextWins);

      // Update all-time stats & check personal best
      setAllTimeStats((prev) => {
        const nextHigh = Math.max(prev.highestScore, nextScore);
        const nextBestStreak = Math.max(prev.bestStreak, nextWins);

        if (
          !recordNotificationShownRef.current &&
          nextScore > initialHighScoreRef.current &&
          (initialHighScoreRef.current > 0 || nextScore > 0)
        ) {
          recordNotificationShownRef.current = true;
          setPersonalBestToast(true);
          if (personalBestTimerRef.current) clearTimeout(personalBestTimerRef.current);
          personalBestTimerRef.current = setTimeout(() => {
            setPersonalBestToast(false);
          }, 2500);
        }

        return {
          highestScore: nextHigh,
          bestStreak: nextBestStreak,
        };
      });

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

      if (nextWins === 6 && difficulty !== 'hard') {
        setTimeout(() => setIsLevelUpModalOpen(true), 600);
      }
    }
  };

  // Backspace
  const handleBackspace = () => {
    if (phase !== 'input' || enteredDigits.length === 0) return;
    playTileChime(0);
    setEnteredDigits((prev) => prev.slice(0, -1));
  };

  // Skip
  const handleSkip = () => {
    if (phase !== 'input' && phase !== 'ready') return;
    playTileChime(0);

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

    setNotification('Code skipped. Here is a fresh combination!');
    startNewRound(difficulty, roundIndex, nextLosses);
  };

  // Next Round
  const handleNextRound = () => {
    const nextRound = roundIndex + 1;
    setRoundIndex(nextRound);
    setNotification(null);
    startNewRound(difficulty, nextRound, consecutiveLosses);
  };

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'input') return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitPress(parseInt(e.key, 10));
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleAcceptLevelUp = () => {
    const nextDiff = getNextDifficulty(difficulty);
    if (nextDiff) {
      handleChangeDifficulty(nextDiff);
    }
    setIsLevelUpModalOpen(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 sm:py-4 flex flex-col justify-between min-h-[calc(100vh-4.5rem)]">
      {/* 1. COMPACT HEADER */}
      <div className="space-y-2">
        {/* Top compact row: ← Games | Score 120 | Round 3 | Easy | 🔥 1 | [Volume] */}
        <div className="flex items-center justify-between gap-2 py-1.5 border-b border-[#E5D7BF]">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm sm:text-base font-semibold text-[#5E3F27] hover:bg-[#EFE4D0] border border-[#DECDB3] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Games</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="relative">
              <span
                className={`text-sm sm:text-base font-bold px-2.5 py-1 rounded-lg transition-all duration-300 ${
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

            <span className="text-sm sm:text-base font-bold text-[#352110] px-2.5 py-1 rounded-lg bg-[#FAF3E6] border border-[#E2D2BC]">
              Round {roundIndex + 1}
            </span>

            <span className="text-xs sm:text-sm font-semibold text-[#6B4E36] bg-[#EFE3CE] px-2.5 py-1 rounded-lg border border-[#DECDB3] capitalize">
              {difficulty}
            </span>

            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold border ${
                consecutiveWins > 0
                  ? 'bg-[#FFEBD6] text-[#A24D1B] border-[#F5C7A2]'
                  : 'bg-[#F2E8D8] text-[#7A5B3E] border-[#DECDB3]'
              }`}
              title={`${consecutiveWins} consecutive wins`}
            >
              <Flame
                className={`w-4 h-4 ${
                  consecutiveWins > 0 ? 'fill-current text-[#D9531E]' : 'text-[#9C7A58]'
                }`}
              />
              <span>{consecutiveWins}</span>
            </div>

            <button
              onClick={handleToggleSound}
              aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
              className="p-1.5 rounded-lg bg-[#F0E6D2] hover:bg-[#E6D8BE] text-[#4A331E] border border-[#D5C2A3] transition-colors cursor-pointer"
              title={soundOn ? 'Sound On' : 'Sound Off'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="py-1 px-3 rounded-xl bg-[#FFF8EB] border border-[#E2BE8A] text-[#54361C] text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 text-[#C98236]" />
            <span>{notification}</span>
          </div>
        )}

        {/* Directly Below Header: Compact Instruction */}
        <div className="text-center py-1">
          {phase === 'ready' && (
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#2E1A0C]">
              Remember the locker code
            </h2>
          )}

          {phase === 'showing' && (
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#8B5829] flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B5829] animate-ping" />
              Showing {Math.min(secretCode.length, displayIndex + 1)} of {secretCode.length}...
            </h2>
          )}

          {phase === 'input' && (
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#2E1A0C]">
              Enter combination ({enteredDigits.length} / {secretCode.length})
            </h2>
          )}

          {phase === 'correct' && (
            <div className="bg-[#F1F9F0] border border-[#A8DBA2] py-2 px-3 rounded-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#2E7D22]" />
                <h2 className="font-serif-title text-lg sm:text-xl font-bold text-[#24631D]">
                  Locker Unlocked! +{earnedPoints} pts
                </h2>
                <span className="text-xs sm:text-sm font-semibold text-[#3E6B38]">
                  Recalled all {secretCode.length} digits in order
                </span>
              </div>
            </div>
          )}

          {phase === 'incorrect' && (
            <div className="bg-[#FBF1EA] border border-[#DCBAA5] py-2 px-3 rounded-2xl animate-in fade-in duration-150">
              <div className="flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#8B5829]" />
                <h2 className="font-serif-title text-lg sm:text-xl font-bold text-[#6D361B]">
                  Almost! Let’s try another code.
                </h2>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. COMPACT LOCKER VAULT */}
      <div className="my-auto py-1 sm:py-2">
        <LockerVault
          phase={phase}
          currentDisplayDigit={currentDisplayDigit}
          displayIndex={displayIndex}
          totalDigits={secretCode.length}
          enteredDigits={enteredDigits}
          revealedCode={secretCode}
        />
      </div>

      {/* 3. PRIMARY CONTROLS & KEYPAD (Directly below vault, no scrolling) */}
      <div className="space-y-2 pt-1">
        {phase === 'ready' && (
          <div className="flex justify-center py-1">
            <Button
              variant="wood"
              size="md"
              onClick={handleImReady}
              icon={<Play className="w-5 h-5 fill-current text-[#FFE09A]" />}
              className="px-8 shadow-md min-h-[46px] text-base font-bold"
            >
              I’m Ready
            </Button>
          </div>
        )}

        {phase === 'showing' && (
          <div className="h-[46px] flex items-center justify-center text-xs sm:text-sm font-semibold text-[#8B5829]">
            <span>Watch numbers appear one by one...</span>
          </div>
        )}

        {phase === 'input' && (
          <Keypad
            onDigitPress={handleDigitPress}
            onBackspace={handleBackspace}
            onSkip={handleSkip}
            canBackspace={enteredDigits.length > 0}
          />
        )}

        {phase === 'correct' && (
          <div className="flex justify-center py-1">
            <Button
              variant="wood"
              size="md"
              onClick={handleNextRound}
              icon={<Sparkles className="w-4 h-4 text-[#FFE09A]" />}
              className="px-7 shadow-md min-h-[46px] text-sm sm:text-base font-bold"
            >
              Next Code
            </Button>
          </div>
        )}

        {phase === 'incorrect' && (
          <div className="flex justify-center py-1">
            <Button
              variant="primary"
              size="md"
              onClick={handleNextRound}
              icon={<RotateCcw className="w-4 h-4" />}
              className="px-7 shadow-md min-h-[46px] text-sm sm:text-base font-bold"
            >
              Try Next Code
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
              disabled={phase === 'showing'}
              onClick={() => handleChangeDifficulty(d)}
              className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                difficulty === d
                  ? 'bg-[#8B5829] text-white shadow-xs'
                  : 'bg-[#EFE3CE] hover:bg-[#E5D5BD] text-[#6B4B32] border border-[#DECDB3]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {d === 'easy' ? 'Easy (3–4)' : d === 'medium' ? 'Medium (5–6)' : 'Hard (7–9)'}
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

      {/* Level Up Modal */}
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
