import React from 'react';
import { Play, Clock, Lock } from 'lucide-react';
import { GameDefinition } from '../../types';
import { Button } from '../common/Button';

interface GameCardProps {
  game: GameDefinition;
  onSelectGame: (path: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelectGame }) => {
  return (
    <div
      className={`group relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all duration-200 border-2 ${
        game.available
          ? 'bg-[#FBF6EC] border-[#D6A86E] hover:border-[#8B5829] shadow-[0_6px_20px_rgba(100,60,20,0.08)] hover:shadow-[0_12px_28px_rgba(100,60,20,0.14)]'
          : 'bg-[#F4EDE0]/70 border-[#DBC9AC] opacity-85'
      }`}
    >
      <div>
        {/* Top bar: Category + Optional Coming Soon Badge */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-base font-medium bg-[#EFE3CD] text-[#543820] border border-[#DDCBB0]">
            {game.category}
          </span>

          {!game.available && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-[#EBE4D5] text-[#735A42] border border-[#DACBB5]">
              <Lock className="w-3.5 h-3.5" />
              Coming Soon
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2E1C0F] mb-3 leading-snug">
          {game.title}
        </h3>

        {/* Description */}
        <p className="text-lg sm:text-xl text-[#5E442F] leading-relaxed mb-6">
          {game.description}
        </p>
      </div>

      {/* Card Footer: Metadata & Action */}
      <div className="pt-6 border-t border-[#E8D9C0] flex items-center justify-between gap-4">
        {game.estimatedMinutes && (
          <div className="flex items-center gap-2 text-base text-[#75593F]">
            <Clock className="w-5 h-5 text-[#8B5829]" />
            <span>~{game.estimatedMinutes} mins</span>
          </div>
        )}

        {game.available ? (
          <Button
            variant="wood"
            size="md"
            onClick={() => onSelectGame(game.path)}
            icon={<Play className="w-5 h-5 fill-current" />}
            className="w-full sm:w-auto"
            aria-label={`Play ${game.title}`}
          >
            Play Now
          </Button>
        ) : (
          <div className="px-5 py-2.5 rounded-xl bg-[#EBE4D5] text-[#735A42] font-medium text-base border border-[#DACBB5] select-none text-center">
            Coming Soon
          </div>
        )}
      </div>
    </div>
  );
};
