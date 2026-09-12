import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Check, X, Clock, HelpCircle, Square } from 'lucide-react';
import { PromptItem, Side } from './logic';
import { ImpulseDifficultyConfig, PROMPTS_PER_ROUND } from './config';

interface ActivePhaseProps {
  prompts: PromptItem[];
  currentPromptIndex: number;
  config: ImpulseDifficultyConfig;
  recentFeedback: {
    promptIndex: number;
    isCorrect: boolean;
    isMissed: boolean;
    sideChosen: Side | null;
  } | null;
  historyResults: { isCorrect: boolean; isMissed: boolean }[];
  onAnswer: (choice: Side | null, responseTimeMs: number) => void;
  onStop?: () => void;
}

export const ActivePhase: React.FC<ActivePhaseProps> = ({
  prompts,
  currentPromptIndex,
  config,
  recentFeedback,
  historyResults,
  onAnswer,
  onStop,
}) => {
  const currentPrompt = prompts[currentPromptIndex];
  const [timeLeftMs, setTimeLeftMs] = useState<number>(
    config.promptDisplayMs + config.gracePeriodMs
  );
  const startTimeRef = useRef<number>(Date.now());
  const answeredRef = useRef<boolean>(false);
  const promptIndexRef = useRef<number>(currentPromptIndex);
  promptIndexRef.current = currentPromptIndex;

  const totalAllowedTime = config.promptDisplayMs + config.gracePeriodMs;

  const handleUserChoice = useCallback(
    (choice: Side | null) => {
      if (answeredRef.current) return;
      answeredRef.current = true;
      const elapsed = Date.now() - startTimeRef.current;
      onAnswer(choice, elapsed);
    },
    [onAnswer]
  );

  // Reset timer on new prompt
  useEffect(() => {
    answeredRef.current = false;
    startTimeRef.current = Date.now();
    setTimeLeftMs(totalAllowedTime);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, totalAllowedTime - elapsed);
      setTimeLeftMs(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (!answeredRef.current) {
          handleUserChoice(null); // Timeout -> missed
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [currentPromptIndex, totalAllowedTime, handleUserChoice]);

  // Keyboard controls: ArrowLeft and ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (answeredRef.current) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleUserChoice(0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleUserChoice(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUserChoice]);

  const timeFraction = Math.max(0, Math.min(1, timeLeftMs / totalAllowedTime));

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center space-y-4 sm:space-y-6 select-none animate-in fade-in duration-150">
      {/* Prompt Counter & Progress Dots */}
      <div className="w-full flex flex-col items-center gap-2">
        <div className="flex items-center justify-between w-full px-2">
          <span className="text-sm sm:text-base font-bold text-[#57391F] tracking-wide">
            Prompt {currentPromptIndex + 1} / {PROMPTS_PER_ROUND}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-[#825C3C]">
            Use buttons or ← → keys
          </span>
        </div>

        {/* 12 dots showing progression */}
        <div className="flex items-center justify-between w-full gap-1 sm:gap-1.5 px-1">
          {Array.from({ length: PROMPTS_PER_ROUND }).map((_, i) => {
            const hist = historyResults[i];
            const isCurrent = i === currentPromptIndex;

            let dotClass = 'bg-[#E3D4BC] border-[#D2BF9F]';
            if (hist) {
              if (hist.isCorrect) {
                dotClass = 'bg-[#408432] border-[#2E6B20] text-[#FFFDF9]';
              } else if (hist.isMissed) {
                dotClass = 'bg-[#CBD5E1] border-[#94A3B8] text-[#475569]';
              } else {
                dotClass = 'bg-[#D9531E] border-[#A8380C] text-[#FFFDF9]';
              }
            } else if (isCurrent) {
              dotClass = 'bg-[#8B5829] border-[#5E3814] ring-2 ring-[#EAA055] scale-110';
            }

            return (
              <div
                key={i}
                className={`flex-1 h-2 sm:h-2.5 rounded-full border transition-all duration-150 ${dotClass}`}
                title={`Prompt ${i + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Cadence Timer Bar */}
      <div className="w-full bg-[#E8DCBF] h-2 rounded-full overflow-hidden border border-[#D5C39F]">
        <div
          className={`h-full transition-all duration-75 ease-linear rounded-full ${
            timeFraction > 0.4
              ? 'bg-[#438734]'
              : timeFraction > 0.2
              ? 'bg-[#D9822B]'
              : 'bg-[#DC2626]'
          }`}
          style={{ width: `${timeFraction * 100}%` }}
        />
      </div>

      {/* Central Object Presentation Card */}
      <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px] rounded-3xl bg-[#FFFDF9] border-4 border-[#D8BE9B] shadow-[0_8px_24px_rgba(70,40,15,0.08)] flex flex-col items-center justify-center p-6 sm:p-8">
        {/* Subtle Object Image */}
        <div className="w-full h-full flex items-center justify-center">
          <img
            key={currentPrompt.object.id + '-' + currentPromptIndex}
            src={currentPrompt.object.image}
            alt={currentPrompt.object.altText}
            referrerPolicy="no-referrer"
            width={256}
            height={256}
            loading="eager"
            decoding="sync"
            className="max-w-[85%] max-h-[85%] object-contain drop-shadow-md select-none animate-in zoom-in-95 duration-100"
            draggable={false}
          />
        </div>

        {/* Clear Object Title Below Graphic */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-xl bg-[#FAF3E6]/90 border border-[#E2D2BC] text-sm sm:text-base font-bold text-[#3E2512] shadow-sm">
          {currentPrompt.object.name}
        </div>

        {/* Instant Micro-Feedback Overlay Badge (fade out immediately) */}
        {recentFeedback && (
          <div
            key={recentFeedback.promptIndex}
            className={`absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 animate-in zoom-in-90 duration-100 ${
              recentFeedback.isCorrect
                ? 'bg-[#E8F5E9] text-[#1E5F1E] border border-[#A5D6A7]'
                : recentFeedback.isMissed
                ? 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]'
                : 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]'
            }`}
          >
            {recentFeedback.isCorrect ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Correct!</span>
              </>
            ) : recentFeedback.isMissed ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Time Up</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 stroke-[3]" />
                <span>Wrong Side</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Primary Action Buttons: Large Left / Right */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full pt-1">
        {/* Left Button */}
        <button
          onClick={() => handleUserChoice(0)}
          className="group relative min-h-[68px] sm:min-h-[76px] rounded-2xl bg-[#2A657D] hover:bg-[#1E5064] active:scale-[0.98] text-[#FFFDF9] border-2 border-[#194354] shadow-[0_4px_12px_rgba(25,67,84,0.22)] transition-all flex items-center justify-center gap-2.5 sm:gap-3 px-4 py-3 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2A657D]"
          aria-label="Choose Left"
        >
          <div className="p-1.5 sm:p-2 rounded-xl bg-[#FFF]/15 group-hover:bg-[#FFF]/25 transition-colors">
            <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl sm:text-2xl font-bold tracking-wide leading-none">
              LEFT
            </span>
            <span className="text-[11px] sm:text-xs text-[#D1E6EF] font-semibold mt-0.5">
              ← Key
            </span>
          </div>
        </button>

        {/* Right Button */}
        <button
          onClick={() => handleUserChoice(1)}
          className="group relative min-h-[68px] sm:min-h-[76px] rounded-2xl bg-[#A24D1B] hover:bg-[#853B11] active:scale-[0.98] text-[#FFFDF9] border-2 border-[#6D300C] shadow-[0_4px_12px_rgba(162,77,27,0.22)] transition-all flex items-center justify-center gap-2.5 sm:gap-3 px-4 py-3 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#A24D1B]"
          aria-label="Choose Right"
        >
          <div className="flex flex-col text-right">
            <span className="text-xl sm:text-2xl font-bold tracking-wide leading-none">
              RIGHT
            </span>
            <span className="text-[11px] sm:text-xs text-[#F8DAC4] font-semibold mt-0.5">
              Key →
            </span>
          </div>
          <div className="p-1.5 sm:p-2 rounded-xl bg-[#FFF]/15 group-hover:bg-[#FFF]/25 transition-colors">
            <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
          </div>
        </button>
      </div>

      {/* Stop / Skip Game Option */}
      {onStop && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={onStop}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-[#8C3A1A] bg-[#FAF0E1] hover:bg-[#F5DEC7] active:scale-95 border border-[#E5C7A7] shadow-xs transition-all cursor-pointer"
            title="Stop current 12-prompt sequence and return to start"
          >
            <Square className="w-3.5 h-3.5 fill-current text-[#8C3A1A]" />
            <span>Stop / Skip Round</span>
          </button>
        </div>
      )}
    </div>
  );
};
