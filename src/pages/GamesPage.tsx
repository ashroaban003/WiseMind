import React, { useState } from 'react';
import { Sparkles, Filter } from 'lucide-react';
import { gameRegistry } from '../games/registry';
import { GameCard } from '../components/games/GameCard';
import { GameCategory } from '../types';

interface GamesPageProps {
  onNavigate: (path: string) => void;
}

export const GamesPage: React.FC<GamesPageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories: ('All' | GameCategory)[] = ['All', 'Memory', 'Attention', 'Visual'];

  const filteredGames =
    selectedCategory === 'All'
      ? gameRegistry
      : gameRegistry.filter((g) => g.category === selectedCategory);

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAE0CA] text-[#543820] text-base font-semibold border border-[#D5C2A4]">
          <Sparkles className="w-5 h-5 text-[#8B5829]" />
          <span>Tabletop Game Collection</span>
        </div>

        <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2C190B] tracking-tight">
          Mind Games & Puzzles
        </h1>
      </div>

      {/* Category Filter Pills (min 48px touch targets) */}
      <div className="flex items-center justify-center flex-wrap gap-3 pt-2">
        <span className="text-lg font-semibold text-[#4F3622] mr-2 flex items-center gap-1.5">
          <Filter className="w-5 h-5 text-[#8B5829]" />
          Categories:
        </span>
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`min-h-[48px] px-6 py-2.5 rounded-2xl text-lg font-medium transition-all select-none cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8B5829] ${
                isSelected
                  ? 'bg-[#8B5829] text-[#FFFDF9] shadow-[0_2px_8px_rgba(90,50,20,0.3)] font-semibold'
                  : 'bg-[#EFE5D2] text-[#4F3622] hover:bg-[#E5D7BE] border border-[#DAC8AC]'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Registry Games Grid */}
      <div className="space-y-6">
        <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2E1A0C]">
          {selectedCategory === 'All' ? 'All Activities' : `${selectedCategory} Activities`}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} onSelectGame={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  );
};
