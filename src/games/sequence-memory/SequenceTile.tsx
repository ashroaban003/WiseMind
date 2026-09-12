import React from 'react';
import { Check, X } from 'lucide-react';

export type SequenceTileStatus =
  | 'normal'
  | 'playback-active'
  | 'user-correct'
  | 'user-wrong'
  | 'revealed';

interface SequenceTileProps {
  index: number;
  status: SequenceTileStatus;
  stepNumber?: number; // 1-based order in sequence if displayed
  onClick?: () => void;
  disabled?: boolean;
}

export const SequenceTile: React.FC<SequenceTileProps> = ({
  index,
  status,
  stepNumber,
  onClick,
  disabled = false,
}) => {
  const isFlipped =
    status === 'playback-active' ||
    status === 'user-correct' ||
    status === 'user-wrong';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  let ariaLabel = `Wooden Block ${index + 1}`;
  if (status === 'playback-active') ariaLabel += ', chiming in sequence';
  if (status === 'user-correct') ariaLabel += ', correct step';
  if (status === 'user-wrong') ariaLabel += ', incorrect step';

  return (
    <div className="relative w-full aspect-square perspective-800 select-none">
      <button
        type="button"
        role="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={`relative w-full h-full rounded-2xl sm:rounded-3xl transition-transform duration-300 preserve-3d cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8B5829] ${
          isFlipped ? 'rotate-y-180' : ''
        } ${
          disabled
            ? 'cursor-default'
            : 'hover:scale-[1.02] active:scale-[0.97] hover:shadow-lg'
        }`}
      >
        {/* FRONT FACE (Standard Wooden Block) */}
        <div className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl backface-hidden flex flex-col items-center justify-center wood-texture border border-[#EAC496]/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_8px_rgba(60,30,10,0.25)] transition-all">
          {/* Subtle wood grain reflection line */}
          <div className="absolute top-1 left-2 right-2 h-1/3 bg-white/10 rounded-t-2xl pointer-events-none" />

          {/* Gentle center tactile dot */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#6A401C]/40 border border-[#FFF8EB]/20 pointer-events-none" />

          {/* Replay or reveal step badge if provided */}
          {status === 'revealed' && stepNumber !== undefined && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#8B5829]/75 rounded-2xl sm:rounded-3xl animate-in zoom-in-75">
              <span className="w-10 h-10 rounded-full bg-[#FFFDF9] text-[#6E3F17] font-bold text-xl flex items-center justify-center shadow-md">
                {stepNumber}
              </span>
            </div>
          )}
        </div>

        {/* BACK FACE (Light / Ivory Face when flipped) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl rotate-y-180 backface-hidden flex flex-col items-center justify-center transition-all bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E0] to-[#EFE2C6] border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_6px_14px_rgba(80,50,20,0.18)] ${
            status === 'playback-active'
              ? 'border-[#8B5829] ring-4 ring-[#8B5829]/60 shadow-[0_0_20px_rgba(184,129,77,0.4)]'
              : ''
          } ${
            status === 'user-correct'
              ? 'border-[#2E7D32] ring-4 ring-[#2E7D32] shadow-[0_0_20px_rgba(46,125,50,0.4)] bg-gradient-to-br from-[#F5FFF4] to-[#E2F7E1]'
              : ''
          } ${
            status === 'user-wrong'
              ? 'border-[#DC2626] ring-4 ring-[#DC2626] shadow-[0_0_20px_rgba(220,38,38,0.4)] bg-gradient-to-br from-[#FFF5F5] to-[#FCE2E2]'
              : 'border-[#DEC7A0]'
          }`}
        >
          {/* Status 1: Active Playback during sequence demonstration */}
          {status === 'playback-active' && (
            <div className="flex flex-col items-center justify-center gap-1.5 animate-in zoom-in-90 duration-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#EAD6B3] border-2 border-[#8B5829] flex items-center justify-center shadow-inner">
                <div className="w-4 h-4 rounded-full bg-[#8B5829] animate-pulse" />
              </div>
              {stepNumber !== undefined && (
                <span className="text-xs sm:text-sm font-bold text-[#6E3F17] uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md">
                  Step {stepNumber}
                </span>
              )}
            </div>
          )}

          {/* Status 2: User Correct Tap */}
          {status === 'user-correct' && (
            <div className="flex flex-col items-center justify-center gap-1 animate-in zoom-in-90 duration-150">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shadow-lg border-2 border-white">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#1B5E20] bg-white/90 px-2 py-0.5 rounded-md">
                Good!
              </span>
            </div>
          )}

          {/* Status 3: User Wrong Tap (Friendly, gentle feedback) */}
          {status === 'user-wrong' && (
            <div className="flex flex-col items-center justify-center gap-1 animate-in zoom-in-90 duration-150">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#DC2626] text-white flex items-center justify-center shadow-lg border-2 border-white">
                <X className="w-7 h-7 stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#991B1B] bg-white/90 px-2 py-0.5 rounded-md">
                Almost!
              </span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
};
