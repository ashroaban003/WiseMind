import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Flame,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Play,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Difficulty, SessionStats } from '../../types';
import {
  sequenceDifficultyConfig,
  SequenceDifficultyConfig,
} from './config';
import {
  generateSequence,
  validateStep,
  getNextAdaptiveSequenceLength,
  getInitialSequenceLength,
} from './logic';
import {
  playTileChime,
  playSuccessChime,
  playGentleMissChime,
  isSoundEnabled,
  setSoundEnabled,
} from './audio';
import { SequenceTile, SequenceTileStatus } from './SequenceTile';
import { Button } from '../../components/common/Button';
import { LevelUpModal } from '../../components/games/LevelUpModal';
import { getNextDifficulty } from '../grid-memory/logic';
import {
  GameAllTimeStats,
  GameDailyStats,
  loadAllTimeStats,
  saveAllTimeStats,
  loadDailyStats,
  saveDailyStats,
  calculateStreakPenalty,
  getTodayDateKey,
  TILE_SELECTION_HOLD_MS,
} from '../../utils/gameScoreManager';

export type SequenceGamePhase =
  | 'setup'
  | 'showing-sequence'
  | 'user-input'
  | 'result';

interface SequenceMemoryGameProps {
  onBack: () => void;
}

const GAME_ID = 'sequence_memory';

export const SequenceMemoryGame: React.FC<SequenceMemoryGameProps> = ({
  onBack,
}) => {
  // Stats Persistence
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [allTimeStats, setAllTimeStats] = useState<GameAllTimeStats>(() =>
    loadAllTimeStats(GAME_ID)
  );
  const [dailyStats, setDailyStats] = useState<GameDailyStats>(() =>
    loadDailyStats(GAME_ID)
  );
  const [consecutiveWins, setConsecutiveWins] = useState<number>(0);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);

  // Personal Best Score Tracking for current continuous run/session
  const initialHighScoreRef = useRef<number>(allTimeStats.highestScore);
  const recordNotificationShownRef = useRef<boolean>(false);
  const [personalBestToast, setPersonalBestToast] = useState<boolean>(false);
  const personalBestTimerRef = useRef<number | null>(null);

  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [phase, setPhase] = useState<SequenceGamePhase>('setup');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());

  // Save all-time stats to localStorage
  useEffect(() => {
    saveAllTimeStats(GAME_ID, allTimeStats);
  }, [allTimeStats]);

  // Save daily stats to localStorage
  useEffect(() => {
    saveDailyStats(GAME_ID, dailyStats);
  }, [dailyStats]);

  // Adaptive Difficulty State
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);
  const [sequenceLength, setSequenceLength] = useState<number>(() =>
    getInitialSequenceLength('easy')
  );
  const [adaptiveNote, setAdaptiveNote] = useState<string | null>(null);

  // Sequence state
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSteps, setUserSteps] = useState<number[]>([]);
  const [activePlaybackIndex, setActivePlaybackIndex] = useState<number | null>(
    null
  );
  const [currentPlaybackStep, setCurrentPlaybackStep] = useState<number>(0);
  const [tapFeedback, setTapFeedback] = useState<{
    index: number;
    status: 'user-correct' | 'user-wrong';
  } | null>(null);

  // Result state
  const [roundSuccess, setRoundSuccess] = useState<boolean>(false);
  const [isProcessingTap, setIsProcessingTap] = useState<boolean>(false);
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState<boolean>(false);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);

  const activeConfig: SequenceDifficultyConfig =
    sequenceDifficultyConfig[difficulty];
  const totalTiles = activeConfig.gridSize * activeConfig.gridSize;

  const playbackTimeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const clearAllPlaybackTimers = () => {
    playbackTimeoutRefs.current.forEach((timer) => clearTimeout(timer));
    playbackTimeoutRefs.current = [];
    if (personalBestTimerRef.current) clearTimeout(personalBestTimerRef.current);
  };

  useEffect(() => {
    return () => clearAllPlaybackTimers();
  }, []);

  // Toggle Sound
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  // Helper to start fresh round
  const startNewRound = useCallback(
    (targetDifficulty: Difficulty, length: number, autoStartPlayback = false) => {
      clearAllPlaybackTimers();
      const cfg = sequenceDifficultyConfig[targetDifficulty];
      const newSequence = generateSequence(cfg.gridSize * cfg.gridSize, length);

      setSequence(newSequence);
      setUserSteps([]);
      setActivePlaybackIndex(null);
      setCurrentPlaybackStep(0);
      setTapFeedback(null);
      setRoundSuccess(false);
      setIsProcessingTap(false);
      setIsReplaying(false);

      if (autoStartPlayback) {
        setPhase('showing-sequence');
        playSequenceSteps(newSequence, cfg);
      } else {
        setPhase('setup');
      }
    },
    []
  );

  // Initialize on mount
  useEffect(() => {
    startNewRound('easy', sequenceLength, false);
  }, [startNewRound]);

  // Audio & Visual Step Player
  const playSequenceSteps = (
    seq: number[],
    cfg: SequenceDifficultyConfig
  ) => {
    clearAllPlaybackTimers();

    const initialDelay = 500;
    seq.forEach((tileIndex, stepIdx) => {
      const stepStartTime = initialDelay + stepIdx * (cfg.playbackSpeedMs + cfg.gapMs);

      // Flash On
      const onTimer = setTimeout(() => {
        setActivePlaybackIndex(tileIndex);
        setCurrentPlaybackStep(stepIdx);
        playTileChime(tileIndex);
      }, stepStartTime);
      playbackTimeoutRefs.current.push(onTimer);

      // Flash Off
      const offTimer = setTimeout(() => {
        setActivePlaybackIndex(null);
      }, stepStartTime + cfg.playbackSpeedMs);
      playbackTimeoutRefs.current.push(offTimer);
    });

    // Complete sequence playback
    const finishTime =
      initialDelay +
      seq.length * (cfg.playbackSpeedMs + cfg.gapMs) +
      200;

    const endTimer = setTimeout(() => {
      setActivePlaybackIndex(null);
      setCurrentPlaybackStep(0);
      setPhase('user-input');
      setIsReplaying(false);
    }, finishTime);
    playbackTimeoutRefs.current.push(endTimer);
  };

  // User taps "I'm Ready"
  const handleReadyToWatch = () => {
    setPhase('showing-sequence');
    playSequenceSteps(sequence, activeConfig);
  };

  // Replay sequence button
  const handleReplaySequence = () => {
    setIsReplaying(true);
    setUserSteps([]);
    setTapFeedback(null);
    setPhase('showing-sequence');
    playSequenceSteps(sequence, activeConfig);
  };

  // Handle tile click during user-input
  const handleTileClick = (tileIndex: number) => {
    if (phase !== 'user-input' || isProcessingTap) return;

    playTileChime(tileIndex);

    const stepIndex = userSteps.length;
    const isStepCorrect = validateStep(sequence, stepIndex, tileIndex);
    const nextUserSteps = [...userSteps, tileIndex];
    setUserSteps(nextUserSteps);

    if (isStepCorrect) {
      setTapFeedback({ index: tileIndex, status: 'user-correct' });

      // Check if sequence completed
      if (nextUserSteps.length === sequence.length) {
        setIsProcessingTap(true);
        setTimeout(() => {
          setTapFeedback(null);
          playSuccessChime();
          setRoundSuccess(true);
          setPhase('result');
          setIsProcessingTap(false);

          // Points based on difficulty and sequence length
          const ptsPerStep = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 25 : 30;
          const points = sequence.length * ptsPerStep;
          setEarnedPoints(points);

          // Update Streak and Adaptive Length
          setConsecutiveLosses(0);
          const nextStreak = consecutiveWins + 1;
          setConsecutiveWins(nextStreak);

          const { nextLength } = getNextAdaptiveSequenceLength(
            difficulty,
            sequenceLength,
            0,
            nextStreak
          );
          const didIncrease = nextLength > sequenceLength;
          setSequenceLength(nextLength);

          if (didIncrease) {
            setAdaptiveNote(`Wonderful! Increasing sequence to ${nextLength} steps.`);
          } else {
            setAdaptiveNote(null);
          }

          // Update session score
          const nextScore = sessionScore + points;
          setSessionScore(nextScore);

          // Update all-time stats & personal best
          setAllTimeStats((prev) => {
            const nextHigh = Math.max(prev.highestScore, nextScore);
            const nextBestStreak = Math.max(prev.bestStreak, nextStreak);

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

          // Update daily stats
          setDailyStats((prev) => {
            const today = getTodayDateKey();
            const isSameDay = prev.lastActivityDate === today;
            const prevPlayedToday = isSameDay ? prev.gamesPlayedToday : 0;
            const prevStreakToday = isSameDay ? prev.bestPerfectStreakToday : 0;

            return {
              gamesPlayedToday: prevPlayedToday + 1,
              bestPerfectStreakToday: Math.max(prevStreakToday, nextStreak),
              lastActivityDate: today,
            };
          });

          // Trigger level-up modal if 6 wins reached
          if (nextStreak === 6 && difficulty !== 'hard') {
            setTimeout(() => {
              setIsLevelUpModalOpen(true);
            }, 700);
          }
        }, TILE_SELECTION_HOLD_MS);
      } else {
        // Hold visible selection feedback clearly before allowing next tap
        setIsProcessingTap(true);
        setTimeout(() => {
          setTapFeedback(null);
          setIsProcessingTap(false);
        }, TILE_SELECTION_HOLD_MS);
      }
    } else {
      // Step failed
      setTapFeedback({ index: tileIndex, status: 'user-wrong' });
      setIsProcessingTap(true);

      setTimeout(() => {
        setTapFeedback(null);
        playGentleMissChime();
        setRoundSuccess(false);
        setPhase('result');
        setIsProcessingTap(false);
        setEarnedPoints(0);

        // Streak-loss penalty
        const lostStreak = consecutiveWins;
        const penalty = calculateStreakPenalty(lostStreak);
        setConsecutiveWins(0);

        if (penalty > 0) {
          setSessionScore((prev) => Math.max(0, prev - penalty));
        }

        const nextLosses = consecutiveLosses + 1;
        setConsecutiveLosses(nextLosses);

        const { nextLength, didReduce } = getNextAdaptiveSequenceLength(
          difficulty,
          sequenceLength,
          nextLosses,
          0
        );
        setSequenceLength(nextLength);

        if (didReduce) {
          setAdaptiveNote(
            `To keep things relaxed, adjusted next round to ${nextLength} steps.`
          );
        } else {
          setAdaptiveNote(null);
        }

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
      }, TILE_SELECTION_HOLD_MS);
    }
  };

  const handleNextRound = () => {
    setRoundNumber((r) => r + 1);
    setAdaptiveNote(null);
    startNewRound(difficulty, sequenceLength, true);
  };

  const handleChangeDifficulty = (newDiff: Difficulty) => {
    if (newDiff === difficulty) return;
    const initialLen = getInitialSequenceLength(newDiff);
    setDifficulty(newDiff);
    setSequenceLength(initialLen);
    setConsecutiveLosses(0);
    setConsecutiveWins(0);
    setRoundNumber(1);
    setAdaptiveNote(null);
    startNewRound(newDiff, initialLen, false);
  };

  const handleAcceptLevelUp = () => {
    const nextDiff = getNextDifficulty(difficulty);
    if (nextDiff) {
      setIsLevelUpModalOpen(false);
      handleChangeDifficulty(nextDiff);
    }
  };

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

        {/* Adaptive note notification if present */}
        {adaptiveNote && (
          <div className="py-1 px-3 rounded-xl bg-[#FFF8EB] border border-[#E2BE8A] text-[#54361C] text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 text-[#C98236]" />
            <span>{adaptiveNote}</span>
          </div>
        )}

        {/* Directly Below Header: Compact Instructions / Status */}
        <div className="text-center py-1">
          {phase === 'setup' && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#2E1A0C] flex items-center justify-center gap-2">
                <Eye className="w-5 h-5 text-[#8B5829]" />
                Watch the sequence of blocks
              </h2>
            </div>
          )}

          {phase === 'showing-sequence' && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#8B5829] flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                Step {currentPlaybackStep + 1} of {sequence.length}
              </h2>
              <div className="w-36 mx-auto h-2 rounded-full bg-[#E5D7C0] overflow-hidden">
                <div
                  className="h-full bg-[#8B5829] transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentPlaybackStep + 1) / sequence.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {phase === 'user-input' && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#2E1A0C]">
                Repeat the sequence
              </h2>
              {/* Compact step dots */}
              <div className="flex items-center justify-center gap-1.5 pt-0.5 flex-wrap">
                {sequence.map((_, idx) => {
                  const isDone = idx < userSteps.length;
                  const isCurrent = idx === userSteps.length;
                  return (
                    <div
                      key={idx}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-[#2E7D32] text-white shadow-xs'
                          : isCurrent
                          ? 'bg-[#8B5829] text-white ring-2 ring-[#8B5829]/30 scale-105'
                          : 'bg-[#E5D7BF] text-[#7A5B3E] border border-[#D5C2A3]'
                      }`}
                    >
                      {isDone ? '✓' : idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {phase === 'result' && !isReplaying && (
            <div className="bg-[#FBF6EC] border border-[#DBC7A4] py-2 px-3 rounded-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-center gap-2">
                {roundSuccess ? (
                  <>
                    <Trophy className="w-5 h-5 text-[#2E7D32]" />
                    <h2 className="font-serif-title text-lg sm:text-xl font-bold text-[#1B5E20]">
                      Great job!
                    </h2>
                    <span className="text-xs sm:text-sm font-semibold text-[#285A2B]">
                      All {sequence.length} steps in perfect order!
                    </span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-5 h-5 text-[#8B5829]" />
                    <h2 className="font-serif-title text-lg sm:text-xl font-bold text-[#7A3E16]">
                      Almost!
                    </h2>
                    <span className="text-xs sm:text-sm font-semibold text-[#784420]">
                      Remembered {userSteps.length} of {sequence.length} steps.
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. COMPACT WOODEN GRID BOARD */}
      <div className="my-auto py-1 sm:py-2">
        <div className="w-full max-w-[320px] sm:max-w-[360px] md:max-w-[390px] mx-auto aspect-square p-3 sm:p-4 rounded-2xl sm:rounded-3xl wood-board shadow-[0_12px_28px_rgba(70,40,15,0.2)] border-3 sm:border-4 border-[#BA8B57]">
          <div
            className={`w-full h-full grid gap-2.5 sm:gap-3.5 ${
              activeConfig.gridSize === 3 ? 'grid-cols-3' : 'grid-cols-4'
            }`}
          >
            {Array.from({ length: totalTiles }).map((_, index) => {
              let status: SequenceTileStatus = 'normal';

              if (phase === 'showing-sequence') {
                if (activePlaybackIndex === index) {
                  status = 'playback-active';
                }
              } else if (tapFeedback && tapFeedback.index === index) {
                status = tapFeedback.status;
              }

              return (
                <SequenceTile
                  key={index}
                  index={index}
                  status={status}
                  stepNumber={
                    phase === 'showing-sequence' && activePlaybackIndex === index
                      ? currentPlaybackStep + 1
                      : undefined
                  }
                  onClick={() => handleTileClick(index)}
                  disabled={phase !== 'user-input' || isProcessingTap}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. CONTROLS PLACEMENT (Directly under the grid, no scrolling) */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col items-center justify-center">
          {phase === 'setup' && (
            <Button
              variant="wood"
              size="md"
              onClick={handleReadyToWatch}
              icon={<Play className="w-5 h-5 fill-current text-[#FFE09A]" />}
              className="shadow-md min-w-[190px] min-h-[46px] text-base"
            >
              I’m Ready
            </Button>
          )}

          {phase === 'showing-sequence' && (
            <div className="h-[46px] flex items-center justify-center text-xs sm:text-sm font-semibold text-[#8B5829]">
              <span>Watch and remember the order...</span>
            </div>
          )}

          {phase === 'user-input' && (
            <div className="h-[46px] flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReplaySequence}
                icon={<Eye className="w-4 h-4 text-[#8B5829]" />}
                className="border border-[#D5C1A0] text-[#543922] hover:bg-[#F2E8D7] shadow-xs text-xs font-semibold py-1.5 px-3"
              >
                Replay Sequence
              </Button>
            </div>
          )}

          {phase === 'result' && !isReplaying && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="wood"
                size="md"
                onClick={handleNextRound}
                icon={<RefreshCw className="w-4 h-4" />}
                className="shadow-md min-w-[160px] min-h-[46px] text-sm sm:text-base font-bold"
              >
                {roundSuccess ? 'Next Round' : 'Try Again'}
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={handleReplaySequence}
                icon={<Eye className="w-4 h-4" />}
                className="min-h-[46px] text-xs sm:text-sm"
              >
                Watch Again
              </Button>
            </div>
          )}
        </div>

        {/* Compact Difficulty Selector (Inline buttons, no scrolling) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-1">
          <span className="text-[11px] font-semibold text-[#7E5E41] uppercase tracking-wider mr-1">
            Difficulty:
          </span>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              disabled={phase === 'showing-sequence'}
              onClick={() => handleChangeDifficulty(d)}
              className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                difficulty === d
                  ? 'bg-[#8B5829] text-white shadow-xs'
                  : 'bg-[#EFE3CE] hover:bg-[#E5D5BD] text-[#6B4B32] border border-[#DECDB3]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {d === 'easy' ? 'Easy (3×3)' : d === 'medium' ? 'Medium (3×3)' : 'Hard (4×4)'}
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
