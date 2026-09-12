import React from 'react';
import { Delete, SkipForward } from 'lucide-react';

interface KeypadProps {
  onDigitPress: (digit: number) => void;
  onBackspace: () => void;
  onSkip: () => void;
  disabled?: boolean;
  canBackspace?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigitPress,
  onBackspace,
  onSkip,
  disabled = false,
  canBackspace = false,
}) => {
  const digitsGrid = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  return (
    <div className="w-full max-w-[270px] sm:max-w-xs mx-auto space-y-1.5 sm:space-y-2 select-none">
      {/* 3x3 Digit Grid (1 to 9) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {digitsGrid.flat().map((num) => (
          <button
            key={num}
            type="button"
            id={`locker-key-${num}`}
            disabled={disabled}
            onClick={() => onDigitPress(num)}
            className="h-11 sm:h-12 rounded-xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF3E6] to-[#EFE1CB] border-2 border-[#CDAE84] hover:border-[#8B5829] active:scale-95 active:bg-[#E8D4B8] text-[#2C190B] font-serif-title text-2xl sm:text-3xl font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {num}
          </button>
        ))}
      </div>

      {/* Bottom Row: Backspace, 0, Skip */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 items-center">
        {/* Backspace Button */}
        <button
          type="button"
          id="locker-key-backspace"
          disabled={disabled || !canBackspace}
          onClick={onBackspace}
          aria-label="Delete last number"
          title="Delete last number"
          className="h-11 sm:h-12 rounded-xl bg-[#F4E8D5] border-2 border-[#D3BE9C] hover:border-[#9A6A3B] active:scale-95 text-[#634324] shadow-2xs transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Delete className="w-4 h-4 text-[#7E552E]" />
          <span className="text-[10px] font-semibold leading-none">Erase</span>
        </button>

        {/* Number 0 */}
        <button
          type="button"
          id="locker-key-0"
          disabled={disabled}
          onClick={() => onDigitPress(0)}
          className="h-11 sm:h-12 rounded-xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF3E6] to-[#EFE1CB] border-2 border-[#CDAE84] hover:border-[#8B5829] active:scale-95 active:bg-[#E8D4B8] text-[#2C190B] font-serif-title text-2xl sm:text-3xl font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          0
        </button>

        {/* Skip Button */}
        <button
          type="button"
          id="locker-key-skip"
          disabled={disabled}
          onClick={onSkip}
          aria-label="Skip to another code"
          title="Skip to another code"
          className="h-11 sm:h-12 rounded-xl bg-[#F4E8D5] border-2 border-[#D3BE9C] hover:border-[#9A6A3B] active:scale-95 text-[#634324] shadow-2xs transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-4 h-4 text-[#7E552E]" />
          <span className="text-[10px] font-semibold leading-none">Skip</span>
        </button>
      </div>
    </div>
  );
};
