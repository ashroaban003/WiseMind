import React from 'react';
import { Lock, Unlock, KeyRound, Sparkles } from 'lucide-react';

export type LockerPhase = 'ready' | 'showing' | 'input' | 'correct' | 'incorrect';

interface LockerVaultProps {
  phase: LockerPhase;
  currentDisplayDigit: number | null;
  displayIndex: number;
  totalDigits: number;
  enteredDigits: number[];
  revealedCode: number[];
}

export const LockerVault: React.FC<LockerVaultProps> = ({
  phase,
  currentDisplayDigit,
  displayIndex,
  totalDigits,
  enteredDigits,
  revealedCode,
}) => {
  const isUnlocked = phase === 'correct';
  const isIncorrect = phase === 'incorrect';

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm mx-auto">
      {/* Compact Wooden Safe / Locker Body */}
      <div
        className={`relative rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all duration-300 border-3 sm:border-4 ${
          isUnlocked
            ? 'bg-gradient-to-b from-[#FAF5EB] via-[#F4EDE0] to-[#E9DEC9] border-[#6DA359] shadow-[0_8px_24px_rgba(40,120,40,0.14)]'
            : isIncorrect
            ? 'bg-gradient-to-b from-[#FBF2EA] via-[#F4E6D8] to-[#E8D4C0] border-[#C2825D] shadow-[0_6px_20px_rgba(100,50,20,0.1)]'
            : 'bg-gradient-to-b from-[#F6EDE0] via-[#EFE3CF] to-[#E3D1B7] border-[#9A6739] shadow-[0_8px_24px_rgba(70,40,15,0.1)]'
        }`}
      >
        {/* Brass corner rivet accents */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#B88746] border border-[#855B25]" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#B88746] border border-[#855B25]" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#B88746] border border-[#855B25]" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#B88746] border border-[#855B25]" />

        {/* Safe Top Status Header */}
        <div className="flex items-center justify-between border-b border-[#D8C2A2] pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 text-[#644222] font-semibold text-xs sm:text-sm">
            <KeyRound className="w-4 h-4 text-[#9A6739]" />
            <span>Combination</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#E8D8BF] text-[#55361A] border border-[#D0BD9F]">
            {phase === 'showing' ? (
              <span className="text-[#8B5829]">
                Digit {Math.min(totalDigits, displayIndex + 1)} / {totalDigits}
              </span>
            ) : (
              <span>{totalDigits} Digits</span>
            )}
          </div>
        </div>

        {/* Central Dial & Combination Aperture */}
        <div className="flex flex-col items-center justify-center my-1">
          {/* Circular Bezel Frame */}
          <div
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-transform duration-500 shadow-[inset_0_3px_8px_rgba(0,0,0,0.16),0_4px_12px_rgba(80,50,20,0.12)] ${
              isUnlocked
                ? 'bg-gradient-to-tr from-[#E3D4B6] via-[#FAF3E6] to-[#E3D4B6] border-4 sm:border-6 border-[#6DA359] rotate-12'
                : 'bg-gradient-to-tr from-[#CBB28C] via-[#EADBBD] to-[#C4A87F] border-4 sm:border-6 border-[#996536]'
            }`}
          >
            {/* Dial Lock Icon indicator */}
            <div className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-[#4A2F17] text-[#FFF7E8] text-[10px] font-semibold shadow-xs flex items-center gap-1">
              {isUnlocked ? (
                <>
                  <Unlock className="w-3 h-3 text-[#88D96E]" />
                  <span className="text-[#A2EF8B]">Open</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-[#E6C07B]" />
                  <span>Locked</span>
                </>
              )}
            </div>

            {/* Center Viewing Screen */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-[#FFFDF9] border-2 border-[#B59670] shadow-[inset_0_2px_6px_rgba(60,35,10,0.12)] flex flex-col items-center justify-center p-1.5 overflow-hidden">
              {/* Ready State */}
              {phase === 'ready' && (
                <div className="text-center space-y-0.5 animate-in fade-in duration-200">
                  <div className="w-7 h-7 mx-auto rounded-full bg-[#F2E5D0] flex items-center justify-center text-[#8B5829]">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-[#6C4B2E] block uppercase tracking-wider">
                    Ready
                  </span>
                </div>
              )}

              {/* Showing Digit State */}
              {phase === 'showing' && (
                <div className="w-full h-full flex items-center justify-center">
                  {currentDisplayDigit !== null ? (
                    <span className="font-serif-title text-4xl sm:text-5xl font-black text-[#261508] scale-100 animate-in zoom-in-75 duration-100 select-none">
                      {currentDisplayDigit}
                    </span>
                  ) : (
                    <span className="text-3xl text-[#C4B298] font-light select-none">
                      —
                    </span>
                  )}
                </div>
              )}

              {/* Input State: Masked Dots */}
              {phase === 'input' && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[84px]">
                  {Array.from({ length: totalDigits }).map((_, i) => {
                    const isFilled = i < enteredDigits.length;
                    const isNext = i === enteredDigits.length;
                    return (
                      <div
                        key={i}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isFilled
                            ? 'bg-[#3B2211] text-[#FFF7E8] shadow-2xs scale-105'
                            : isNext
                            ? 'border-2 border-dashed border-[#8B5829] bg-[#F7EFE1] animate-pulse'
                            : 'border border-[#D4C3A9] bg-[#EFE4D2]'
                        }`}
                      >
                        {isFilled ? (
                          <div className="w-2 h-2 rounded-full bg-[#E5B56D]" />
                        ) : (
                          <span className="text-[10px] text-[#9E8367] font-semibold">
                            ·
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Correct State: Display revealed code */}
              {isUnlocked && (
                <div className="text-center space-y-0.5 animate-in zoom-in-90 duration-200">
                  <div className="flex items-center justify-center gap-1 text-[#24631D]">
                    <Sparkles className="w-3 h-3 text-[#3E8B2A]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Unlocked
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-0.5 flex-wrap">
                    {revealedCode.map((digit, idx) => (
                      <span
                        key={idx}
                        className="w-4.5 h-5.5 rounded bg-[#E4F3DF] text-[#1E5616] font-bold text-xs flex items-center justify-center border border-[#97D28F]"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Incorrect State: Gentle lock */}
              {isIncorrect && (
                <div className="text-center space-y-0.5 text-[#8B4829] animate-in fade-in duration-150">
                  <Lock className="w-5 h-5 mx-auto text-[#A55227]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider block">
                    Locked
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phase Guidance Sub-Message */}
        <div className="text-center mt-1">
          {phase === 'ready' && (
            <p className="text-xs text-[#6B4B2E] font-medium">
              Tap “I’m Ready” to watch the code appear.
            </p>
          )}
          {phase === 'showing' && (
            <p className="text-xs text-[#52351C] font-semibold animate-pulse">
              Watch closely... one number at a time!
            </p>
          )}
          {phase === 'input' && (
            <p className="text-xs text-[#6B4B2E] font-medium">
              {enteredDigits.length === 0
                ? 'Type the numbers in the order you saw them.'
                : `${enteredDigits.length} / ${totalDigits} entered`}
            </p>
          )}
          {isUnlocked && (
            <p className="text-xs text-[#24631D] font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-[#3E8B2A]" />
              Vault door unlocked!
            </p>
          )}
          {isIncorrect && (
            <p className="text-xs text-[#8B4829] font-medium">
              Almost! Let’s try another code.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
