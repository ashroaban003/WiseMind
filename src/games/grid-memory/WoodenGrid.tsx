import React from 'react';
import { WoodenTile } from './WoodenTile';
import { GamePhase } from '../../types';

interface WoodenGridProps {
  size: number;
  highlightedIndexes: number[];
  userSelectedIndexes: number[];
  phase: GamePhase;
  onTileClick: (index: number) => void;
  disabled: boolean;
}

export const WoodenGrid: React.FC<WoodenGridProps> = ({
  size,
  highlightedIndexes,
  userSelectedIndexes,
  phase,
  onTileClick,
  disabled,
}) => {
  const totalCells = size * size;
  const highlightedSet = new Set(highlightedIndexes);
  const selectedSet = new Set(userSelectedIndexes);

  // Dynamic grid template columns
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
  };

  // Gap sizing depending on grid density
  const gapClass = {
    3: 'gap-3 sm:gap-4 p-3 sm:p-5',
    4: 'gap-2 sm:gap-3 p-2.5 sm:p-4',
    5: 'gap-1.5 sm:gap-2.5 p-2 sm:p-3',
  }[size as 3 | 4 | 5] || 'gap-2.5 p-3';

  return (
    <div className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] mx-auto">
      {/* Outer Wooden Tray Frame */}
      <div className="relative rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 bg-gradient-to-b from-[#8B5E34] via-[#74451C] to-[#543011] shadow-[0_12px_28px_rgba(50,25,8,0.22),inset_0_2px_4px_rgba(255,255,255,0.15)] border-3 sm:border-4 border-[#A36F3D]">
        {/* Inner Wood Board Recess */}
        <div
          style={gridStyle}
          className={`grid aspect-square w-full rounded-xl sm:rounded-2xl bg-[#E6D7BD] shadow-[inset_0_4px_12px_rgba(40,20,5,0.25)] border-2 border-[#BEA882] ${gapClass}`}
          role="grid"
          aria-label={`${size} by ${size} wooden puzzle grid`}
        >
          {Array.from({ length: totalCells }, (_, index) => {
            const row = Math.floor(index / size);
            const col = index % size;
            const isHighlighted = highlightedSet.has(index);
            const isSelected = selectedSet.has(index);

            return (
              <div key={index} role="gridcell" className="w-full h-full flex items-center justify-center">
                <WoodenTile
                  index={index}
                  row={row}
                  col={col}
                  phase={phase}
                  isHighlighted={isHighlighted}
                  isSelected={isSelected}
                  onClick={onTileClick}
                  disabled={disabled}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
