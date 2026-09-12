import React from 'react';
import { Difficulty } from '../../types';

export interface DifficultyOption {
  difficulty: Difficulty;
  label?: string;
  sublabel?: string;
}

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  onChangeDifficulty: (difficulty: Difficulty) => void;
  options?: DifficultyOption[];
  disabled?: boolean;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  currentDifficulty,
  onChangeDifficulty,
  options,
  disabled = false,
}) => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  const items: DifficultyOption[] =
    options ||
    difficulties.map((diff) => ({
      difficulty: diff,
      label: diff === 'easy' ? 'Easy' : diff === 'medium' ? 'Medium' : 'Hard',
    }));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <span className="text-lg font-semibold text-[#4A321E] mr-1">
        Difficulty Level:
      </span>
      <div
        className="inline-flex p-1.5 rounded-2xl bg-[#EADDC6] border border-[#D5C1A0] shadow-inner"
        role="radiogroup"
        aria-label="Select Game Difficulty"
      >
        {items.map((item) => {
          const diff = item.difficulty;
          const isSelected = currentDifficulty === diff;

          return (
            <button
              key={diff}
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChangeDifficulty(diff)}
              className={`min-h-[48px] px-5 sm:px-6 py-2 rounded-xl text-lg font-medium transition-all select-none cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8B5829] ${
                isSelected
                  ? 'bg-[#8B5829] text-[#FFFDF9] shadow-[0_2px_8px_rgba(90,50,20,0.3)] font-semibold'
                  : 'text-[#543922] hover:bg-[#F2E8D7] hover:text-[#2E1A0C]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center">
                <span className="capitalize">{item.label || diff}</span>
                {item.sublabel && (
                  <span
                    className={`text-xs ${
                      isSelected ? 'text-[#F3E6D0]' : 'text-[#7D5E40]'
                    }`}
                  >
                    {item.sublabel}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

