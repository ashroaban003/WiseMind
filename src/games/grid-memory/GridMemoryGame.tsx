import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Flame,
  CheckCircle2,
  RefreshCw,
  Eye,
  Check,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Difficulty, GamePhase, RoundResult } from '../../types';
import { difficultyConfig } from './config';
import {
  generateHighlightedTiles,
  calculateResult,
  getNextDifficulty,
} from './logic';
import { WoodenGrid } from './WoodenGrid';
import { Button } from '../../components/common/Button';
import { LevelUpModal } from '../../components/games/LevelUpModal';
import {
  playTileChime,
  playSuccessChime,
  playGentleMissChime,
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
  TILE_SELECTION_HOLD_MS,
} from '../../utils/gameScoreManager';

interface GridMemoryGameProps {
  onBack: () => void;
}

const GAME_ID = 'grid_memory';

export const GridMemoryGame: React.FC<GridMemoryGameProps> = ({ onBack }) => {
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
  const [phase, setPhase] = useState<GamePhase>('setup');

  // Personal Best Score Tracking for current continuous run/session
  const initialHighScoreRef = useRef<number>(allTimeStats.highestScore);
  const recordNotificationShownRef = useRef<boolean>(false);
  const [personalBestToast, setPersonalBestToast] = useState<boolean>(false);
  const personalBestTimerRef = useRef<number | null>(null);

  // Audio mute state synced with shared audio engine
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());

  // Game puzzle state
  const [highlightedTiles, setHighlightedTiles] = useState<number[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [countdown, setCountdown] = useState<number>(0);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);

  // Level Up Modal State (6 consecutive wins)
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState<boolean>(false);
  const [hasPromptedLevelUp, setHasPromptedLevelUp] = useState<boolean>(false);

  // Encouraging toast message when difficulty changes
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const previewTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Save all-time stats to localStorage
  useEffect(() => {
    saveAllTimeStats(GAME_ID, allTimeStats);
  }, [allTimeStats]);

  // Save daily stats to localStorage
  useEffect(() => {
    saveDailyStats(GAME_ID, dailyStats);
  }, [dailyStats]);

  const config = difficultyConfig[difficulty];

  const handleToggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundEnabled(nextState);
  };

  // Start a new puzzle round
  const startNewRound = useCallback(
    (forcedDifficulty?: Difficulty) => {
      const activeDifficulty = forcedDifficulty || difficulty;
      const activeConfig = difficultyConfig[activeDifficulty];

      if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
      if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);

      const targetTiles = generateHighlightedTiles(
        activeConfig.size,
        activeConfig.minHighlights,
        activeConfig.maxHighlights
      );

      setHighlightedTiles(targetTiles);
      setSelectedTiles([]);
      setResult(null);
      setIsEvaluating(false);
      setPhase('preview');

      const durationSeconds = Math.ceil(activeConfig.previewTime / 1000);
      setCountdown(durationSeconds);

      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      previewTimerRef.current = window.setTimeout(() => {
        setPhase('playing');
      }, activeConfig.previewTime);
    },
    [difficulty]
  );

  // Launch initial game on mount
  useEffect(() => {
    startNewRound();
    return () => {
      if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
      if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);
      if (personalBestTimerRef.current) window.clearTimeout(personalBestTimerRef.current);
    };
  }, [startNewRound]);

  // "I'm Ready" button
  const handleReadyClick = () => {
    if (phase !== 'preview') return;
    if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
    if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);
    setPhase('playing');
  };

  // Evaluate selected tiles against highlighted targets
  const evaluateAnswer = (finalSelected: number[]) => {
    const roundResult = calculateResult(highlightedTiles, finalSelected);
    setResult(roundResult);
    setPhase('result');
    setIsEvaluating(false);

    // Audio chime based on outcome
    if (roundResult.isPerfect) {
      playSuccessChime();

      // Calculate score based on difficulty and correct tiles
      const basePts = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 75 : 100;
      const bonusPerTile = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;
      const points = basePts + roundResult.correctCount * bonusPerTile;
      setEarnedPoints(points);

      const nextScore = sessionScore + points;
      setSessionScore(nextScore);

      const nextWins = consecutiveWins + 1;
      setConsecutiveWins(nextWins);

      // Update all-time stats & check personal best
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
          if (personalBestTimerRef.current) window.clearTimeout(personalBestTimerRef.current);
          personalBestTimerRef.current = window.setTimeout(() => {
            setPersonalBestToast(false);
          }, 2500);
        }

        return {
          highestScore: nextHigh,
          bestStreak: nextStreak,
        };
      });

      // Update daily stats
      setDailyStats((prev) => {
        const today = getTodayDateKey();
        const isSameDay = prev.lastActivityDate === today;
        const prevPlayed = isSameDay ? prev.gamesPlayedToday : 0;
        const prevStreak = isSameDay ? prev.bestPerfectStreakToday : 0;

        return {
          gamesPlayedToday: prevPlayed + 1,
          bestPerfectStreakToday: Math.max(prevStreak, nextWins),
          lastActivityDate: today,
        };
      });

      if (nextWins === 6 && !hasPromptedLevelUp) {
        setIsLevelUpModalOpen(true);
        setHasPromptedLevelUp(true);
      }
    } else {
      playGentleMissChime();
      setEarnedPoints(0);

      // Streak-loss penalty
      const lostStreak = consecutiveWins;
      const penalty = calculateStreakPenalty(lostStreak);
      setConsecutiveWins(0);

      if (penalty > 0) {
        setSessionScore((prev) => Math.max(0, prev - penalty));
      }

      // Update daily stats
      setDailyStats((prev) => {
        const today = getTodayDateKey();
        const isSameDay = prev.lastActivityDate === today;
        const prevPlayed = isSameDay ? prev.gamesPlayedToday : 0;
        const prevStreak = isSameDay ? prev.bestPerfectStreakToday : 0;

        return {
          gamesPlayedToday: prevPlayed + 1,
          bestPerfectStreakToday: prevStreak,
          lastActivityDate: today,
        };
      });
    }
  };

  // "Skip / Show Answer" with consistent hold timing
  const handleSkipShowAnswer = () => {
    if (phase !== 'playing' || isEvaluating) return;
    setIsEvaluating(true);
    window.setTimeout(() => {
      evaluateAnswer(selectedTiles);
    }, TILE_SELECTION_HOLD_MS);
  };

  // Handle tile click during playing phase - with consistent hold timing
  const handleTileClick = (index: number) => {
    if (phase !== 'playing' || isEvaluating) return;

    // Reuse same sound effect used when selecting blocks in Sequence Memory
    playTileChime(index);

    if (selectedTiles.includes(index)) {
      // Tap again to deselect
      setSelectedTiles((prev) => prev.filter((i) => i !== index));
    } else {
      // Select tile
      const nextSelection = [...selectedTiles, index];
      setSelectedTiles(nextSelection);

      // Auto evaluate once target count reached - holding visible state so user clearly sees what they clicked
      if (nextSelection.length === highlightedTiles.length) {
        setIsEvaluating(true);
        window.setTimeout(() => {
          evaluateAnswer(nextSelection);
        }, TILE_SELECTION_HOLD_MS);
      }
    }
  };

  // Next round action
  const handleNextRound = () => {
    setRoundNumber((r) => r + 1);
    startNewRound();
  };

  // Manual difficulty change
  const handleChangeDifficulty = (newDiff: Difficulty) => {
    if (newDiff === difficulty) return;

    setDifficulty(newDiff);
    setConsecutiveWins(0);
    setRoundNumber(1);
    setHasPromptedLevelUp(false);
    setToastMessage(`Difficulty set to ${newDiff.toUpperCase()}!`);
    setTimeout(() => setToastMessage(null), 3000);
    startNewRound(newDiff);
  };

  // Level Up acceptance
  const handleAcceptLevelUp = () => {
    const next = getNextDifficulty(difficulty);
    if (!next) return;

    setIsLevelUpModalOpen(false);
    setDifficulty(next);
    setRoundNumber(1);
    setConsecutiveWins(0);
    setToastMessage(`Welcome to ${next.toUpperCase()}! Let's give it a try.`);
    setTimeout(() => setToastMessage(null), 3500);
    startNewRound(next);
  };

  const handleStayAtCurrent = () => {
    setIsLevelUpModalOpen(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 sm:py-4 flex flex-col justify-between min-h-[calc(100vh-4.5rem)]">
      {/* 1. COMPACT HEADER */}
      <div className="space-y-2">
        {/* Top compact header line: ← Games | Score 120 | Round 3 | Easy | 🔥 1 | [Volume] */}
        <div className="flex items-center justify-between gap-2 py-1.5 border-b border-[#E5D7BF]">
          {/* Back button */}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm sm:text-base font-semibold text-[#5E3F27] hover:bg-[#EFE4D0] border border-[#DECDB3] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Games</span>
          </button>

          {/* Right Status Clusters */}
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
              Round {roundNumber}
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
              title={`${consecutiveWins} consecutive perfect rounds today`}
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

        {/* Encouraging Toast Banner if changed */}
        {toastMessage && (
          <div className="py-1 px-3 rounded-xl bg-[#FFF8EB] border border-[#E2BE8A] text-[#54361C] text-sm font-medium flex items-center justify-center gap-2 animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 text-[#C98236]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Directly Below Header: Compact Instructions / Status */}
        <div className="text-center py-1">
          {phase === 'preview' && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#2E1A0C] flex items-center justify-center gap-2">
                <Eye className="w-5 h-5 text-[#8B5829]" />
                Remember the light tiles
                {countdown > 0 && (
                  <span className="text-xs sm:text-sm font-bold text-[#8B5829] bg-[#EFE3CE] px-2 py-0.5 rounded-md border border-[#DECDB3]">
                    {countdown}s
                  </span>
                )}
              </h2>
            </div>
          )}

          {phase === 'playing' && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#2E1A0C]">
                Which tiles were light?
              </h2>
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block bg-[#EFE5D1] text-[#4A321E] px-3.5 py-0.5 rounded-full font-bold text-sm sm:text-base border border-[#D9C8A8]">
                  Selected {selectedTiles.length} / {highlightedTiles.length}
                </span>
                {isEvaluating && (
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#8B5829] animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" /> Checking...
                  </span>
                )}
              </div>
            </div>
          )}

          {phase === 'result' && result && (
            <div className="bg-[#FBF6EC] border border-[#DBC7A4] py-2 px-3 rounded-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-center gap-2">
                {result.isPerfect ? (
                  <Sparkles className="w-5 h-5 text-[#C98236]" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                )}
                <h2 className="font-serif-title text-lg sm:text-xl font-bold text-[#2B190B]">
                  {result.message}
                </h2>
                <span className="text-xs sm:text-sm font-semibold text-[#5A3F28]">
                  ({result.correctCount} / {result.totalCorrectTarget} correct · {result.accuracy}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. THE WOODEN PUZZLE GRID (Centered, Compact) */}
      <div className="my-auto py-1 sm:py-2">
        <WoodenGrid
          size={config.size}
          highlightedIndexes={highlightedTiles}
          userSelectedIndexes={selectedTiles}
          phase={phase}
          onTileClick={handleTileClick}
          disabled={phase !== 'playing' || isEvaluating}
        />
      </div>

      {/* 3. CONTROLS PLACEMENT (Right below the grid, tight and accessible) */}
      <div className="space-y-3 pt-1">
        {/* Phase Action Buttons */}
        <div className="flex flex-col items-center justify-center">
          {phase === 'preview' && (
            <Button
              variant="wood"
              size="md"
              onClick={handleReadyClick}
              icon={<Check className="w-5 h-5" />}
              className="shadow-md min-w-[190px] min-h-[46px] text-base"
            >
              I’m Ready
            </Button>
          )}

          {phase === 'playing' && (
            <Button
              variant="secondary"
              size="md"
              onClick={handleSkipShowAnswer}
              disabled={isEvaluating}
              icon={<Eye className="w-4 h-4 text-[#8B5829]" />}
              className="border border-[#D5C1A0] text-[#543922] hover:bg-[#F2E8D7] shadow-xs min-h-[44px] text-sm font-semibold"
            >
              Skip / Show Answer
            </Button>
          )}

          {phase === 'result' && (
            <div className="w-full flex flex-col items-center gap-2">
              <Button
                variant="wood"
                size="lg"
                onClick={handleNextRound}
                icon={<RefreshCw className="w-5 h-5" />}
                className="shadow-md min-w-[210px] min-h-[48px] text-base font-bold"
              >
                Play Next Round
              </Button>

              {/* Compact Results Legend */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-[#5A3F29] pt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                  <span>Correct</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-[10px] font-bold">
                    ✕
                  </div>
                  <span>Wrong</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#D97706] text-white flex items-center justify-center text-[10px] font-bold">
                    ●
                  </div>
                  <span>Missed</span>
                </div>
              </div>
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
              onClick={() => handleChangeDifficulty(d)}
              className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                difficulty === d
                  ? 'bg-[#8B5829] text-white shadow-xs'
                  : 'bg-[#EFE3CE] hover:bg-[#E5D5BD] text-[#6B4B32] border border-[#DECDB3]'
              }`}
            >
              {d === 'easy' ? 'Easy (3×3)' : d === 'medium' ? 'Medium (4×4)' : 'Hard (5×5)'}
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

      {/* Level Up Modal (Triggered on 6 consecutive wins) */}
      <LevelUpModal
        isOpen={isLevelUpModalOpen}
        onClose={() => setIsLevelUpModalOpen(false)}
        currentDifficulty={difficulty}
        consecutiveWins={consecutiveWins}
        onAcceptLevelUp={handleAcceptLevelUp}
        onStayAtCurrent={handleStayAtCurrent}
      />
    </div>
  );
};
