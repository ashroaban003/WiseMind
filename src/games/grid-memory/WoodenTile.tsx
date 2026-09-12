import React from 'react';
import { Check, X, CircleDot } from 'lucide-react';
import { GamePhase } from '../../types';

export type TileVisualStatus =
  | 'normal'
  | 'preview-highlighted'
  | 'selected'
  | 'result-correct'
  | 'result-wrong'
  | 'result-missed';

interface WoodenTileProps {
  index: number;
  row: number;
  col: number;
  phase: GamePhase;
  isHighlighted: boolean;
  isSelected: boolean;
  onClick: (index: number) => void;
  disabled: boolean;
}

export const WoodenTile: React.FC<WoodenTileProps> = ({
  index,
  row,
  col,
  phase,
  isHighlighted,
  isSelected,
  onClick,
  disabled,
}) => {
  // Determine tile visual status
  let visualStatus: TileVisualStatus = 'normal';

  if (phase === 'preview') {
    visualStatus = isHighlighted ? 'preview-highlighted' : 'normal';
  } else if (phase === 'playing') {
    visualStatus = isSelected ? 'selected' : 'normal';
  } else if (phase === 'result') {
    if (isSelected && isHighlighted) {
      visualStatus = 'result-correct';
    } else if (isSelected && !isHighlighted) {
      visualStatus = 'result-wrong';
    } else if (!isSelected && isHighlighted) {
      // Missed tile automatically flips to reveal itself
      visualStatus = 'result-missed';
    } else {
      visualStatus = 'normal';
    }
  }

  // Flipped when: preview highlight, player selected, or result outcome (correct, wrong, or revealed missed)
  const isFlipped =
    visualStatus === 'preview-highlighted' ||
    visualStatus === 'selected' ||
    visualStatus === 'result-correct' ||
    visualStatus === 'result-wrong' ||
    visualStatus === 'result-missed';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(index);
    }
  };

  // Accessible Label
  let ariaLabel = `Row ${row + 1}, Column ${col + 1}, wooden block`;
  if (phase === 'preview' && isHighlighted) {
    ariaLabel += ', highlighted light block';
  } else if (phase === 'playing' && isSelected) {
    ariaLabel += ', selected block (tap to deselect)';
  } else if (phase === 'result') {
    if (visualStatus === 'result-correct') ariaLabel += ', correctly remembered light block';
    if (visualStatus === 'result-wrong') ariaLabel += ', wrong selection (was not light)';
    if (visualStatus === 'result-missed') ariaLabel += ', missed light block';
  }

  return (
    <div className="relative w-full h-full aspect-square perspective-800 select-none">
      <button
        type="button"
        tabIndex={disabled && phase !== 'result' ? -1 : 0}
        disabled={disabled}
        onClick={() => onClick(index)}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        className={`relative w-full h-full rounded-2xl sm:rounded-3xl transition-transform duration-300 preserve-3d cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8B5829] ${
          isFlipped ? 'rotate-y-180' : ''
        } ${
          phase === 'playing' && isSelected
            ? 'scale-[0.98]'
            : ''
        } ${disabled ? 'cursor-default' : 'hover:scale-[1.02] active:scale-[0.97]'}`}
      >
        {/* FRONT FACE (Normal Wooden Block) */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl backface-hidden flex items-center justify-center wood-texture border border-[#EAC496]/50 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_8px_rgba(60,30,10,0.25)]"
        >
          {/* Subtle wood grain reflection line */}
          <div className="absolute top-1 left-2 right-2 h-1/3 bg-white/10 rounded-t-2xl pointer-events-none" />

          {/* Discreet center tactile dot */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#6A401C]/40 border border-[#FFF8EB]/20 pointer-events-none" />
        </div>

        {/* BACK FACE (Light / White Face: Preview, Selected, or Evaluated Result) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl rotate-y-180 backface-hidden flex flex-col items-center justify-center transition-all bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E0] to-[#EFE2C6] border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_6px_14px_rgba(80,50,20,0.18)] ${
            visualStatus === 'selected'
              ? 'border-[#8B5829] ring-4 ring-[#8B5829]/60 shadow-[0_6px_16px_rgba(116,69,28,0.25)]'
              : 'border-[#DEC7A0]'
          } ${
            visualStatus === 'result-correct'
              ? 'border-[#2E7D32] ring-4 ring-[#2E7D32] shadow-[0_0_16px_rgba(46,125,50,0.35)] bg-gradient-to-br from-[#F5FFF4] to-[#E2F7E1]'
              : ''
          } ${
            visualStatus === 'result-wrong'
              ? 'border-[#DC2626] ring-4 ring-[#DC2626] shadow-[0_0_16px_rgba(220,38,38,0.35)] bg-gradient-to-br from-[#FFF5F5] to-[#FCE2E2]'
              : ''
          } ${
            visualStatus === 'result-missed'
              ? 'border-[#D97706] ring-4 ring-[#D97706] ring-dashed shadow-[0_0_16px_rgba(217,119,6,0.35)] bg-gradient-to-br from-[#FFFDF0] to-[#FEF3C7]'
              : ''
          }`}
        >
          {/* 1. Preview State indicator */}
          {visualStatus === 'preview-highlighted' && (
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#EAD6B3]/70 border border-[#D5BE97] flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-[#B8814D]" />
            </div>
          )}

          {/* 2. Playing Phase: User Selected State (White side flipped with tap check) */}
          {visualStatus === 'selected' && (
            <div className="flex flex-col items-center justify-center gap-1 animate-in zoom-in-75 duration-150">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#8B5829] text-white flex items-center justify-center shadow-md">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#6E3F17] tracking-wider uppercase">
                Selected
              </span>
            </div>
          )}

          {/* 3. Result: Correct Selection */}
          {visualStatus === 'result-correct' && (
            <div className="flex flex-col items-center justify-center gap-1 animate-in zoom-in-90 duration-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shadow-lg border-2 border-white">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#1B5E20] bg-white/90 px-2 py-0.5 rounded-md shadow-xs">
                Correct
              </span>
            </div>
          )}

          {/* 4. Result: Wrong Selection (User selected, but was not highlighted) */}
          {visualStatus === 'result-wrong' && (
            <div className="flex flex-col items-center justify-center gap-1 animate-in zoom-in-90 duration-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#DC2626] text-white flex items-center justify-center shadow-lg border-2 border-white">
                <X className="w-7 h-7 stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#991B1B] bg-white/90 px-2 py-0.5 rounded-md shadow-xs">
                Wrong
              </span>
            </div>
          )}

          {/* 5. Result: Missed Tile (User missed it, flipped once automatically to reveal) */}
          {visualStatus === 'result-missed' && (
            <div className="flex flex-col items-center justify-center gap-1 animate-in zoom-in-90 duration-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#D97706] text-white flex items-center justify-center shadow-lg border-2 border-white">
                <CircleDot className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#92400E] bg-white/90 px-2 py-0.5 rounded-md shadow-xs">
                Missed
              </span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
};

