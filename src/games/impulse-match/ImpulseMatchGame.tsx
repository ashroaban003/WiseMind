import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  Square,
} from 'lucide-react';
import { Difficulty } from '../../types';
import {
  impulseDifficultyConfig,
  PROMPTS_PER_ROUND,
  ImpulseDifficultyConfig,
} from './config';
import {
  generateImpulseRound,
  preloadRoundImages,
  calculateImpulseSummary,
  ImpulseRoundData,
  PromptResult,
  Side,
  ImpulseRoundSummary,
} from './logic';
import { RememberPhase } from './RememberPhase';
import { ActivePhase } from './ActivePhase';
import { ResultPhase } from './ResultPhase';
import {
  playTileChime,
  playGentleMissChime,
  playSuccessChime,
  isSoundEnabled,
  setSoundEnabled,
} from '../sequence-memory/audio';
import {
  loadAllTimeStats,
  saveAllTimeStats,
  loadDailyStats,
  saveDailyStats,
  calculateStreakPenalty,
} from '../../utils/gameScoreManager';

interface ImpulseMatchGameProps {
  onBack: () => void;
}

type Phase = 'remember' | 'playing' | 'result';

export const ImpulseMatchGame: React.FC<ImpulseMatchGameProps> = ({ onBack }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [phase, setPhase] = useState<Phase>('remember');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [consecutiveWins, setConsecutiveWins] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled);

  // All-time stats (persistent across browser restarts)
  const [allTimeStats, setAllTimeStats] = useState(() =>
    loadAllTimeStats('impulse_match')
  );
  const initialHighScoreRef = useRef<number>(allTimeStats.highestScore);
  const [personalBestToast, setPersonalBestToast] = useState<boolean>(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Round specific data
  const [roundData, setRoundData] = useState<ImpulseRoundData>(() =>
    generateImpulseRound('easy')
  );
  const [isAssetsLoaded, setIsAssetsLoaded] = useState<boolean>(false);

  // Active prompt tracking
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(0);
  const [promptResults, setPromptResults] = useState<PromptResult[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<{
    promptIndex: number;
    isCorrect: boolean;
    isMissed: boolean;
    sideChosen: Side | null;
  } | null>(null);

  // Round summary
  const [roundSummary, setRoundSummary] = useState<ImpulseRoundSummary | null>(
    null
  );

  const activeConfig: ImpulseDifficultyConfig = impulseDifficultyConfig[difficulty];

  // Initialize round assets and preloading
  const startNewRound = useCallback(
    (newDiff: Difficulty, roundNum: number) => {
      const data = generateImpulseRound(newDiff);
      setRoundData(data);
      setIsAssetsLoaded(false);
      setCurrentPromptIndex(0);
      setPromptResults([]);
      setRecentFeedback(null);
      setRoundSummary(null);
      setPhase('remember');
      setRoundNumber(roundNum);

      // Preload all required object images for this round
      const uniqueObjects = [...data.leftObjects, ...data.rightObjects];
      preloadRoundImages(uniqueObjects).then(() => {
        setIsAssetsLoaded(true);
      });
    },
    []
  );

  // Initial mount: load round
  useEffect(() => {
    startNewRound('easy', 1);
  }, [startNewRound]);

  // Audio toggle
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  // Personal Best Toast check
  const checkPersonalBest = useCallback(
    (newScore: number) => {
      if (newScore > initialHighScoreRef.current && newScore > 0) {
        initialHighScoreRef.current = newScore;
        setPersonalBestToast(true);

        if (toastTimerRef.current) {
          clearTimeout(toastTimerRef.current);
        }
        toastTimerRef.current = setTimeout(() => {
          setPersonalBestToast(false);
        }, 2500);
      }
    },
    []
  );

  // Clean up toast on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Handler: "I'm Ready" pressed
  const handleReady = () => {
    if (!isAssetsLoaded) return;
    setPhase('playing');
    setCurrentPromptIndex(0);
  };

  // Handler: Answer given for a prompt
  const handleAnswer = useCallback(
    (choice: Side | null, responseTimeMs: number) => {
      const prompt = roundData.prompts[currentPromptIndex];
      const isMissed = choice === null;
      const isCorrect = choice !== null && choice === prompt.targetSide;

      let points = 0;
      if (isCorrect) {
        points = activeConfig.basePointsPerPrompt;
        if (responseTimeMs <= activeConfig.fastBonusThresholdMs) {
          points += activeConfig.fastBonusPoints;
        }
        playTileChime(currentPromptIndex);
      } else {
        playGentleMissChime();
      }

      const resultItem: PromptResult = {
        promptIndex: currentPromptIndex,
        object: prompt.object,
        targetSide: prompt.targetSide,
        userChoice: choice,
        isCorrect,
        isMissed,
        responseTimeMs,
        pointsEarned: points,
      };

      const nextResults = [...promptResults, resultItem];
      setPromptResults(nextResults);

      setRecentFeedback({
        promptIndex: currentPromptIndex,
        isCorrect,
        isMissed,
        sideChosen: choice,
      });

      const nextIndex = currentPromptIndex + 1;

      if (nextIndex < PROMPTS_PER_ROUND) {
        // Snappy transition to next prompt
        setCurrentPromptIndex(nextIndex);
      } else {
        // Round Finished!
        const summary = calculateImpulseSummary(nextResults, difficulty);
        setRoundSummary(summary);
        setPhase('result');

        // Scoring and streak calculations
        const pointsAdded = summary.pointsEarned;
        let newStreak = consecutiveWins;
        let finalSessionScore = sessionScore + pointsAdded;

        // Streak check: win if accuracy >= 75%
        if (summary.accuracy >= 75) {
          newStreak = consecutiveWins + 1;
          playSuccessChime();
        } else {
          // Streak broken: penalty deduction
          if (consecutiveWins > 0) {
            const penalty = calculateStreakPenalty(consecutiveWins);
            finalSessionScore = Math.max(0, finalSessionScore - penalty);
          }
          newStreak = 0;
        }

        setSessionScore(finalSessionScore);
        setConsecutiveWins(newStreak);

        // Update all-time records
        const newBestScore = Math.max(allTimeStats.highestScore, finalSessionScore);
        const newBestStreak = Math.max(allTimeStats.bestStreak, newStreak);
        const updatedAllTime = {
          highestScore: newBestScore,
          bestStreak: newBestStreak,
        };
        setAllTimeStats(updatedAllTime);
        saveAllTimeStats('impulse_match', updatedAllTime);

        // Update daily stats
        const daily = loadDailyStats('impulse_match');
        daily.gamesPlayedToday += 1;
        daily.bestPerfectStreakToday = Math.max(
          daily.bestPerfectStreakToday,
          newStreak
        );
        saveDailyStats('impulse_match', daily);

        // Check personal best notification
        checkPersonalBest(finalSessionScore);
      }
    },
    [
      currentPromptIndex,
      roundData.prompts,
      activeConfig,
      promptResults,
      difficulty,
      consecutiveWins,
      sessionScore,
      allTimeStats,
      checkPersonalBest,
    ]
  );

  // Difficulty change: locked during active round
  const handleChangeDifficulty = (newDiff: Difficulty) => {
    if (phase === 'playing') return;
    if (newDiff === difficulty) return;
    setDifficulty(newDiff);
    const nextRound = phase === 'result' ? roundNumber + 1 : roundNumber;
    startNewRound(newDiff, nextRound);
  };

  // Stop / Skip current round:
  // Immediately stops current 12-prompt sequence, cancels active timers,
  // resets round state, and returns to ready/start state (remember phase)
  // while keeping the selected difficulty unchanged.
  const handleStopGame = () => {
    startNewRound(difficulty, roundNumber);
  };

  // Next round
  const handleNextRound = () => {
    startNewRound(difficulty, roundNumber + 1);
  };

  // When leaving page, session score and active streak reset to 0
  const handleBackToGames = () => {
    setSessionScore(0);
    setConsecutiveWins(0);
    onBack();
  };

  const isDifficultyLocked = phase === 'playing';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Top compact game header: ← Games | Score 120 | Round 1 | Difficulty Selector | Stop/Skip | 🔥 0 | Volume */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 py-1.5 border-b border-[#E5D7BF]">
        <button
          onClick={handleBackToGames}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs sm:text-base font-semibold text-[#5E3F27] hover:bg-[#EFE4D0] border border-[#DECDB3] transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Games</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
          {/* Score badge with subtle personal best highlight */}
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

          {/* Header Difficulty Selector (Single always-visible selector, locked during active round) */}
          <div
            className={`flex items-center gap-0.5 sm:gap-1 bg-[#EFE3CE] p-1 rounded-lg border border-[#DECDB3] transition-opacity ${
              isDifficultyLocked ? 'opacity-70' : ''
            }`}
          >
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
              const isSelected = difficulty === d;
              return (
                <button
                  key={d}
                  type="button"
                  disabled={isDifficultyLocked}
                  onClick={() => handleChangeDifficulty(d)}
                  className={`px-2 py-0.5 rounded-md text-xs sm:text-sm font-bold transition-all capitalize ${
                    isDifficultyLocked
                      ? isSelected
                        ? 'bg-[#8B5829] text-white cursor-not-allowed opacity-90'
                        : 'text-[#8A6A4E] cursor-not-allowed opacity-40'
                      : isSelected
                      ? 'bg-[#8B5829] text-white shadow-xs cursor-pointer'
                      : 'text-[#6B4E36] hover:bg-[#E5D5BD] cursor-pointer'
                  }`}
                  title={
                    isDifficultyLocked
                      ? 'Difficulty is locked during active round'
                      : `Play on ${d} difficulty`
                  }
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Stop / Skip Button next to difficulty selector (active during 12-prompt sequence) */}
          {phase === 'playing' && (
            <button
              type="button"
              onClick={handleStopGame}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold bg-[#FAF0E1] hover:bg-[#F5DEC7] active:scale-95 text-[#8C3A1A] border border-[#E5C7A7] shadow-xs transition-all cursor-pointer"
              title="Stop current round and return to ready state"
            >
              <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-[#8C3A1A]" />
              <span>Stop / Skip</span>
            </button>
          )}

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

      {/* Main Game Card Layout */}
      <div className="py-2">
        {phase === 'remember' && (
          <RememberPhase
            leftObjects={roundData.leftObjects}
            rightObjects={roundData.rightObjects}
            isAssetsLoaded={isAssetsLoaded}
            onReady={handleReady}
          />
        )}

        {phase === 'playing' && (
          <ActivePhase
            prompts={roundData.prompts}
            currentPromptIndex={currentPromptIndex}
            config={activeConfig}
            recentFeedback={recentFeedback}
            historyResults={promptResults.map((r) => ({
              isCorrect: r.isCorrect,
              isMissed: r.isMissed,
            }))}
            onAnswer={handleAnswer}
            onStop={handleStopGame}
          />
        )}

        {phase === 'result' && roundSummary && (
          <ResultPhase
            summary={roundSummary}
            sessionScore={sessionScore}
            consecutiveWins={consecutiveWins}
            bestAllTimeScore={allTimeStats.highestScore}
            onNextRound={handleNextRound}
          />
        )}
      </div>
    </div>
  );
};
