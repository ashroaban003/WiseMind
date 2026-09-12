import React from 'react';
import { Play, Compass } from 'lucide-react';
import { Button } from '../components/common/Button';
import { getAvailableGames } from '../games/registry';

interface HowItWorksPageProps {
  onNavigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const handleStartPlaying = () => {
    const available = getAvailableGames();
    if (available.length === 0) {
      onNavigate('/games');
      return;
    }
    const randomIndex = Math.floor(Math.random() * available.length);
    onNavigate(available[randomIndex].path);
  };

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-serif-title text-4xl sm:text-5xl font-bold text-[#2C190B] tracking-tight">
          How to Play &amp; Enjoy
        </h1>
        <p className="text-xl sm:text-2xl text-[#5E432C] leading-relaxed">
          Daily Mind Games is built with simplicity, kindness, and comfort at its core.
        </p>
      </div>

      {/* Visual Walkthrough - 5 Platform Steps */}
      <div className="space-y-6 sm:space-y-8">
        {/* Step 1 */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF4E6] border-2 border-[#DBC6A3] space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl wood-texture text-[#FFFDF9] flex items-center justify-center font-serif-title font-bold text-2xl shadow-sm">
              1
            </div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2E1A0C]">
              Step 1: Choose a Game
            </h2>
          </div>
          <p className="text-xl text-[#5C4129] leading-relaxed">
            Pick from different activities focused on memory, attention, observation, and recall.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF4E6] border-2 border-[#DBC6A3] space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl wood-texture text-[#FFFDF9] flex items-center justify-center font-serif-title font-bold text-2xl shadow-sm">
              2
            </div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2E1A0C]">
              Step 2: Choose Your Difficulty
            </h2>
          </div>
          <p className="text-xl text-[#5C4129] leading-relaxed">
            Every game starts on Easy. Move to Medium or Hard when you feel ready.
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF4E6] border-2 border-[#DBC6A3] space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl wood-texture text-[#FFFDF9] flex items-center justify-center font-serif-title font-bold text-2xl shadow-sm">
              3
            </div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2E1A0C]">
              Step 3: Observe the Challenge
            </h2>
          </div>
          <p className="text-xl text-[#5C4129] leading-relaxed">
            Depending on the activity, you may:
          </p>
          <ul className="space-y-2.5 pl-2 text-lg sm:text-xl text-[#5C4129]">
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5829] shrink-0" />
              <span>Remember wooden tiles</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5829] shrink-0" />
              <span>Follow a sequence</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5829] shrink-0" />
              <span>Observe arrows</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5829] shrink-0" />
              <span>Remember a locker code</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5829] shrink-0" />
              <span>Complete other future challenges</span>
            </li>
          </ul>
        </div>

        {/* Step 4 */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF4E6] border-2 border-[#DBC6A3] space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl wood-texture text-[#FFFDF9] flex items-center justify-center font-serif-title font-bold text-2xl shadow-sm">
              4
            </div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2E1A0C]">
              Step 4: Respond at Your Pace
            </h2>
          </div>
          <p className="text-xl text-[#5C4129] leading-relaxed">
            Tap tiles, choose an answer, repeat a sequence, or enter what you remember.
          </p>
        </div>

        {/* Step 5 */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF4E6] border-2 border-[#DBC6A3] space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl wood-texture text-[#FFFDF9] flex items-center justify-center font-serif-title font-bold text-2xl shadow-sm">
              5
            </div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2E1A0C]">
              Step 5: Build Your Score
            </h2>
          </div>
          <p className="text-xl text-[#5C4129] leading-relaxed">
            Earn points, build streaks, and try to improve your own personal best.
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button
          variant="wood"
          size="xl"
          onClick={handleStartPlaying}
          icon={<Play className="w-6 h-6 fill-current" />}
          className="w-full sm:w-auto shadow-md"
        >
          Start Playing
        </Button>
        <Button
          variant="secondary"
          size="xl"
          onClick={() => onNavigate('/games')}
          icon={<Compass className="w-6 h-6" />}
          className="w-full sm:w-auto"
        >
          Explore All Games
        </Button>
      </div>
    </div>
  );
};
